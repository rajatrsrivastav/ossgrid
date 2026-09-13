import Fuse, { type IFuseOptions } from "fuse.js";
import { Organization, LfxOrganizationDto } from "./types";

type SearchableOrg = Organization | LfxOrganizationDto;

const fuseOptions: IFuseOptions<SearchableOrg> = {
  keys: [
    { name: "name", weight: 3 },
    { name: "projects.title", weight: 2 },
    { name: "technologies", weight: 1.5 },
    { name: "projects.mentors.name", weight: 1 },
    { name: "description", weight: 0.8 },
    { name: "category", weight: 0.5 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 2,
};

export function createSearchIndex<T extends SearchableOrg = SearchableOrg>(orgs: T[]): Fuse<T> {
  return new Fuse(orgs, fuseOptions as IFuseOptions<T>);
}

export function searchOrganizations<T extends SearchableOrg = SearchableOrg>(
  fuse: Fuse<T>,
  query: string
): T[] {
  if (!query || query.trim().length < 2) return [];
  const results = fuse.search(query.trim());
  return results.map((r) => r.item);
}
