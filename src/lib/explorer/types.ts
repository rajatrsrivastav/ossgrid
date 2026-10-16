import type { ComponentType } from "react";

/**
 * Program-agnostic explorer contracts. A program (LFX, GSoC, …) supplies a ProgramConfig and
 * maps its own DTO to ExplorerOrg view-models; ExplorerShell renders the rest.
 */

/** Normalized organization view-model consumed by ExplorerShell, OrganizationCard and CommandPalette. */
export interface ExplorerOrg {
  id: string;
  name: string;
  /** Detail page for this org. */
  href: string;
  logoUrl: string;
  description: string;
  category: string;
  /** Years the org took part, any order. */
  years: number[];
  technologies: string[];
  projectCount: number;
  /** Projects per year; years with no entry count as zero. */
  yearlyCounts: Record<number, number>;
  /** Facet id → values this org matches. Numbers are stored as strings. */
  facets: Record<string, string[]>;
  /** Extra searchable text, weighted by the program's search keys. */
  search: { projectTitles: string[]; mentorNames: string[]; topics: string[] };
  /** Optional outbound links shown on the card footer (GSoC: ideas list, guide, chat). */
  links?: { label: string; href: string }[];
  /** Short status badge, e.g. "New in 2026". */
  badge?: string;
  /** Projects this year, when the program tracks a current cycle. */
  currentYearProjects?: number;
  /** Public proposals indexed for this org (GSoC). */
  proposalCount?: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetDefinition {
  /** Key in ExplorerOrg.facets and in the filter state. */
  id: string;
  /** Section title in the sidebar. */
  label: string;
  /** Query-string key. Omit to keep the facet out of the URL. */
  urlKey?: string;
  /** "any": org matches if it has any selected value. "all": org must have every selected value. */
  match: "any" | "all";
  /** Where counts come from: the current result set (default) or the whole dataset. */
  countScope?: "filtered" | "all";
  /** Fixed option order and labels. When omitted, options are derived from the data. */
  options?: { value: string; label: string }[];
  /** Sort derived options by base frequency then label (default), or by value descending (years). */
  sort?: "frequency" | "valueDesc";
  /** Optional label formatter for derived options. */
  formatLabel?: (value: string) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  defaultOpen?: boolean;
  /** Render option labels in the mono font. */
  mono?: boolean;
  /** Rows shown before "Show N more". */
  initialLimit?: number;
  /** Rows shown after expanding or while searching. */
  expandedLimit?: number;
  /** Max height class for the scrollable list. */
  listClassName?: string;
  /** Render this facet as a toolbar tab row as well (first value wins). */
  isCategory?: boolean;
  /** Keep the facet out of the sidebar (toolbar-only facets such as category). */
  hidden?: boolean;
  /** Compare selected values and org values case-insensitively. */
  caseInsensitive?: boolean;
}

export interface QuickFilterDefinition {
  id: string;
  label: string;
  predicate: (org: ExplorerOrg) => boolean;
}

export interface SortDefinition {
  id: string;
  label: string;
  /** Omit for "relevance" (keeps search ranking / source order). */
  compare?: (a: ExplorerOrg, b: ExplorerOrg) => number;
}

export interface CategoryTab {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>;
}

export interface ExplorerFilterState {
  search: string;
  facets: Record<string, string[]>;
  quickFilters: string[];
}

export interface ProgramConfig {
  id: string;
  name: string;
  /** CSS variable with the program colour, e.g. "--program-lfx". */
  accentVar: string;
  /** Public JSON with the org DTO list, fetched when no initial data is supplied. */
  dataUrl: string;
  facets: FacetDefinition[];
  quickFilters?: QuickFilterDefinition[];
  sortOptions: SortDefinition[];
  /** Tabs in the toolbar; "all" is added automatically. Must reference the category facet. */
  categoryTabs: CategoryTab[];
  searchPlaceholder: string;
  searchAriaLabel: string;
  /** Fuse keys and weights over ExplorerOrg. */
  searchKeys: { name: string; weight: number }[];
  /** Attribution line under the grid: text, then links joined by " and ", then suffix. */
  attribution: { text: string; links: { label: string; href: string }[]; suffix: string };
  /** Sentences for the empty state: what did not match, and one line of advice. */
  emptyState?: (filters: ExplorerFilterState, defs: FacetDefinition[]) => { hint: string; advice: string };
  /** Delay between typing and filtering, in ms. 0 filters on every keystroke. */
  searchDebounceMs: number;
  /** Switch to windowed rendering above this many results. */
  virtualizeAbove: number;
  /** Animate card enter/exit with framer-motion. Turn off for large datasets. */
  animateCards: boolean;
  /** Years plotted on the card activity strip, oldest first. Defaults to the last five years in the data. */
  plotYears?: (orgs: ExplorerOrg[]) => number[];
}
