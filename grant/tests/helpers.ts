import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDb, type Db } from "../db/index.js";

export function createTestDb(): { db: Db; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), "grant-test-"));
  const db = openDb(join(dir, "test.sqlite"));
  migrate(db, {
    migrationsFolder: new URL("../db/migrations", import.meta.url).pathname,
  });
  return { db, dir };
}

export function closeTestDb(db: Db, dir: string) {
  db.$client.close();
  rmSync(dir, { recursive: true, force: true });
}
