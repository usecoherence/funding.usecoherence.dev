import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, check } from "drizzle-orm/sqlite-core";

export const grants = sqliteTable(
  "grants",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    programUrl: text("program_url"),
    priority: integer("priority").notNull().default(3),
    fit: text("fit", { enum: ["unknown", "high", "medium", "low"] })
      .notNull()
      .default("unknown"),
    eligibility: text("eligibility", {
      enum: ["unknown", "eligible", "ineligible", "needs_verification"],
    })
      .notNull()
      .default("unknown"),
    deadline: text("deadline"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_grants_priority").on(table.priority),
    check("grants_priority_check", sql`priority BETWEEN 1 AND 5`),
    check("grants_fit_check", sql`fit IN ('unknown', 'high', 'medium', 'low')`),
    check(
      "grants_eligibility_check",
      sql`eligibility IN ('unknown', 'eligible', 'ineligible', 'needs_verification')`,
    ),
  ],
);

export const grantApplications = sqliteTable(
  "grant_applications",
  {
    id: integer("id").primaryKey(),
    grantId: integer("grant_id")
      .notNull()
      .references(() => grants.id, { onDelete: "cascade" }),
    amount: integer("amount"),
    currency: text("currency"),
    status: text("status", {
      enum: [
        "created",
        "draft",
        "submitted",
        "in_discussion",
        "rejected",
        "accepted",
        "awaiting_payout",
        "funded",
      ],
    })
      .notNull()
      .default("created"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_grant_applications_grant_id").on(table.grantId),
    check(
      "grant_applications_status_check",
      sql`status IN ('created', 'draft', 'submitted', 'in_discussion', 'rejected', 'accepted', 'awaiting_payout', 'funded')`,
    ),
  ],
);

export const grantApplicationEvents = sqliteTable(
  "grant_application_events",
  {
    id: integer("id").primaryKey(),
    grantApplicationId: integer("grant_application_id")
      .notNull()
      .references(() => grantApplications.id, { onDelete: "cascade" }),
    eventType: text("event_type", {
      enum: ["status_changed", "message", "note", "payout"],
    }).notNull(),
    payload: text("payload").notNull().default("{}"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_grant_application_events_application_id").on(table.grantApplicationId),
    check(
      "grant_application_events_event_type_check",
      sql`event_type IN ('status_changed', 'message', 'note', 'payout')`,
    ),
  ],
);

export const grantApplicationArtifacts = sqliteTable(
  "grant_application_artifacts",
  {
    id: integer("id").primaryKey(),
    grantApplicationId: integer("grant_application_id")
      .notNull()
      .references(() => grantApplications.id, { onDelete: "cascade" }),
    artifactType: text("artifact_type", {
      enum: ["text", "url", "file"],
    }).notNull(),
    name: text("name"),
    content: text("content"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_grant_application_artifacts_application_id").on(table.grantApplicationId),
    check(
      "grant_application_artifacts_artifact_type_check",
      sql`artifact_type IN ('text', 'url', 'file')`,
    ),
  ],
);
