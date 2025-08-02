ALTER TABLE `session` RENAME TO `sessions`;--> statement-breakpoint
ALTER TABLE `user` RENAME TO `users`;--> statement-breakpoint
ALTER TABLE `sessions` RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE `sessions` RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN "username" TO "userName";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`device` text,
	`createdAt` text,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "userId", "expiresAt", "ipAddress", "device", "createdAt") SELECT "id", "userId", "expiresAt", "ipAddress", "device", "createdAt" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `user_id_unique`;--> statement-breakpoint
DROP INDEX `github_id_index`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`userName` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "userName") SELECT "id", "email", "password", "userName" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;