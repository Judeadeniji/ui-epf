CREATE TABLE `application` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`surname` text NOT NULL,
	`firstname` text NOT NULL,
	`middlename` text,
	`sex` text NOT NULL,
	`course_of_study` text NOT NULL,
	`year_of_graduation` text NOT NULL,
	`class_of_degree` text NOT NULL,
	`degree_awarded` text NOT NULL,
	`reference_number` text NOT NULL,
	`recipient_address` text NOT NULL,
	`mode_of_postage` text NOT NULL,
	`recipient_email` text NOT NULL,
	`remita_rrr` text NOT NULL,
	`certificate_file` text NOT NULL,
	`payment_receipt_file` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `application_hash` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`approved_by` text,
	`approved_at` integer,
	`reason` text,
	FOREIGN KEY (`application_id`) REFERENCES `application`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
