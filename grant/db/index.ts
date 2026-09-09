import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function dbPath() {
  return resolve(root, process.env.GRANT_DB_PATH || "data/grants.sqlite");
}

export function openDb(file: string = dbPath()) {
  mkdirSync(dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof openDb>;
export { schema };
