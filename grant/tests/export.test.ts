import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDb, closeTestDb } from "./helpers.js";
import { exportWebsiteData } from "../exports/website.js";
import { addGrant } from "../modules/grants.js";
import { addApplication } from "../modules/applications.js";
import { grantApplicationArtifacts } from "../db/schema.js";

test("export returns empty site for empty database", () => {
  const { db, dir } = createTestDb();
  try {
    const data = exportWebsiteData(db);
    assert.equal(data.grants.length, 0);
    assert.equal(data.stats.totalGrants, 0);
    assert.equal(data.stats.totalApplications, 0);
  } finally {
    closeTestDb(db, dir);
  }
});

test("export returns grants with applications and computed stats", () => {
  const { db, dir } = createTestDb();
  try {
    const grant = addGrant(db, { slug: "example-grant", name: "Example Grant Program" });
    addApplication(db, {
      grantId: grant.id,
      status: "in_discussion",
      amount: 500,
      currency: "USD",
    });
    const data = exportWebsiteData(db);
    assert.equal(data.grants.length, 1);
    assert.equal(data.grants[0].slug, "example-grant");
    assert.equal(data.grants[0].applications.length, 1);
    assert.equal(data.grants[0].applications[0].status, "in_discussion");
    assert.equal(data.stats.totalInDiscussion, 1);
  } finally {
    closeTestDb(db, dir);
  }
});

test("export never publishes artifacts without allowlist entry", () => {
  const { db, dir } = createTestDb();
  try {
    const grant = addGrant(db, { slug: "private", name: "Private" });
    const app = addApplication(db, { grantId: grant.id });
    // Insert an artifact directly; PUBLISHED_ARTIFACT_IDS is empty by default.
    db.insert(grantApplicationArtifacts)
      .values({
        grantApplicationId: app.id,
        artifactType: "text",
        name: "PRIVATE",
        content: "super-secret",
      })
      .run();
    const data = exportWebsiteData(db);
    assert.equal(data.grants[0].artifacts.length, 0);
  } finally {
    closeTestDb(db, dir);
  }
});

test("artifacts are attached to the owning grant via its applications", () => {
  const { db, dir } = createTestDb();
  try {
    const grantA = addGrant(db, { slug: "grant-a", name: "Grant A" });
    const grantB = addGrant(db, { slug: "grant-b", name: "Grant B" });
    addApplication(db, { grantId: grantA.id });
    const appB = addApplication(db, { grantId: grantB.id });
    // Artifact belongs to B's application.
    const artifact = db
      .insert(grantApplicationArtifacts)
      .values({
        grantApplicationId: appB.id,
        artifactType: "text",
        name: "B doc",
        content: "for B only",
      })
      .returning()
      .get();
    // Allowlist B's artifact; it must appear only under grant-b.
    const data = exportWebsiteData(db, { publishedArtifactIds: [artifact.id] });
    const a = data.grants.find((g) => g.slug === "grant-a")!;
    const b = data.grants.find((g) => g.slug === "grant-b")!;
    assert.deepEqual(a.artifacts, []);
    assert.equal(b.artifacts.length, 1);
    assert.equal(b.artifacts[0].name, "B doc");
  } finally {
    closeTestDb(db, dir);
  }
});
