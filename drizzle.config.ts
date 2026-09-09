import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./grant/db/schema.ts",
  out: "./grant/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.GRANT_DB_PATH || "./data/grants.sqlite",
  },
});