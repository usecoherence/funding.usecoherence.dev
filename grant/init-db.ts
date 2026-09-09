import { mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dbFile = resolve(root, process.env.GRANT_DB_PATH || "data/grants.sqlite");

mkdirSync(dirname(dbFile), { recursive: true });

const db = new DatabaseSync(dbFile);
try {
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(readFileSync(resolve(root, "grant/schema.sql"), "utf8"));
} finally {
  db.close();
}

console.log(`Initialized ${dbFile}`);