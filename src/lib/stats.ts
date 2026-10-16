import fs from "fs";
import path from "path";
import type { Organization } from "./types";

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
