PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_emailVerification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_emailVerification`("id", "code", "expiresAt", "userId", "createdAt") SELECT "id", "code", "expiresAt", "userId", "createdAt" FROM `emailVerification`;--> statement-breakpoint
DROP TABLE `emailVerification`;--> statement-breakpoint
ALTER TABLE `__new_emailVerification` RENAME TO `emailVerification`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`device` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "userId", "expiresAt", "ipAddress", "device", "createdAt") SELECT "id", "userId", "expiresAt", "ipAddress", "device", "createdAt" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` integer;