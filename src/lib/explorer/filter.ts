import Fuse, { type IFuseOptions } from "fuse.js";
import type { ExplorerFilterState, ExplorerOrg, FacetDefinition, FacetOption, ProgramConfig, QuickFilterDefinition } from "./types";

export function emptyFilterState(config: Pick<ProgramConfig, "facets">): ExplorerFilterState {
  return { search: "", facets: Object.fromEntries(config.facets.map((f) => [f.id, []])), quickFilters: [] };
}

type Faceted = Pick<ExplorerOrg, "facets">;

export function matchesFacets(org: Faceted, filters: ExplorerFilterState, defs: FacetDefinition[]): boolean {
  for (const def of defs) {
    const selected = filters.facets[def.id];
    if (!selected || selected.length === 0) continue;
    let values = org.facets[def.id] || [];
    let wanted = selected;
    if (def.caseInsensitive) {
      values = values.map((v) => v.toLowerCase());
      wanted = selected.map((v) => v.toLowerCase());
    }
    if (def.match === "all") {
      if (!wanted.every((v) => values.includes(v))) return false;
    } else if (!wanted.some((v) => values.includes(v))) return false;
  }
  return true;
}

export function matchesQuickFilters(org: ExplorerOrg, ids: string[], defs: QuickFilterDefinition[] = []): boolean {
  for (const id of ids) {
    const def = defs.find((q) => q.id === id);
    if (def && !def.predicate(org)) return false;
  }
  return true;
}

export function filterOrgs<T extends Faceted>(orgs: T[], filters: ExplorerFilterState, config: Pick<ProgramConfig, "facets" | "quickFilters">): T[] {
  return orgs.filter((org) => matchesFacets(org, filters, config.facets) && (!config.quickFilters?.length || matchesQuickFilters(org as unknown as ExplorerOrg, filters.quickFilters, config.quickFilters)));
}

export function activeFilterCount(filters: ExplorerFilterState): number {
  return Object.values(filters.facets).reduce((n, v) => n + v.length, 0) + filters.quickFilters.length;
}

/**
 * Options for one facet. Counts come from `scoped` (the current result set) while every value known
 * from `all` stays listed with a zero count so an active filter can always be deselected. Derived
 * options sort by whole-dataset frequency, then label, so the list does not jitter on click.
 */
export function facetOptions(def: FacetDefinition, all: Faceted[], scoped: Faceted[]): FacetOption[] {
  const source = def.countScope === "all" ? all : scoped;
  const counts = new Map<string, number>();
  for (const org of source) for (const v of org.facets[def.id] || []) counts.set(v, (counts.get(v) || 0) + 1);

  if (def.options) {
    return def.options.map((o) => ({ value: o.value, label: o.label, count: counts.get(o.value) || 0 }));
  }

  const base = new Map<string, number>();
  for (const org of all) for (const v of org.facets[def.id] || []) base.set(v, (base.get(v) || 0) + 1);
  for (const v of base.keys()) if (!counts.has(v)) counts.set(v, 0);

  const entries = Array.from(counts.entries());
  if (def.sort === "valueDesc") entries.sort((a, b) => Number(b[0]) - Number(a[0]));
  else entries.sort((a, b) => (base.get(b[0]) || 0) - (base.get(a[0]) || 0) || a[0].localeCompare(b[0]));
  const label = def.formatLabel || ((v: string) => v);
  return entries.map(([value, count]) => ({ value, label: label(value), count }));
}

export function allFacetOptions(config: Pick<ProgramConfig, "facets">, all: Faceted[], scoped: Faceted[]): Record<string, FacetOption[]> {
  return Object.fromEntries(config.facets.map((def) => [def.id, facetOptions(def, all, scoped)]));
}

export function createExplorerIndex(orgs: ExplorerOrg[], keys: ProgramConfig["searchKeys"]): Fuse<ExplorerOrg> {
  const options: IFuseOptions<ExplorerOrg> = { keys, threshold: 0.35, ignoreLocation: true, includeScore: true, minMatchCharLength: 2 };
  return new Fuse(orgs, options);
}

/** Load a Fuse index that was serialized at build time. Falls back to a fresh index when the shape no longer matches. */
export function createExplorerIndexFromPrebuilt(orgs: ExplorerOrg[], keys: ProgramConfig["searchKeys"], prebuilt: unknown): Fuse<ExplorerOrg> {
  const options: IFuseOptions<ExplorerOrg> = { keys, threshold: 0.35, ignoreLocation: true, includeScore: true, minMatchCharLength: 2 };
  try {
    const index = Fuse.parseIndex<ExplorerOrg>(prebuilt as Parameters<typeof Fuse.parseIndex>[0]);
    if (index.size() !== orgs.length) throw new Error("size mismatch");
    return new Fuse(orgs, options, index);
  } catch {
    return new Fuse(orgs, options);
  }
}

export function searchOrgs(fuse: Fuse<ExplorerOrg>, query: string): ExplorerOrg[] {
  if (!query || query.trim().length < 2) return [];
  return fuse.search(query.trim()).map((r) => r.item);
}

/** Default empty-state copy; programs can override via ProgramConfig.emptyState. */
export function defaultEmptyState(filters: ExplorerFilterState, defs: FacetDefinition[]): { hint: string; advice: string } {
  const active = activeFilterCount(filters);
  const strict = defs.find((d) => d.match === "all" && (filters.facets[d.id]?.length || 0) > 1);
  const advice = strict
    ? `The ${strict.label.toLowerCase()} filter needs an org in every selected ${strict.label.toLowerCase()}. Try one ${strict.label.toLowerCase()}.`
    : "Try a broader filter or clear one.";
  if (filters.search) return { hint: `Nothing matches “${filters.search}”${active ? " with the current filters" : ""}.`, advice };
  for (const def of defs) {
    const values = filters.facets[def.id];
    if (values?.length) {
      const labels = values.map((v) => (def.options?.find((o) => o.value === v)?.label ?? def.formatLabel?.(v) ?? v));
      const hint = def.match === "all"
        ? `No organization matches every one of ${labels.join(", ")}.`
        : `No organization matches ${labels.join(" or ")}.`;
      return { hint, advice };
    }
  }
  return { hint: "No organization matches these filters.", advice };
}
