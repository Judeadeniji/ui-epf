import { db } from '@/drizzle/db';
import { application, applicationHash } from '@/drizzle/schema';
import { Hono, MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { count, eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { Session, User } from 'better-auth';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import { EmailBody } from '@/components/email-body';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = 'University of Ibadan <test@ui-epf.onrender.com>';

// Helper function to save files
const saveFile = async (file: File, subfolder: string): Promise<string | undefined> => {
    if (!file || file.size === 0) return undefined;

    try {
        // Ensure the base 'public/uploads' directory exists relative to the project root
        const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const uploadsDir = path.join(baseUploadsDir, subfolder);
        
        await fs.mkdir(uploadsDir, { recursive: true }); // Ensure specific subfolder directory exists

        // Sanitize filename to prevent path traversal and other issues
        const sanitizedFileName = path.basename(file.name);
        const filePath = path.join(uploadsDir, sanitizedFileName);
        
        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));

        // Return the public path for the file
        return `/uploads/${subfolder}/${sanitizedFileName}`;
    } catch (error) {
        console.error(`Failed to save file ${file.name}:`, error);
        return undefined;
    }
};

const verifyAuth: MiddlewareHandler<{
    Variables: {
        session: {
            user: User;
            session: Session;
        }
    }
}> = async (c, next) => {
    const headers = c.req.raw.headers;
    const session = await auth.api.getSession({
        headers
    });

    if (!session) {
        return c.json({
            status: false,
            message: "Unauthorized",
        }, 401);
    }

    c.set("session", session);
    return next();
}

