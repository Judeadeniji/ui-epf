import { db } from '@/drizzle/db';
import { application, applicationHash, user } from '@/drizzle/schema';
import { Hono, MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { count, desc, eq, getTableColumns, isNull, or, sql } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import { EmailBody } from '@/components/email-body';
import fs from 'fs/promises';
import path from 'path';
import { ApplicationFilter, Session, User } from '@/lib/types';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = 'University of Ibadan <test@ui-epf.onrender.com>';

// Helper function to save files (assuming this remains unchanged and correct)
const saveFile = async (file: File, subfolder: string): Promise<string | undefined> => {
    if (!file || file.size === 0) return undefined;

    console.log(file);

    try {
        const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const uploadsDir = path.join(baseUploadsDir, subfolder);

        await fs.mkdir(uploadsDir, { recursive: true });

        const sanitizedFileName = path.basename(file.name);
        const filePath = path.join(uploadsDir, sanitizedFileName);

        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(arrayBuffer));

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
            message: auth.$ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND,
        }, 401);
    }

    if (session.user.banned) {
        return c.json({
            status: false,
            message: auth.$ERROR_CODES.BANNED_USER
        })
    }

    c.set("session", session);
    return next();
}

const server = new Hono().basePath('/api/v1')

    .onError((err, c) => {
        if (err instanceof HTTPException) {
            return c.json({
                status: false as const,
                error: err.message,
                message: err.message,
            }, err.status);
        }

        return c.json({
            status: false as const,
            error: "Internal Server Error",
            message: err.message,
        }, 500);
    })

    .get("/applications", verifyAuth, zValidator("query", z.object({
        page: z.coerce.number().int().min(1).optional().default(1),
        pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
        filters: z.string().optional().transform((val) => {
            if (val) {
                try {
                    return JSON.parse(val) as ApplicationFilter[];
                } catch (e) {
                    console.error("Failed to parse filters:", e);
                    return [];
                }
            }
            return [];
        }),
    })), async (c) => {
        const { page, pageSize, filters } = c.req.valid("query");
        const offset = (page - 1) * pageSize;

        let query = db.select({
            application: application,
            application_hash: applicationHash
        })
            .from(applicationHash)
            .innerJoin(application, eq(applicationHash.application_id, application._id))
            .orderBy(desc(applicationHash.created_at))
            .limit(pageSize)
            .offset(offset)
            .$dynamic();

        let totalQuery = db.select({ count: count() })
            .from(applicationHash)
            .innerJoin(application, eq(applicationHash.application_id, application._id))
            .$dynamic();

        const conditions = [];

        if (filters && filters.length > 0) {
            for (const filter of filters) {
                switch (filter.field) {
                    case "status":
                        conditions.push(eq(applicationHash.status, filter.value as "pending" | "pre-approved" | "approved" | "rejected"));
                        break;
                    case "course_of_study":
                        conditions.push(eq(application.course_of_study, filter.value));
                        break;
                    case "faculty":
                        conditions.push(eq(application.faculty, filter.value));
                        break;
                    case "applicantName":
                        conditions.push(sql`(${application.firstname} LIKE ${'%' + filter.value + '%'} OR ${application.surname} LIKE ${'%' + filter.value + '%'})`);
                        break;
                    case "matriculationNumber":
                        conditions.push(eq(application.matriculation_number, filter.value));
                        break;
                    // Add more cases for other filterable fields from your schema
                }
            }
        }

        if (conditions.length > 0) {
            query = query.where(sql.join(conditions, sql` AND `));
            totalQuery = totalQuery.where(sql.join(conditions, sql` AND `));
        }

        const [applicationsResult, totalRecordsResult] = await Promise.all([
            query.all(),
            totalQuery.get()
        ]);

        const totalItems = totalRecordsResult?.count ?? 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        return c.json({
            status: true as const,
            data: applicationsResult,
            meta: {
                totalItems,
                totalPages,
                currentPage: page,
                pageSize: pageSize,
            }
        });
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
        faculty: z.string().min(1, "Faculty of study is required"),
        mode_of_postage: z.enum(["email", "hand_collection", "delivery"], {
            errorMap: (issue, _ctx) => {
                return { message: "Please select a valid mode of postage" };
            }
        }),
        postage_address: z.string().min(1, "Postage address is required").optional(),
        recipient_email: z.string().email("Invalid email address").optional(),
        remita_rrr: z.string().min(1, "Remita RRR is required"),
        reference_number: z.string().optional(),
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
                        // This might be a good place to log the error but still return success for the application submission
                        // if email sending is not critical path. If it IS critical, throw error here.
                        console.error("Resend API Error (Application Submission Confirmation):", emailError);
                        return c.json({
                            success: true,
                            message: `Application submitted successfully! However, there was an error sending the confirmation email.`,
                            error: emailError.message,
                            fieldErrors: {}
                        });
                    }
                } catch (e) {
                    console.error("Failed to send email (Application Submission Confirmation):", e);
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
            const isAdmin = c.var.session.user.role === "admin";
            const totalApplications = await db.select({ value: count() }).from(applicationHash).get({ value: 0 });
            const pendingApplications = await db.select({ value: count() }).from(applicationHash).where(eq(applicationHash.status, "pending")).get({ value: 0 });
            const approvedApplications = await db.select({ value: count() }).from(applicationHash).where(eq(applicationHash.status, "approved")).get({ value: 0 });
            const totalUsers = isAdmin ? await db.select({ value: count() }).from(user).get({ value: 0 }) : undefined;

            return c.json({
                status: true,
                data: {
                    totalUsers: isAdmin ? totalUsers?.value || 0 : undefined,
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

        const t_app = getTableColumns(application);
        const t_appHash = getTableColumns(applicationHash);
        const applicationData = await db.select({
            application_hash: {
                ...t_appHash,
                approved_by: user.name, // Select user.name if joining with user table
            },
            application: t_app,
        }).from(applicationHash).where(eq(applicationHash.application_id, id)).innerJoin(application, eq(applicationHash.application_id, application._id))
            .leftJoin(user,
                eq(applicationHash.approved_by, user.id),
            )
            .get();


        if (!applicationData) {
            return c.json({
                status: false,
                error: "Application not found",
            }, 404);
        }

        // Add authorization check here if needed
        // if (!c.var.session.user.role === "admin" && applicationData.application._id !== c.var.session.user.id_of_applicant_field) {
        //   return c.json({ status: false, error: "Unauthorized" }, 403);
        // }

        return c.json({
            status: true,
            data: applicationData,
        })
    })

    .post("/applications/:id", verifyAuth, async (c) => {
        const id = c.req.param("id");
        const { user } = c.var.session;
        const isAdmin = user.role === "admin";

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

        const decision = formBody.decision as "approved" | "pre-approved" | "rejected";
        const feedback = formBody.feedback as string | undefined;
        const docFile = formBody['doc-upload'] as File | undefined;

        // --- Step 1: Fetch current application status and approver ---
        const currentApplicationHash = await db
            .select({
                status: applicationHash.status,
                approved_by: applicationHash.approved_by,
                approved_at: applicationHash.approved_at,
                processed_document_link: applicationHash.processed_document_link,
            })
            .from(applicationHash)
            .where(eq(applicationHash.application_id, id))
            .get();

        if (!currentApplicationHash) {
            return c.json({
                status: false,
                error: "Application not found",
            }, 404);
        }

        // --- Step 2: Implement role-based access control and state transitions ---
        // An admin can change status to anything.
        // A non-admin can only change to "pre-approved" or "rejected".
        if (!isAdmin && !["pre-approved", "rejected"].includes(decision)) {
            return c.json(
                {
                    status: false,
                    error: `Invalid decision for non-admin user: ${decision}. Only 'pre-approved' or 'rejected' are allowed.`,
                },
                403 // Use 403 Forbidden for authorization issues
            );
        }

        // Additional check for state transitions based on existing status
        if (currentApplicationHash.status === "approved" && decision !== "approved") {
            // If already approved, prevent changing to any other status (unless specific re-opening logic is needed)
            return c.json({
                status: false,
                error: "Application is already approved and cannot be changed.",
            }, 400); // Bad Request
        }

        // If pre-approved, ensure only 'approved' or 'rejected' is allowed as next step
        if (currentApplicationHash.status === "pre-approved" && !["approved", "rejected"].includes(decision)) {
            return c.json({
                status: false,
                error: `Application is pre-approved. Only 'approved' or 'rejected' decisions are allowed.`,
            }, 400);
        }

        // --- Step 3: Handle processed document upload ---
        let processedDocumentLink: string | undefined = undefined;
        // The document is only uploaded if the decision is 'pre-approved'
        if (decision === "pre-approved" && docFile) {
            if (docFile.size === 0) {
                return c.json(
                    {
                        status: false,
                        error: "Uploaded document file cannot be empty.",
                    },
                    400
                );
            }
            // IMPORTANT: Replace this placeholder with the actual file saving logic
            processedDocumentLink = await saveFile(docFile, 'processed_documents');
            // processedDocumentLink = "___/tests"; // Keep this line for testing only if file saving is mocked

            if (!processedDocumentLink) {
                return c.json(
                    {
                        status: false,
                        error: "Failed to upload processed document. Please try again.",
                    },
                    500
                );
            }
            console.log(`Uploaded processed document to: ${processedDocumentLink}`);
        } else if (decision === "pre-approved" && !docFile) {
            // If decision is pre-approved, a document file is required
            return c.json(
                {
                    status: false,
                    error: "A processed document file is required for 'pre-approved' status.",
                },
                400
            );
        }

        // --- Step 4: Prepare update data for Drizzle ORM ---
        const updateData: Partial<typeof applicationHash.$inferInsert> = {
            status: decision,
            reason: feedback,
        };

        // Conditionally set `approved_by` and `approved_at`
        if (decision === "pre-approved" && currentApplicationHash.status === "pending") {
            // Only set approved_by and approved_at if moving from pending to pre-approved
            updateData.approved_by = user.id;
            updateData.approved_at = new Date();
            updateData.processed_document_link = processedDocumentLink; // Set only on pre-approval
        } else if (decision === "approved" && currentApplicationHash.status === "pre-approved") {
            // When moving from pre-approved to approved, retain the original approved_by
            // Do not update `approved_by` or `approved_at` unless specifically needed for "final approval" tracking
            // For now, we keep the original pre-approver as the primary 'approved_by' record.
            // If you need a separate 'final_approved_by', you'd add a new column to the schema.
            // The `processed_document_link` should also be retained from the pre-approval step.
            updateData.approved_by = currentApplicationHash.approved_by; // Retain previous approver
            updateData.approved_at = currentApplicationHash.approved_at; // Retain previous approved_at
            updateData.processed_document_link = currentApplicationHash.processed_document_link || processedDocumentLink; // Retain existing or set if newly pre-approved
        } else if (decision === "rejected") {
            // For rejection, you might clear `approved_by` and `approved_at`, or leave them as is,
            // depending on if you want to track who rejected it versus who approved it.
            // For now, let's set them to the current user and current time for rejection.
            updateData.approved_by = user.id;
            updateData.approved_at = new Date(); // Rejection timestamp
            updateData.processed_document_link = null; // Clear document link on rejection
        }
        // If the decision is 'approved' (and not coming from 'pre-approved'), then `approved_by` should be the current user
        else if (decision === "approved" && currentApplicationHash.status === "pending") {
            updateData.approved_by = user.id;
            updateData.approved_at = new Date();
            updateData.processed_document_link = processedDocumentLink; // If directly approved with a document
        }


        // --- Step 5: Perform the database update ---
        const updatedApplicationHash = await db
            .update(applicationHash)
            .set(updateData)
            .where(eq(applicationHash.application_id, id))
            .returning()
            .get();

        if (!updatedApplicationHash) {
            return c.json(
                {
                    status: false,
                    error: "Application not found or failed to update.",
                },
                404
            );
        }

        // --- Step 6: Send email notification ---
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
            // This is a weird state, but the application hash was updated, so we still return success.
            // Consider if this should be an error or a warning.
            return c.json({
                status: true,
                message: `Application updated successfully, but couldn't fetch applicant details for email.`,
                data: updatedApplicationHash,
            });
        } else {
            const applicantName = `${appDetails.firstname} ${appDetails.surname}`;
            const recipientEmail = appDetails.recipient_email;

            let emailSubject = '';

            const emailBodyContent = EmailBody({
                decision: decision as 'approve' | 'reject', // Pass actual decision for email template logic
                applicantName,
                feedback,
                modeOfPostage: appDetails.mode_of_postage,
                processedDocumentLink: updatedApplicationHash.processed_document_link!, // Use the link from the updated hash
                appUrl: process.env.NEXT_PUBLIC_APP_URL
            });

            if (decision === "approved") {
                emailSubject = "Your Application has been Approved";
            } else if (decision === "pre-approved") {
                emailSubject = "Your Application has been Pre-Approved";
            }
            else {
                emailSubject = "Update on Your Application: Action Required"; // For rejected or other states
            }

            // Decide who to send the email to based on mode_of_postage
            // Always send to applicant's primary email, and if mode is 'email', also to recipient_email
            const recipients = [appDetails.email]; // Always send to the main applicant email
            if (appDetails.mode_of_postage.toLowerCase() === "email" && recipientEmail) {
                if (!recipients.includes(recipientEmail)) { // Avoid duplicates
                    recipients.push(recipientEmail);
                }
            }

            if (recipients.length > 0) {
                try {
                    const { data, error: emailError } = await resend.emails.send({
                        from: EMAIL_FROM,
                        to: process.env.NODE_ENV === "development" ? "delivered@resend.dev" : recipients,
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
                        console.error("Resend API Error (Application Status Update):", emailError);
                        // Log the error but don't prevent successful response if email is non-critical
                    } else {
                        console.log("Email sent successfully:", data);
                    }
                } catch (e) {
                    console.error("Failed to send email (Application Status Update):", e);
                    // Log the error but don't prevent successful response if email is non-critical
                }
            } else {
                console.warn(`No valid email recipients found for application ${id}. Skipping email.`);
            }
        }

        return c.json({
            status: true,
            data: updatedApplicationHash,
            message: "Application status updated successfully."
        });
    })
    .get("/users/:userId", verifyAuth, async (c) => {
        const userId = c.req.param("userId");
        if (!userId) {
            return c.json({
                status: false,
                error: "Missing user ID",
            }, 400);
        }

        // Authorization check: Only allow admin or the user themselves to view their profile
        const sessionUser = c.var.session.user;
        if (sessionUser.role !== "admin" && sessionUser.id !== userId) {
            return c.json({
                status: false,
                error: "Unauthorized to view this user's profile.",
            }, 403);
        }

        // Fetch the user details first
        const userDetails = await db.select(getTableColumns(user))
            .from(user)
            .where(eq(user.id, userId))
            .get();

        let userData;

        if (userDetails) {
            // Fetch all applications that this user approved or pre-approved
            const approvedApplicationsList = await db.select({
                application: getTableColumns(application),
                applicationHash: getTableColumns(applicationHash)
            })
                .from(applicationHash)
                .innerJoin(application, eq(applicationHash.application_id, application._id))
                .where(
                    sql.join([
                        eq(applicationHash.approved_by, userId),
                        or( // Check if the status is 'approved' or 'pre-approved'
                            eq(applicationHash.status, "approved"),
                            eq(applicationHash.status, "pre-approved")
                        )
                    ], sql` AND `)
                )
                .orderBy(desc(applicationHash.approved_at)) // Order by the approval date
                .all();

            userData = {
                ...userDetails,
                approvedApplications: approvedApplicationsList
            };
        }

        if (!userData) {
            return c.json({
                status: false,
                error: "User not found",
            }, 404);
        }
        return c.json({
            status: true,
            data: userData,
        }, 200);
    })

export type Server = typeof server;
export { server }