import fs from "fs";
import path from "path";
import { cache } from "react";
import type { ProposalRecord } from "./types";

const DIR = path.join(process.cwd(), "public", "data", "proposals");

export const getProposals = cache((): ProposalRecord[] => {
  const file = path.join(DIR, "proposals.json");
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
});

export const getProposalCounts = cache((): Record<string, number> => {
  const file = path.join(DIR, "by-org.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
});

export function getProposalStats() {
  const all = getProposals();
  const orgs = new Set(all.map((p) => p.orgId).filter(Boolean));
  return { count: all.length, orgCount: orgs.size, repos: new Set(all.map((p) => p.sourceRepo)).size };
}
