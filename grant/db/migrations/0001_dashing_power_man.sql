ALTER TABLE `grants` ADD `slug` text;--> statement-breakpoint
UPDATE `grants` SET `slug` = 'grant-' || `id` WHERE `slug` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `grants_slug_unique` ON `grants` (`slug`);