import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const root = resolve(new URL("../../..", import.meta.url).pathname);

function loadExport() {
  const dbFile = resolve(root, process.env.GRANT_DB_PATH || "data/grants.sqlite");
  if (!existsSync(dbFile)) {
    throw new Error(
      "Missing grant database. Run `npm run db:migrate` before building the site.",
    );
  }
  const stdout = execFileSync(
    "npx",
    ["tsx", "grant/exports/website.ts", "--json"],
    { cwd: root, encoding: "utf8" },
  );
  return JSON.parse(stdout);
}

function copyPublishedFiles(data) {
  const outDir = resolve(root, "website/public/artifacts");
  let copied = 0;
  for (const grant of data.grants) {
    for (const artifact of grant.artifacts) {
      if (artifact.artifactType !== "file" || !artifact.content) continue;
      const src = resolve(root, artifact.content);
      if (!src.startsWith(root) || !existsSync(src)) continue;
      const dest = resolve(outDir, basename(src));
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
      artifact.url = `/artifacts/${basename(src)}`;
      copied += 1;
    }
  }
  return copied;
}

export default function () {
  try {
    const data = loadExport();
    copyPublishedFiles(data);
    return {
      items: data.grants,
      summary: {
        total: data.stats.totalGrants,
        applications: data.stats.totalApplications,
        funded: data.stats.totalFunded,
        inDiscussion: data.stats.totalInDiscussion,
      },
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing grant database")) {
      return {
        error: error.message,
        items: [],
        summary: { total: 0, applications: 0, funded: 0, inDiscussion: 0 },
        generatedAt: new Date().toISOString(),
      };
    }
    throw error;
  }
}