PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_emailVerification` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`active` integer DEFAULT true,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_emailVerification`("id", "userId", "code", "expiresAt", "active") SELECT "id", "userId", "code", "expiresAt", "active" FROM `emailVerification`;--> statement-breakpoint
DROP TABLE `emailVerification`;--> statement-breakpoint
ALTER TABLE `__new_emailVerification` RENAME TO `emailVerification`;--> statement-breakpoint
PRAGMA foreign_keys=ON;