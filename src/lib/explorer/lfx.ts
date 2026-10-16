import { Cloud, Wrench, Sparkles, Shield, Globe } from "lucide-react";
import type { LfxOrganizationDto } from "@/lib/types";
import type { ExplorerOrg, ProgramConfig } from "./types";
import { activeFilterCount } from "./filter";

export type OrgSize = "large" | "medium" | "small";

export function orgSize(projectCount: number): OrgSize {
  return projectCount >= 15 ? "large" : projectCount >= 5 ? "medium" : "small";
}

/** Map the LFX DTO to the explorer view-model. */
export function lfxToExplorerOrg(org: LfxOrganizationDto): ExplorerOrg {
  const yearlyCounts: Record<number, number> = {};
  if (org.projects?.length) {
    for (const p of org.projects) yearlyCounts[p.year] = (yearlyCounts[p.year] || 0) + 1;
  } else {
    for (const y of org.years) yearlyCounts[y] = 1;
  }
  return {
    id: org.id,
    name: org.name,
    href: `/organization/${org.id}`,
    logoUrl: org.logoUrl,
    description: org.description,
    category: org.category,
    years: org.years,
    technologies: org.technologies,
    projectCount: org.projectCount,
    yearlyCounts,
    facets: {
      years: org.years.map(String),
      size: [orgSize(org.projectCount)],
      technologies: org.technologies,
      terms: org.terms,
      categories: [org.category],
    },
    search: {
      projectTitles: org.projects.map((p) => p.title),
      mentorNames: org.projects.flatMap((p) => p.mentors?.map((m) => m.name) ?? []),
      topics: [],
    },
  };
}

export const lfxConfig: ProgramConfig = {
  id: "lfx",
  name: "LFX Mentorship",
  accentVar: "--program-lfx",
  dataUrl: "/data/organizations.json",
  facets: [
    { id: "years", label: "Year", urlKey: "years", match: "all", sort: "valueDesc", mono: true, initialLimit: 5, expandedLimit: 5 },
    {
      id: "size",
      label: "Organization size",
      match: "any",
      countScope: "all",
      options: [
        { value: "large", label: "Large, 15 or more projects" },
        { value: "medium", label: "Medium, 5 to 14 projects" },
        { value: "small", label: "Small, under 5 projects" },
      ],
    },
    { id: "technologies", label: "Technology", urlKey: "tech", match: "any", caseInsensitive: true, searchable: true, searchPlaceholder: "Search technologies", initialLimit: 10, expandedLimit: 60, listClassName: "max-h-64" },
    { id: "terms", label: "Term", urlKey: "terms", match: "any", defaultOpen: false, searchable: true, searchPlaceholder: "Search terms", initialLimit: 6, expandedLimit: Infinity, listClassName: "max-h-48" },
    { id: "categories", label: "Category", urlKey: "categories", match: "any", isCategory: true, hidden: true },
  ],
  sortOptions: [
    { id: "relevance", label: "Relevance" },
    { id: "projects", label: "Most projects", compare: (a, b) => b.projectCount - a.projectCount },
    { id: "name", label: "Name, A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
  ],
  categoryTabs: [
    { id: "Infrastructure & Cloud", label: "Cloud and infra", icon: Cloud },
    { id: "Development Tools", label: "Dev tools", icon: Wrench },
    { id: "Machine Learning & AI", label: "AI and ML", icon: Sparkles },
    { id: "Security & Privacy", label: "Security", icon: Shield },
    { id: "Web & Mobile", label: "Web and mobile", icon: Globe },
  ],
  searchPlaceholder: "Search orgs, projects, technologies, mentors",
  searchAriaLabel: "Search organizations, projects, technologies and mentors",
  searchKeys: [
    { name: "name", weight: 3 },
    { name: "search.projectTitles", weight: 2 },
    { name: "technologies", weight: 1.5 },
    { name: "search.mentorNames", weight: 1 },
    { name: "description", weight: 0.8 },
    { name: "category", weight: 0.5 },
  ],
  attribution: { text: "Data from", linkLabel: "cncf/mentoring on GitHub", href: "https://github.com/cncf/mentoring", suffix: ". OSSGrid is a community index, not an official LFX site." },
  emptyState: (filters) => {
    const tech = filters.facets.technologies || [];
    const years = filters.facets.years || [];
    const active = activeFilterCount(filters);
    const advice = years.length > 1 ? "The year filter needs an org in every selected year. Try one year." : "Try a broader technology or clear a filter.";
    if (filters.search) return { hint: `Nothing matches “${filters.search}”${active ? " with the current filters" : ""}.`, advice };
    if (tech.length) return { hint: `No organization uses ${tech.join(" and ")}${years.length ? ` in ${years.join(", ")}` : ""}.`, advice };
    if (years.length) return { hint: `No organization took part in every one of ${years.join(", ")}.`, advice };
    return { hint: "No organization matches these filters.", advice };
  },
  searchDebounceMs: 0,
  virtualizeAbove: Infinity,
  animateCards: true,
};
