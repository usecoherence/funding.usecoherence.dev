CREATE TABLE `grant_application_artifacts` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_application_id` integer NOT NULL,
	`artifact_type` text NOT NULL CHECK (artifact_type IN ('text', 'url', 'file')),
	`name` text,
	`content` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`grant_application_id`) REFERENCES `grant_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_grant_application_artifacts_application_id` ON `grant_application_artifacts` (`grant_application_id`);--> statement-breakpoint
CREATE TABLE `grant_application_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_application_id` integer NOT NULL,
	`event_type` text NOT NULL CHECK (event_type IN ('status_changed', 'message', 'note', 'payout')),
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`grant_application_id`) REFERENCES `grant_applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_grant_application_events_application_id` ON `grant_application_events` (`grant_application_id`);--> statement-breakpoint
CREATE TABLE `grant_applications` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_id` integer NOT NULL,
	`amount` integer,
	`currency` text,
	`status` text DEFAULT 'created' NOT NULL CHECK (status IN ('created', 'draft', 'submitted', 'in_discussion', 'rejected', 'accepted', 'awaiting_payout', 'funded')),
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`grant_id`) REFERENCES `grants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_grant_applications_grant_id` ON `grant_applications` (`grant_id`);--> statement-breakpoint
CREATE TABLE `grants` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`program_url` text,
	`priority` integer DEFAULT 3 NOT NULL CHECK (priority BETWEEN 1 AND 5),
	`fit` text DEFAULT 'unknown' NOT NULL CHECK (fit IN ('unknown', 'high', 'medium', 'low')),
	`eligibility` text DEFAULT 'unknown' NOT NULL CHECK (eligibility IN ('unknown', 'eligible', 'ineligible', 'needs_verification')),
	`deadline` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_grants_priority` ON `grants` (`priority`);