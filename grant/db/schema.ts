import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

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
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [index("idx_grants_priority").on(table.priority)],
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
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
    updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [index("idx_grant_applications_grant_id").on(table.grantId)],
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
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [index("idx_grant_application_events_application_id").on(table.grantApplicationId)],
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
    createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  },
  (table) => [index("idx_grant_application_artifacts_application_id").on(table.grantApplicationId)],
);
