import { Cloud, Wrench, Sparkles, Shield, Globe, FlaskConical } from "lucide-react";
import type { ProgramConfig } from "./types";
import { GSOC_SEARCH_KEYS } from "./gsoc-model";

export { gsocToExplorerOrg, gsocCurrentYear, gsocOrgSize } from "./gsoc-model";

/** Built per dataset so "new this year" and "veteran" know the current cycle. */
export function makeGsocConfig(currentYear: number): ProgramConfig {
  return {
    id: "gsoc",
    name: "Google Summer of Code",
    accentVar: "--program-gsoc",
    dataUrl: "/data/gsoc/organizations.json",
    facets: [
      { id: "years", label: "Year", urlKey: "years", match: "any", sort: "valueDesc", mono: true, initialLimit: 6, expandedLimit: 20 },
      { id: "categories", label: "Category", urlKey: "categories", match: "any", isCategory: true, initialLimit: 13, expandedLimit: 13 },
      { id: "technologies", label: "Technology", urlKey: "tech", match: "any", caseInsensitive: true, searchable: true, searchPlaceholder: "Search technologies", initialLimit: 10, expandedLimit: 80, listClassName: "max-h-64" },
      { id: "topics", label: "Topic", urlKey: "topics", match: "any", caseInsensitive: true, searchable: true, searchPlaceholder: "Search topics", defaultOpen: false, initialLimit: 8, expandedLimit: 80, listClassName: "max-h-64" },
      {
        id: "size",
        label: "Organization size",
        urlKey: "size",
        match: "any",
        countScope: "all",
        options: [
          { value: "large", label: "Large, 40 or more projects" },
          { value: "medium", label: "Medium, 10 to 39 projects" },
          { value: "small", label: "Small, under 10 projects" },
        ],
      },
    ],
    quickFilters: [
      { id: "new", label: `New this year (${currentYear})`, predicate: (o) => o.years.length === 1 && o.years[0] === currentYear },
      { id: "veteran", label: "Veteran, 5 or more years", predicate: (o) => o.years.length >= 5 },
      { id: "proposals", label: "Has public proposals", predicate: (o) => (o.proposalCount ?? 0) > 0 },
    ],
    sortOptions: [
      { id: "relevance", label: "Relevance" },
      { id: "projects", label: "Most projects", compare: (a, b) => b.projectCount - a.projectCount },
      { id: "years", label: "Most years", compare: (a, b) => b.years.length - a.years.length || b.projectCount - a.projectCount },
      { id: "newest", label: "Newest first", compare: (a, b) => Math.min(...b.years) - Math.min(...a.years) || a.name.localeCompare(b.name) },
      { id: "name", label: "Name, A to Z", compare: (a, b) => a.name.localeCompare(b.name) },
    ],
    categoryTabs: [
      { id: "Infrastructure and cloud", label: "Cloud and infra", icon: Cloud },
      { id: "Development tools", label: "Dev tools", icon: Wrench },
      { id: "Artificial Intelligence", label: "AI", icon: Sparkles },
      { id: "Security", label: "Security", icon: Shield },
      { id: "Web", label: "Web", icon: Globe },
      { id: "Science and medicine", label: "Science", icon: FlaskConical },
    ],
    searchPlaceholder: "Search orgs, technologies, topics",
    searchAriaLabel: "Search organizations, technologies and topics",
    searchKeys: GSOC_SEARCH_KEYS,
    attribution: {
      text: "Organization and project data from",
      links: [
        { label: "gsocorganizations.dev", href: "https://www.gsocorganizations.dev" },
        { label: "cncf/mentoring on GitHub", href: "https://github.com/cncf/mentoring/tree/main/programs/summerofcode" },
      ],
      suffix: ". OSSGrid is a community index, not an official Google Summer of Code site.",
    },
    // Years strip on the card: every GSoC year in the data, oldest first.
    plotYears: (orgs) => {
      let min = 9999, max = 0;
      for (const o of orgs) for (const y of o.years) { if (y < min) min = y; if (y > max) max = y; }
      if (max === 0) { const now = new Date().getFullYear(); return Array.from({ length: 11 }, (_, i) => now - 10 + i); }
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    },
    searchDebounceMs: 120,
    virtualizeAbove: 120,
    animateCards: false,
  };
}
