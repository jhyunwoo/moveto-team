CREATE TABLE `count_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`count` integer DEFAULT 0
);
--> statement-breakpoint
DROP TABLE `users_table`;