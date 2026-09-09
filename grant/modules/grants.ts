import type { Db } from "../db/index.js";
import { grants } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface NewGrant {
  name: string;
  programUrl?: string | null;
  priority?: number;
  fit?: "unknown" | "high" | "medium" | "low";
  eligibility?: "unknown" | "eligible" | "ineligible" | "needs_verification";
  deadline?: string | null;
}

export function addGrant(db: Db, input: NewGrant) {
  const result = db
    .insert(grants)
    .values({
      name: input.name,
      programUrl: input.programUrl ?? null,
      priority: input.priority ?? 3,
      fit: input.fit ?? "unknown",
      eligibility: input.eligibility ?? "unknown",
      deadline: input.deadline ?? null,
    })
    .returning()
    .get();
  return result;
}

export function getGrant(db: Db, id: number) {
  return db.select().from(grants).where(eq(grants.id, id)).get();
}

export function listGrants(db: Db) {
  return db.select().from(grants).all();
}
