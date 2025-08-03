CREATE TABLE `emailVerification` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` text NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`active` integer DEFAULT true
);
