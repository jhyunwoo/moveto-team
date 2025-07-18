DROP TABLE `email_verification_request`;--> statement-breakpoint
DROP TABLE `passkey_credential`;--> statement-breakpoint
DROP TABLE `password_reset_session`;--> statement-breakpoint
DROP TABLE `security_key_credential`;--> statement-breakpoint
DROP TABLE `totp_credential`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` integer NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "email", "username") SELECT "id", "email", "username" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_id_unique` ON `user` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `github_id_index` ON `user` (`id`);--> statement-breakpoint
ALTER TABLE `session` DROP COLUMN `two_factor_verified`;