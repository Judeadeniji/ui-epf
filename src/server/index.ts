import { db } from '@/drizzle/db';
import { application, applicationHash } from '@/drizzle/schema';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { count, eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { FormDataState } from '@/lib/utils';

/**
 * We trust NextJS Middleware enough to leave this part of the app unprotected.
 * No Middleware was applied to these routes because NextJS Middleware is already doing a check for us.
 * If this was to get bypassed, it would mean that the NextJS Middleware was bypassed too.
 * So we are safe. Except if there is a bug in NextJS Middleware.
 */

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

    .get("/applications", async (c) => {
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
        recipient_email: z.string().email("Invalid email address"),
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
        const { certificate_file, payment_receipt_file, ...formData} = c.req.valid("form");

        try {

            const fieldErrors: Record<string, string> = {};

            if (!certificate_file) {
                fieldErrors.certificate_file = "Certificate file is required.";
            }
            if (!payment_receipt_file) {
                fieldErrors.payment_receipt_file = "Payment receipt file is required.";
            }

            // --- Placeholder file upload logic ---
            // In a real app, upload files and get their URLs/paths.
            // For now, using placeholders if files exist.
            const certificateFilePath = certificate_file ? `uploads/${certificate_file.name}` : undefined;
            const paymentReceiptFilePath = payment_receipt_file ? `uploads/${payment_receipt_file.name}` : undefined;
            // --- End Placeholder ---


            if (Object.keys(fieldErrors).length > 0) {
                return c.json({ success: false, error: "Validation failed. Please check the highlighted fields.", fieldErrors }, 400);
            }

            const result = await db.transaction(async (tx) => {
                const applicationInsertResult = await tx.insert(application).values({
                    ...formData,
                    certificate_file: `${certificateFilePath}`,
                    payment_receipt_file: `${paymentReceiptFilePath}`,
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

                return c.json(
                    {
                        success: true,
                        applicationId: applicationInsertResult.id,
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

    .get("/applications/stats", async (c) => {
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
    .get("/applications/:id", async (c) => {
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

export type Server = typeof server;
export { server }