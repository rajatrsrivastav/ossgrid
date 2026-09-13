import { Organization, LfxOrganizationDto, FilterState, FilterOptions } from "./types";

type FilterableOrg = Organization | LfxOrganizationDto;

let cachedOrgs: Organization[] | null = null;

export async function loadOrganizations(): Promise<Organization[]> {
  if (cachedOrgs) return cachedOrgs;
  const resp = await fetch("/data/organizations.json");
  cachedOrgs = await resp.json();
  return cachedOrgs!;
}

export function getFilterOptions<T extends FilterableOrg = FilterableOrg>(
  allOrgs: T[],
  filteredOrgs?: T[]
): FilterOptions {
  // If filteredOrgs is provided, count matches within filteredOrgs (live counts),
  // while preserving all known options from allOrgs so active filters can always be deselected.
  const orgsForCounts = filteredOrgs ?? allOrgs;

  const termCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  const techCount = new Map<string, number>();
  const yearCount = new Map<number, number>();

  for (const org of orgsForCounts) {
    for (const t of org.terms) termCount.set(t, (termCount.get(t) || 0) + 1);
    categoryCount.set(org.category, (categoryCount.get(org.category) || 0) + 1);
    for (const tech of org.technologies) techCount.set(tech, (techCount.get(tech) || 0) + 1);
    for (const y of org.years) yearCount.set(y, (yearCount.get(y) || 0) + 1);
  }

  // Ensure all known values from allOrgs exist with 0 if no match
  for (const org of allOrgs) {
    for (const t of org.terms) {
      if (!termCount.has(t)) termCount.set(t, 0);
    }
    if (!categoryCount.has(org.category)) categoryCount.set(org.category, 0);
    for (const tech of org.technologies) {
      if (!techCount.has(tech)) techCount.set(tech, 0);
    }
    for (const y of org.years) {
      if (!yearCount.has(y)) yearCount.set(y, 0);
    }
  }

  const baseTermCount = new Map<string, number>();
  const baseCategoryCount = new Map<string, number>();
  const baseTechCount = new Map<string, number>();

  for (const org of allOrgs) {
    for (const t of org.terms) baseTermCount.set(t, (baseTermCount.get(t) || 0) + 1);
    baseCategoryCount.set(org.category, (baseCategoryCount.get(org.category) || 0) + 1);
    for (const tech of org.technologies) baseTechCount.set(tech, (baseTechCount.get(tech) || 0) + 1);
  }

  // Stable sort by base dataset frequency, then alphabetically, so UI doesn't jitter on click
  const sortByBaseCount = <T extends string>(
    currentMap: Map<T, number>,
    baseMap: Map<T, number>
  ) =>
    Array.from(currentMap.entries())
      .sort((a, b) => {
        const baseDiff = (baseMap.get(b[0]) || 0) - (baseMap.get(a[0]) || 0);
        if (baseDiff !== 0) return baseDiff;
        return String(a[0]).localeCompare(String(b[0]));
      })
      .map(([value, count]) => ({ value, count }));

  return {
    terms: sortByBaseCount(termCount, baseTermCount),
    categories: sortByBaseCount(categoryCount, baseCategoryCount),
    technologies: sortByBaseCount(techCount, baseTechCount),
    years: Array.from(yearCount.entries())
      .sort((a, b) => (b[0] as number) - (a[0] as number))
      .map(([value, count]) => ({ value, count })),
  };
}

export function filterOrganizations<T extends FilterableOrg = FilterableOrg>(
  orgs: T[],
  filters: FilterState
): T[] {
  return orgs.filter((org) => {
    // Terms filter
    if (filters.terms.length > 0) {
      if (!filters.terms.some((t) => org.terms.includes(t))) return false;
    }

    // Categories filter
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(org.category)) return false;
    }

    // Technologies filter
    if (filters.technologies.length > 0) {
      const orgTechLower = org.technologies.map((t) => t.toLowerCase());
      if (!filters.technologies.some((t) => orgTechLower.includes(t.toLowerCase())))
        return false;
    }

    // Years filter
    if (filters.years.length > 0) {
      if (!filters.years.every((y) => org.years.includes(y))) return false;
    }

    return true;
  });
}

export function getActiveFilterCount(filters: FilterState): number {
  return (
    filters.terms.length +
    filters.categories.length +
    filters.technologies.length +
    filters.years.length +
    filters.quickFilters.length
  );
}

export const defaultFilterState: FilterState = {
  search: "",
  terms: [],
  categories: [],
  technologies: [],
  years: [],
  quickFilters: [],
};
