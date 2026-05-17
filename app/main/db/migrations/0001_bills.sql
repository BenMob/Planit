CREATE TABLE `bills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount_due` real NOT NULL,
	`due_date` integer NOT NULL,
	`last_paid_amount` real,
	`last_paid_date` text,
	`auto_pay` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
