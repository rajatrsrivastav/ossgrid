import Fuse, { type IFuseOptions } from "fuse.js";
import { Organization } from "./types";

const fuseOptions: IFuseOptions<Organization> = {
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

export function createSearchIndex(orgs: Organization[]): Fuse<Organization> {
  return new Fuse(orgs, fuseOptions);
}

export function searchOrganizations(
  fuse: Fuse<Organization>,
  query: string
): Organization[] {
  if (!query || query.trim().length < 2) return [];
  const results = fuse.search(query.trim());
  return results.map((r) => r.item);
}
