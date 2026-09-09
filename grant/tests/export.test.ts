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
