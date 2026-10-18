import fs from "node:fs";
import path from "node:path";
import type { Organization } from "@/lib/types";

let cached: Organization[] | null = null;

/** LFX organizations from the built data file, read once per build. */
export function getLfxOrganizations(): Organization[] {
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", "data", "organizations.json");
  cached = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Organization[]) : [];
  return cached;
}
