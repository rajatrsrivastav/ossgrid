import type { GsocOrganization } from "@/lib/types";
import type { ExplorerOrg } from "./types";

/** Facets and search keys for /gsoc. Kept free of React imports so the data pipeline can reuse it. */
export const GSOC_SEARCH_KEYS = [
  { name: "name", weight: 3 },
  { name: "technologies", weight: 1.5 },
  { name: "search.topics", weight: 1.2 },
  { name: "description", weight: 0.8 },
  { name: "category", weight: 0.5 },
];

export function gsocOrgSize(projectCount: number): "large" | "medium" | "small" {
  return projectCount >= 40 ? "large" : projectCount >= 10 ? "medium" : "small";
}

export function gsocToExplorerOrg(org: GsocOrganization, currentYear: number): ExplorerOrg {
  const yearlyCounts: Record<number, number> = {};
  for (const [y, n] of Object.entries(org.projectsByYear)) yearlyCounts[Number(y)] = n;
  const links: { label: string; href: string }[] = [];
  if (org.links.ideas) links.push({ label: "Ideas list", href: org.links.ideas });
  if (org.links.guide) links.push({ label: "Contributor guide", href: org.links.guide });
  if (org.links.chat) links.push({ label: "Chat", href: org.links.chat });
  const isNew = org.firstYear === currentYear;
  return {
    id: org.slug,
    name: org.name,
    href: `/gsoc/${org.slug}`,
    logoUrl: org.logoUrl,
    description: org.description,
    category: org.category,
    years: org.years,
    technologies: org.technologies,
    projectCount: org.projectCount,
    yearlyCounts,
    facets: {
      years: org.years.map(String),
      categories: [org.category],
      technologies: org.technologies,
      topics: org.topics,
      size: [gsocOrgSize(org.projectCount)],
    },
    search: { projectTitles: [], mentorNames: [], topics: org.topics },
    links,
    badge: isNew ? `New in ${currentYear}` : undefined,
    currentYearProjects: org.projectsByYear[String(currentYear)] ?? 0,
  };
}

export function gsocCurrentYear(orgs: GsocOrganization[]): number {
  return orgs.reduce((m, o) => Math.max(m, o.latestYear), 0);
}