const server = new Hono().basePath('/api/v1')

    .onError((err, c) => {
        if (err instanceof HTTPException) {
            return c.json({
                status: false,
                message: err.message,
            }, err.status);
        }

        return c.json({
            status: false,
            message: err.message,
        }, 500);
    })

    .get("/applications", verifyAuth, async (c) => {
        const applications = await db.select().from(applicationHash).innerJoin(application, eq(applicationHash.application_id, application._id));
        return c.json({
            status: true,
            data: applications,
        })
    })

    .post("/applications", zValidator("form", z.object({
        certificate_file: z.instanceof(File),
        payment_receipt_file: z.instanceof(File),
        email: z.string().email(),
        surname: z.string().min(1, "Surname is required"),
        firstname: z.string().min(1, "First name is required"),
        middlename: z.string().optional(),
        class_of_degree: z.string().min(1, "Class of degree is required"),
        course_of_study: z.string().min(1, "Course of study is required"),
        degree_awarded: z.string().min(1, "Degree awarded is required"),
        mode_of_postage: z.string().min(1, "Mode of postage is required"),
        recipient_address: z.string().min(1, "Recipient address is required"),
        recipient_email: z.string().email("Invalid email address").optional(),
        remita_rrr: z.string().min(1, "Remita RRR is required"),
        reference_number: z.string().optional(),
        department: z.string().min(1, "Department is required"),
        matriculation_number: z.string().min(1, "Matriculation number is required"),
        year_of_graduation: z.string().min(1, "Year of graduation is required"),
        sex: z.enum(["male", "female"], {
            errorMap: (issue, _ctx) => {
                return { message: "Please select a valid gender" };
            }
        }),
    })), async (c) => {
        const { certificate_file, payment_receipt_file, ...formData } = c.req.valid("form");

        try {
            const fieldErrors: Record<string, string> = {};

            if (!certificate_file) {
                fieldErrors.certificate_file = "Certificate file is required.";
            } else if (certificate_file.size === 0) {
                fieldErrors.certificate_file = "Certificate file cannot be empty.";
            }

            if (!payment_receipt_file) {
                fieldErrors.payment_receipt_file = "Payment receipt file is required.";
            } else if (payment_receipt_file.size === 0) {
                fieldErrors.payment_receipt_file = "Payment receipt file cannot be empty.";
            }

            if (Object.keys(fieldErrors).length > 0) {
                return c.json({ success: false, error: "Validation failed. Please check the highlighted fields.", fieldErrors }, 400);
            }

            // Actual file upload logic
            const certificateFilePath = await saveFile(certificate_file, 'certificates');
            const paymentReceiptFilePath = await saveFile(payment_receipt_file, 'receipts');

            if (!certificateFilePath) {
                fieldErrors.certificate_file = "Failed to upload certificate file.";
            }
            if (!paymentReceiptFilePath) {
                fieldErrors.payment_receipt_file = "Failed to upload payment receipt file.";
            }

            if (Object.keys(fieldErrors).length > 0) {
                return c.json({ success: false, error: "File upload failed. Please check the highlighted fields and try again.", fieldErrors }, 400);
            }

            const result = await db.transaction(async (tx) => {
                const applicationInsertResult = await tx.insert(application).values({
                    ...formData,
                    certificate_file: certificateFilePath!,
                    payment_receipt_file: paymentReceiptFilePath!,
                }).returning({
                    id: application._id,
                }).get();

                if (!applicationInsertResult || !applicationInsertResult.id) {
                    throw new Error("Failed to create application record. No ID returned.");
                }

                await tx.insert(applicationHash).values({
                    application_id: applicationInsertResult.id,
                    status: "pending",
                });

                // Send email on successful application
                const applicantName = `${formData.firstname} ${formData.surname}`;
                const emailSubject = "Application Submitted Successfully";
                const emailBodyContent = EmailBody({
                    decision: "submit", // Using a new type or adapting existing for submission
                    applicantName,
                    appUrl: process.env.NEXT_PUBLIC_APP_URL
                });

                try {
                    const { error: emailError } = await resend.emails.send({
                        from: EMAIL_FROM,
                        to: formData.email, // Send to the applicant's email
                        subject: emailSubject,
                        react: EmailTemplate({
                            name: applicantName,
                            subject: emailSubject,
                            body: await emailBodyContent,
                            companyName: "University of Ibadan",
                            logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/UI_logo.png`,
                            previewText: "Your application has been received.",
                        })
                    });

                    if (emailError) {
                        return c.json({
                            success: true,
                            message: `Application submitted successfully! However, there was an error sending the confirmation email.`,
                            error: emailError.message,
                            fieldErrors: {}
                        });
                    }
                } catch (e) {
                    return c.json({
                        success: true,
                        message: `Application submitted successfully! However, there was an error sending the confirmation email.`,
                        error: (e as Error).message,
                        fieldErrors: {}
                    });
                }

                return c.json(
                    {
                        success: true,
                        message: `Application submitted successfully!`,
                        error: null,
                        fieldErrors: {}
                    }
                )
            });
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during submission.";
            return c.json({
                success: false,
                error: `Submission Error: ${errorMessage}`,
                fieldErrors: {}
            }, 500);
        }
    })

    .get("/applications/stats", verifyAuth, async (c) => {
        try {
            const totalApplications = await db.select({ value: count() }).from(applicationHash).get({ value: 0 });
            const pendingApplications = await db.select({ value: count() }).from(applicationHash).where(eq(applicationHash.status, "pending")).get({ value: 0 });
            const approvedApplications = await db.select({ value: count() }).from(applicationHash).where(eq(applicationHash.status, "approved")).get({ value: 0 });

            console.log({
                totalApplications,
                pendingApplications,
                approvedApplications,
            })

            return c.json({
                status: true,
                data: {
                    total: totalApplications?.value || 0,
                    pending: pendingApplications?.value || 0,
                    approved: approvedApplications?.value || 0,
                }
            });
        } catch (error) {
            return c.json({
                status: false,
                error: "Failed to fetch application stats",
            }, 500);
        }
    })
    .get("/applications/:id", verifyAuth, async (c) => {
        const id = c.req.param("id");
        if (!id) {
            return c.json({
                status: false,
                error: "Missing application ID",
            }, 400);
        }

        const applicationData = await db.select().from(applicationHash).where(eq(applicationHash.application_id, id)).innerJoin(application, eq(applicationHash.application_id, application._id)).get();
        if (!applicationData) {
            return c.json({
                status: false,
                error: "Application not found",
            }, 404);
        }

        return c.json({
            status: true,
            data: applicationData,
        })
    })

    .post("/applications/:id", verifyAuth, async (c) => {
        const id = c.req.param("id");
        const { user } = c.var.session;
        if (!id) {
            return c.json(
                {
                    status: false,
                    error: "Missing application ID",
                },
                400
            );
        }
        const formBody = await c.req.parseBody({
            dot: true,
        });

        const decision = formBody.decision as string;
        const feedback = formBody.feedback as string | undefined;
        const docFile = formBody['doc-upload'] as File | undefined;

        if (decision !== "approve" && decision !== "reject") {
            return c.json(
                {
                    status: false,
                    error: "Invalid decision",
                },
                400
            );
        }

        let processedDocumentLink: string | undefined = undefined;
        if (decision === "approve" && docFile) {
            if (docFile.size === 0) {
                return c.json(
                    {
                        status: false,
                        error: "Uploaded document file cannot be empty.",
                    },
                    400
                );
            }
            processedDocumentLink = await saveFile(docFile, 'processed_documents');
            if (!processedDocumentLink) {
                return c.json(
                    {
                        status: false,
                        error: "Failed to upload processed document.",
                    },
                    500
                );
            }
            console.log(`Uploaded processed document to: ${processedDocumentLink}`);
        }

        const updatedApplicationHash = await db
            .update(applicationHash)
            .set({
                status: decision === "approve" ? "approved" : "rejected",
                approved_by: user.id,
                reason: feedback,
                processed_document_link: processedDocumentLink,
            })
            .where(eq(applicationHash.application_id, id))
            .returning()
            .get();

        if (!updatedApplicationHash) {
            return c.json(
                {
                    status: false,
                    error: "Application not found or failed to update",
                },
                404
            );
        }

        const appDetails = await db
            .select({
                email: application.email,
                firstname: application.firstname,
                surname: application.surname,
                mode_of_postage: application.mode_of_postage,
                recipient_email: application.recipient_email,
            })
            .from(application)
            .where(eq(application._id, id))
            .get();

        if (!appDetails) {
            console.error(`Failed to fetch details for application ID: ${id} after update.`);
        } else {
            const applicantName = `${appDetails.firstname} ${appDetails.surname}`;
            const recipientEmail = appDetails.recipient_email;

            let emailSubject = '';

            const emailBodyContent = EmailBody({
                decision: decision as 'approve' | 'reject',
                applicantName,
                feedback,
                modeOfPostage: appDetails.mode_of_postage,
                processedDocumentLink,
                appUrl: process.env.NEXT_PUBLIC_APP_URL
            });

            if (decision === "approve") {
                emailSubject = "Your Application has been Approved";
            } else {
                emailSubject = "Update on Your Application";
            }

            if (appDetails.mode_of_postage.toLowerCase() === "email" && recipientEmail) {
                try {
                    const { data, error: emailError } = await resend.emails.send({
                        from: EMAIL_FROM,
                        to: recipientEmail,
                        subject: emailSubject,
                        react: EmailTemplate({
                            name: applicantName,
                            subject: emailSubject,
                            body: await emailBodyContent,
                            companyName: "University of Ibadan",
                            logoUrl: `${process.env.NEXT_PUBLIC_APP_URL}/UI_logo.png`,
                            previewText: emailSubject,
                        })
                    });

                    if (emailError) {
                        console.error("Resend API Error:", emailError);
                    } else {
                        console.log("Email sent successfully:", data);
                    }
                } catch (e) {
                    console.error("Failed to send email:", e);
                }
            } else if (appDetails.mode_of_postage.toLowerCase() === "email" && !recipientEmail) {
                console.warn(`Application ${id} has mode of postage EMAIL but no recipient_email. Skipping email.`);
            }
        }

        return c.json({
            status: true,
            data: updatedApplicationHash,
        });
    })

export type Server = typeof server;
export { server }