ALTER TABLE `users_table` RENAME TO `user_table`;--> statement-breakpoint
CREATE TABLE `session_table` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`expiresAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `users_table_email_unique`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_table`("id", "name", "email", "passwordHash") SELECT "id", "name", "email", "passwordHash" FROM `user_table`;--> statement-breakpoint
DROP TABLE `user_table`;--> statement-breakpoint
ALTER TABLE `__new_user_table` RENAME TO `user_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_table_email_unique` ON `user_table` (`email`);