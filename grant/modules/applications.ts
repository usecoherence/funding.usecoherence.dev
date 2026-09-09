import type { Db } from "../db/index.js";
import { grantApplications } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface NewGrantApplication {
  grantId: number;
  amount?: number | null;
  currency?: string | null;
  status?:
    | "created"
    | "draft"
    | "submitted"
    | "in_discussion"
    | "rejected"
    | "accepted"
    | "awaiting_payout"
    | "funded";
}

export function addApplication(db: Db, input: NewGrantApplication) {
  const result = db
    .insert(grantApplications)
    .values({
      grantId: input.grantId,
      amount: input.amount ?? null,
      currency: input.currency ?? null,
      status: input.status ?? "created",
    })
    .returning()
    .get();
  return result;
}

export function getApplication(db: Db, id: number) {
  return db.select().from(grantApplications).where(eq(grantApplications.id, id)).get();
}

export function listApplications(db: Db) {
  return db.select().from(grantApplications).all();
}
