PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_application` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`surname` text NOT NULL,
	`firstname` text NOT NULL,
	`middlename` text NOT NULL,
	`sex` text NOT NULL,
	`matriculation_number` text NOT NULL,
	`department` text NOT NULL,
	`course_of_study` text NOT NULL,
	`year_of_graduation` text NOT NULL,
	`class_of_degree` text NOT NULL,
	`degree_awarded` text NOT NULL,
	`reference_number` text,
	`recipient_address` text NOT NULL,
	`mode_of_postage` text NOT NULL,
	`recipient_email` text NOT NULL,
	`remita_rrr` text NOT NULL,
	`certificate_file` text NOT NULL,
	`payment_receipt_file` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_application`("id", "email", "surname", "firstname", "middlename", "sex", "matriculation_number", "department", "course_of_study", "year_of_graduation", "class_of_degree", "degree_awarded", "reference_number", "recipient_address", "mode_of_postage", "recipient_email", "remita_rrr", "certificate_file", "payment_receipt_file") SELECT "id", "email", "surname", "firstname", "middlename", "sex", "matriculation_number", "department", "course_of_study", "year_of_graduation", "class_of_degree", "degree_awarded", "reference_number", "recipient_address", "mode_of_postage", "recipient_email", "remita_rrr", "certificate_file", "payment_receipt_file" FROM `application`;--> statement-breakpoint
DROP TABLE `application`;--> statement-breakpoint
ALTER TABLE `__new_application` RENAME TO `application`;--> statement-breakpoint
PRAGMA foreign_keys=ON;