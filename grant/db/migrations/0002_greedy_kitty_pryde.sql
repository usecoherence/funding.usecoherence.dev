PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_grant_application_artifacts` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_application_id` integer NOT NULL,
	`artifact_type` text NOT NULL,
	`name` text,
	`content` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`grant_application_id`) REFERENCES `grant_applications`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "grant_application_artifacts_artifact_type_check" CHECK(artifact_type IN ('text', 'url', 'file'))
);
--> statement-breakpoint
INSERT INTO `__new_grant_application_artifacts`("id", "grant_application_id", "artifact_type", "name", "content", "created_at") SELECT "id", "grant_application_id", "artifact_type", "name", "content", "created_at" FROM `grant_application_artifacts`;--> statement-breakpoint
DROP TABLE `grant_application_artifacts`;--> statement-breakpoint
ALTER TABLE `__new_grant_application_artifacts` RENAME TO `grant_application_artifacts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_grant_application_artifacts_application_id` ON `grant_application_artifacts` (`grant_application_id`);--> statement-breakpoint
CREATE TABLE `__new_grant_application_events` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_application_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`grant_application_id`) REFERENCES `grant_applications`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "grant_application_events_event_type_check" CHECK(event_type IN ('status_changed', 'message', 'note', 'payout'))
);
--> statement-breakpoint
INSERT INTO `__new_grant_application_events`("id", "grant_application_id", "event_type", "payload", "created_at") SELECT "id", "grant_application_id", "event_type", "payload", "created_at" FROM `grant_application_events`;--> statement-breakpoint
DROP TABLE `grant_application_events`;--> statement-breakpoint
ALTER TABLE `__new_grant_application_events` RENAME TO `grant_application_events`;--> statement-breakpoint
CREATE INDEX `idx_grant_application_events_application_id` ON `grant_application_events` (`grant_application_id`);--> statement-breakpoint
CREATE TABLE `__new_grant_applications` (
	`id` integer PRIMARY KEY NOT NULL,
	`grant_id` integer NOT NULL,
	`amount` integer,
	`currency` text,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`grant_id`) REFERENCES `grants`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "grant_applications_status_check" CHECK(status IN ('created', 'draft', 'submitted', 'in_discussion', 'rejected', 'accepted', 'awaiting_payout', 'funded'))
);
--> statement-breakpoint
INSERT INTO `__new_grant_applications`("id", "grant_id", "amount", "currency", "status", "created_at", "updated_at") SELECT "id", "grant_id", "amount", "currency", "status", "created_at", "updated_at" FROM `grant_applications`;--> statement-breakpoint
DROP TABLE `grant_applications`;--> statement-breakpoint
ALTER TABLE `__new_grant_applications` RENAME TO `grant_applications`;--> statement-breakpoint
CREATE INDEX `idx_grant_applications_grant_id` ON `grant_applications` (`grant_id`);--> statement-breakpoint
CREATE TABLE `__new_grants` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`program_url` text,
	`priority` integer DEFAULT 3 NOT NULL,
	`fit` text DEFAULT 'unknown' NOT NULL,
	`eligibility` text DEFAULT 'unknown' NOT NULL,
	`deadline` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "grants_priority_check" CHECK(priority BETWEEN 1 AND 5),
	CONSTRAINT "grants_fit_check" CHECK(fit IN ('unknown', 'high', 'medium', 'low')),
	CONSTRAINT "grants_eligibility_check" CHECK(eligibility IN ('unknown', 'eligible', 'ineligible', 'needs_verification'))
);
--> statement-breakpoint
INSERT INTO `__new_grants`("id", "slug", "name", "program_url", "priority", "fit", "eligibility", "deadline", "created_at", "updated_at") SELECT "id", "slug", "name", "program_url", "priority", "fit", "eligibility", "deadline", "created_at", "updated_at" FROM `grants`;--> statement-breakpoint
DROP TABLE `grants`;--> statement-breakpoint
ALTER TABLE `__new_grants` RENAME TO `grants`;--> statement-breakpoint
CREATE UNIQUE INDEX `grants_slug_unique` ON `grants` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_grants_priority` ON `grants` (`priority`);