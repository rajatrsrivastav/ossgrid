import { Organization, FilterState, FilterOptions } from "./types";

let cachedOrgs: Organization[] | null = null;

export async function loadOrganizations(): Promise<Organization[]> {
  if (cachedOrgs) return cachedOrgs;
  const resp = await fetch("/data/organizations.json");
  cachedOrgs = await resp.json();
  return cachedOrgs!;
}

export function getFilterOptions(orgs: Organization[]): FilterOptions {
  const termCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  const techCount = new Map<string, number>();
  const yearCount = new Map<number, number>();

  for (const org of orgs) {
    for (const t of org.terms) termCount.set(t, (termCount.get(t) || 0) + 1);
    categoryCount.set(org.category, (categoryCount.get(org.category) || 0) + 1);
    for (const tech of org.technologies) techCount.set(tech, (techCount.get(tech) || 0) + 1);
    for (const y of org.years) yearCount.set(y, (yearCount.get(y) || 0) + 1);
  }

  const sortByCount = <T>(map: Map<T, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }));

  return {
    terms: sortByCount(termCount),
    categories: sortByCount(categoryCount),
    technologies: sortByCount(techCount),
    years: Array.from(yearCount.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([value, count]) => ({ value, count })),
  };
}

export function filterOrganizations(
  orgs: Organization[],
  filters: FilterState
): Organization[] {
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
