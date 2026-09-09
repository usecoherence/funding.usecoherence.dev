import { test } from "node:test";
import assert from "node:assert/strict";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createTestDb, closeTestDb } from "./helpers.js";
import { addGrant, getGrant, listGrants } from "../modules/grants.js";
import { addApplication, getApplication, listApplications } from "../modules/applications.js";

test("grant and application round-trip persists", () => {
  const { db, dir } = createTestDb();
  try {
    const grant = addGrant(db, {
      slug: "openai-codex",
      name: "OpenAI Codex",
      programUrl: "https://openai.com/codex",
      priority: 1,
      fit: "high",
      eligibility: "eligible",
    });
    assert.ok(grant.id);
    assert.equal(getGrant(db, grant.id)!.name, "OpenAI Codex");
    assert.equal(listGrants(db).length, 1);

    const application = addApplication(db, {
      grantId: grant.id,
      amount: 1000,
      currency: "USD",
      status: "draft",
    });
    assert.ok(application.id);
    assert.equal(getApplication(db, application.id)!.grantId, grant.id);
    assert.equal(listApplications(db).length, 1);
  } finally {
    closeTestDb(db, dir);
  }
});

test("application with unknown grant id is rejected by FK", () => {
  const { db, dir } = createTestDb();
  try {
    assert.throws(() => addApplication(db, { grantId: 9999 }), /FOREIGN KEY/i);
  } finally {
    closeTestDb(db, dir);
  }
});

test("invalid priority and status are rejected by CHECK", () => {
  const { db, dir } = createTestDb();
  try {
    assert.throws(() => addGrant(db, { slug: "bad", name: "Bad", priority: 9 }), /CHECK/i);
    const grant = addGrant(db, { slug: "good", name: "Good" });
    assert.throws(
      () => addApplication(db, { grantId: grant.id, status: "bogus" as never }),
      /CHECK/i,
    );
  } finally {
    closeTestDb(db, dir);
  }
});

test("re-running migrations is a no-op", () => {
  const { db, dir } = createTestDb();
  try {
    const grant = addGrant(db, { slug: "persistent", name: "Persistent" });
    migrate(db, {
      migrationsFolder: new URL("../db/migrations", import.meta.url).pathname,
    });
    assert.equal(getGrant(db, grant.id)!.name, "Persistent");
  } finally {
    closeTestDb(db, dir);
  }
});
