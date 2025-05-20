import { create } from "domain";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

// interface FormDataState {
//     email: string;
//     matriculation_number: string;
//     surname: string;
//     firstname: string;
//     middlename: string;
//     sex: string;
//     department: string;
//     course_of_study: string;
//     year_of_graduation: string;
//     class_of_degree: string;
//     degree_awarded: string;
//     reference_number: string;
//     recipient_address: string;
//     mode_of_postage: string;
//     recipient_email: string;
//     remita_rrr: string;
//     certificate_file: File | null;
//     payment_receipt_file: File | null;
// }

export const application = sqliteTable("application", {
    _id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    surname: text("surname").notNull(),
    firstname: text("firstname").notNull(),
    middlename: text("middlename"),
    sex: text("sex", { enum: ["male", "female"] }).notNull(),
    matriculation_number: text("matriculation_number").notNull(),
    department: text("department").notNull(),
    course_of_study: text("course_of_study").notNull(),
    year_of_graduation: text("year_of_graduation").notNull(),
    class_of_degree: text("class_of_degree").notNull(),
    degree_awarded: text("degree_awarded").notNull(),
    reference_number: text("reference_number"),
    recipient_address: text("recipient_address").notNull(),
    mode_of_postage: text("mode_of_postage").notNull(),
    recipient_email: text("recipient_email"), // could be null if mode_of_postage is not email
    remita_rrr: text("remita_rrr").notNull(),
    certificate_file: text("certificate_file").notNull(),
    payment_receipt_file: text("payment_receipt_file").notNull(),
});

export const applicationHash = sqliteTable("application_hash", {
    _id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    application_id: text("application_id").notNull().references(() => application._id),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull(),
    processed_document_link: text("processed_document_link"),
    created_at: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    updated_at: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
    approved_by: text("approved_by").references(() => user.id),
    approved_at: integer("approved_at", { mode: "timestamp_ms" }),
    reason: text("reason"),
});