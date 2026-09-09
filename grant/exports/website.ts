import { openDb, type Db } from "../db/index.js";
import { grants, grantApplications, grantApplicationArtifacts } from "../db/schema.js";

/**
 * Artifacts explicitly allowed to be published on the website.
 * Empty by default: nothing is published unless listed here.
 */
const PUBLISHED_ARTIFACT_IDS: number[] = [];

export interface ExportOptions {
  publishedArtifactIds?: number[];
}

const ALLOWED_URL_PREFIXES = ["http://", "https://"];

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  return ALLOWED_URL_PREFIXES.some((p) => trimmed.startsWith(p)) ? trimmed : null;
}

export interface WebsiteGrant {
  id: number;
  slug: string;
  name: string;
  programUrl: string | null;
  priority: number;
  fit: string;
  eligibility: string;
  deadline: string | null;
  applications: {
    id: number;
    amount: number | null;
    currency: string | null;
    status: string;
    createdAt: string;
  }[];
  artifacts: {
    id: number;
    artifactType: string;
    name: string | null;
    content: string | null;
    url: string | null;
  }[];
}

export interface WebsiteExport {
  stats: {
    totalGrants: number;
    totalApplications: number;
    totalFunded: number;
    totalInDiscussion: number;
  };
  grants: WebsiteGrant[];
}

export function exportWebsiteData(db: Db = openDb(), options: ExportOptions = {}): WebsiteExport {
  const publishedArtifactIds = new Set(options.publishedArtifactIds ?? PUBLISHED_ARTIFACT_IDS);
  try {
    const grantRows = db.select().from(grants).orderBy(grants.priority).all();
    const appRows = db.select().from(grantApplications).all();
    const artifactRows = db.select().from(grantApplicationArtifacts).all();

    const grantsOut: WebsiteGrant[] = grantRows.map((g) => {
      const apps = appRows
        .filter((a) => a.grantId === g.id)
        .map((a) => ({
          id: a.id,
          amount: a.amount,
          currency: a.currency,
          status: a.status,
          createdAt: a.createdAt,
        }));
      const appIds = new Set(appRows.filter((a) => a.grantId === g.id).map((a) => a.id));
      const artifacts = artifactRows
        .filter((a) => appIds.has(a.grantApplicationId))
        .filter((a) => publishedArtifactIds.has(a.id))
        .map((a) => ({
          id: a.id,
          artifactType: a.artifactType,
          name: a.name,
          content: a.content,
          url: a.artifactType === "url" ? safeUrl(a.content) : null,
        }));
      return {
        id: g.id,
        slug: g.slug,
        name: g.name,
        programUrl: safeUrl(g.programUrl),
        priority: g.priority,
        fit: g.fit,
        eligibility: g.eligibility,
        deadline: g.deadline,
        applications: apps,
        artifacts,
      };
    });

    return {
      stats: {
        totalGrants: grantRows.length,
        totalApplications: appRows.length,
        totalFunded: appRows.filter((a) => a.status === "funded").length,
        totalInDiscussion: appRows.filter((a) => a.status === "in_discussion").length,
      },
      grants: grantsOut,
    };
  } finally {
    db.$client.close();
  }
}
// CLI mode: `npx tsx grant/exports/website.ts --json` prints the export.
if (import.meta.url === `file://${process.argv[1]}`) {
  const data = exportWebsiteData();
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}
