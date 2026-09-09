import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDb, dbPath } from "./index.js";

const db = openDb();
try {
  migrate(db, { migrationsFolder: new URL("./migrations", import.meta.url).pathname });
  console.log(`Migrated ${dbPath()}`);
} finally {
  db.$client.close();
}
