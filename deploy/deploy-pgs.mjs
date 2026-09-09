#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const pgsHost = process.env.PGS_HOST || "pgs.sh";
const pgsUser = process.env.PGS_USER;
const pgsProject = process.env.PGS_PROJECT || "funding-usecoherence";
const pgsIdentity = process.env.PGS_IDENTITY || "";

if (!pgsUser) {
  console.error("missing PGS_USER; set it in .env");
  process.exit(1);
}

if (!existsSync("website/public")) {
  console.error("missing website/public/; run npm run site:build first");
  process.exit(1);
}

const sshParts = ["ssh", "-o", "StrictHostKeyChecking=accept-new"];
if (pgsIdentity) {
  sshParts.push("-i", pgsIdentity);
}

const result = spawnSync(
  "rsync",
  [
    "--delete",
    "-rv",
    "-e",
    sshParts.join(" "),
    "website/public/",
    `${pgsUser}@${pgsHost}:/${pgsProject}/`,
  ],
  { stdio: "inherit" },
);

if (result.error) {
  console.error(`rsync failed to start: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
