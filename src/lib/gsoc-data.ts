import fs from "fs";
import path from "path";
import { cache } from "react";
import type { GsocOrganization, GsocProject, GsocYearFile } from "./types";

/** Server-only readers for public/data/gsoc. Cached per build worker. */
const DIR = path.join(process.cwd(), "public", "data", "gsoc");

export const getGsocOrganizations = cache((): GsocOrganization[] => {
  const file = path.join(DIR, "organizations.json");
  if (!fs.existsSync(file)) throw new Error(`Failed to load GSoC organizations: ${file} does not exist. Run npm run sync:gsoc.`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
});

export const getGsocYears = cache((): number[] =>
  fs.readdirSync(DIR).map((f) => f.match(/^projects-(\d{4})\.json$/)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b)
);

export const getGsocProjectsByYear = cache((year: number): GsocProject[] => {
  const file = path.join(DIR, `projects-${year}.json`);
  if (!fs.existsSync(file)) return [];
  const data: GsocYearFile = JSON.parse(fs.readFileSync(file, "utf8"));
  return data.projects;
});

/** Projects for one organization grouped by year, newest first. */
export function getGsocOrgProjects(slug: string): { year: number; projects: GsocProject[] }[] {
  return getGsocYears()
    .map((year) => ({ year, projects: getGsocProjectsByYear(year).filter((p) => p.orgSlug === slug) }))
    .filter((y) => y.projects.length > 0)
    .sort((a, b) => b.year - a.year);
}
