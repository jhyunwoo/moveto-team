CREATE TABLE `accounts` (
	`userId` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`email` text,
	`emailVerification` integer,
	`picture` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `emailVerification` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`active` integer DEFAULT true,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_table` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`expiresAt` integer,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_table` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerification` integer,
	`passwordHash` text,
	`createdAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_table_email_unique` ON `user_table` (`email`);