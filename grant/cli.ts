#!/usr/bin/env node
import { Command } from "commander";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { openDb } from "./db/index.js";
import { addGrant, listGrants } from "./modules/grants.js";
import { addApplication, listApplications } from "./modules/applications.js";

const program = new Command();

program.name("grant").description("Coherence grant tracking CLI").version("0.1.0");

const db = openDb();
migrate(db, { migrationsFolder: new URL("./db/migrations", import.meta.url).pathname });

function output(value: unknown, json: boolean) {
  process.stdout.write(json ? JSON.stringify(value, null, 2) + "\n" : "");
}

program
  .command("grants:add")
  .description("Create a grant program")
  .requiredOption("--slug <slug>", "unique URL slug")
  .requiredOption("--name <name>", "program name")
  .option("--program-url <url>", "program website URL")
  .option("--priority <1-5>", "priority (default 3)", (v) => Number(v))
  .option("--fit <fit>", "fit: unknown|high|medium|low")
  .option("--eligibility <el>", "eligibility: unknown|eligible|ineligible|needs_verification")
  .option("--deadline <date>", "deadline (YYYY-MM-DD)")
  .option("--json", "JSON output")
  .action((opts) => {
    const grant = addGrant(db, {
      slug: opts.slug,
      name: opts.name,
      programUrl: opts.programUrl,
      priority: opts.priority,
      fit: opts.fit,
      eligibility: opts.eligibility,
      deadline: opts.deadline,
    });
    output(grant, opts.json);
    if (!opts.json) console.log(`Created grant ${grant.slug} (id ${grant.id})`);
  });

program
  .command("grants:list")
  .description("List grant programs")
  .option("--json", "JSON output")
  .action((opts) => {
    const grants = listGrants(db);
    output(grants, opts.json);
    if (!opts.json) {
      for (const g of grants) {
        console.log(`${g.id}\t${g.priority}\t${g.fit}\t${g.eligibility}\t${g.slug}\t${g.name}`);
      }
    }
  });

program
  .command("applications:add")
  .description("Create a grant application")
  .requiredOption("--grant-id <id>", "grant id", (v) => Number(v))
  .option("--amount <amount>", "amount in minor units", (v) => Number(v))
  .option("--currency <code>", "currency code")
  .option(
    "--status <status>",
    "status: created|draft|submitted|in_discussion|rejected|accepted|awaiting_payout|funded",
  )
  .option("--json", "JSON output")
  .action((opts) => {
    const application = addApplication(db, {
      grantId: opts.grantId,
      amount: opts.amount,
      currency: opts.currency,
      status: opts.status,
    });
    output(application, opts.json);
    if (!opts.json)
      console.log(`Created application ${application.id} for grant ${application.grantId}`);
  });

program
  .command("applications:list")
  .description("List grant applications")
  .option("--json", "JSON output")
  .action((opts) => {
    const applications = listApplications(db);
    output(applications, opts.json);
    if (!opts.json) {
      for (const a of applications) {
        console.log(`${a.id}\t${a.grantId}\t${a.status}\t${a.amount ?? ""}\t${a.currency ?? ""}`);
      }
    }
  });

program.parse(process.argv);
