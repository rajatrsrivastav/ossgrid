import type { Organization } from "./types";

let cachedOrgs: Organization[] | null = null;

/** Client-side loader for the full LFX dataset. Explorer filtering lives in src/lib/explorer. */
export async function loadOrganizations(): Promise<Organization[]> {
  if (cachedOrgs) return cachedOrgs;
  const resp = await fetch("/data/organizations.json");
  cachedOrgs = await resp.json();
  return cachedOrgs!;
}
