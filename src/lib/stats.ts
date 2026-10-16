import fs from "fs";
import path from "path";
import type { GsocOrganization, Organization } from "./types";

/**
 * Site-wide counts derived from the built JSON. Server-only (uses fs).
 * UI copy must never hardcode these numbers.
 */
export interface SiteStats {
  orgCount: number;
  projectCount: number;
  yearMin: number;
  yearMax: number;
  termCount: number;
  /** Floor-to-ten display strings, e.g. "100+" */
  orgLabel: string;
  projectLabel: string;
}

/** Round down to the nearest ten and add "+". 102 → "100+", 953 → "950+". */
export function roundedPlus(n: number): string {
  if (n < 10) return String(n);
  return `${Math.floor(n / 10) * 10}+`;
}

let cached: SiteStats | null = null;

export function getSiteStats(): SiteStats {
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const years = new Set<number>();
  const terms = new Set<string>();
  let projectCount = 0;
  for (const org of orgs) {
    projectCount += org.projectCount;
    org.years.forEach((y) => years.add(y));
    org.terms.forEach((t) => terms.add(t));
  }
  const sortedYears = [...years].sort((a, b) => a - b);

  cached = {
    orgCount: orgs.length,
    projectCount,
    yearMin: sortedYears[0] ?? 0,
    yearMax: sortedYears[sortedYears.length - 1] ?? 0,
    termCount: terms.size,
    orgLabel: roundedPlus(orgs.length),
    projectLabel: roundedPlus(projectCount),
  };
  return cached;
}

export interface GsocSiteStats {
  orgCount: number;
  projectCount: number;
  yearMin: number;
  yearMax: number;
  orgLabel: string;
  projectLabel: string;
}

let gsocCached: GsocSiteStats | null = null;

/** Counts for /gsoc from public/data/gsoc/organizations.json. Server-only. */
export function getGsocStats(): GsocSiteStats {
  if (gsocCached) return gsocCached;
  const filePath = path.join(process.cwd(), "public", "data", "gsoc", "organizations.json");
  const orgs: GsocOrganization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let projectCount = 0, yearMin = 9999, yearMax = 0;
  for (const org of orgs) {
    projectCount += org.projectCount;
    yearMin = Math.min(yearMin, org.firstYear);
    yearMax = Math.max(yearMax, org.latestYear);
  }
  gsocCached = { orgCount: orgs.length, projectCount, yearMin, yearMax, orgLabel: roundedPlus(orgs.length), projectLabel: roundedPlus(projectCount) };
  return gsocCached;
}

export interface ProgramStats {
  id: "lfx" | "gsoc";
  orgCount: number;
  projectCount: number;
  yearMin: number;
  yearMax: number;
  /** LFX only. */
  termCount?: number;
  orgLabel: string;
  projectLabel: string;
}

/** Counts per live program, derived from the data files at build time. */
export function getProgramStats(): ProgramStats[] {
  const lfx = getSiteStats();
  const gsoc = getGsocStats();
  return [
    { id: "gsoc", ...gsoc },
    { id: "lfx", orgCount: lfx.orgCount, projectCount: lfx.projectCount, yearMin: lfx.yearMin, yearMax: lfx.yearMax, termCount: lfx.termCount, orgLabel: lfx.orgLabel, projectLabel: lfx.projectLabel },
  ];
}

/** Totals across live programs, for the hero line. */
export function getCombinedStats() {
  const all = getProgramStats();
  const orgCount = all.reduce((n, s) => n + s.orgCount, 0);
  const projectCount = all.reduce((n, s) => n + s.projectCount, 0);
  return { orgCount, projectCount, orgLabel: roundedPlus(orgCount), projectLabel: roundedPlus(projectCount), liveCount: all.length, yearMin: Math.min(...all.map((s) => s.yearMin)), yearMax: Math.max(...all.map((s) => s.yearMax)) };
}
