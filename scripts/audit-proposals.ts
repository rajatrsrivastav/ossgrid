import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import type { ProposalRecord } from "./lib/proposals-parser";

export interface ProposalsCoverage {
  sources: { repo: string; revision: string; files: number; proposals: number; license?: string; note?: string }[];
  total: number;
  matchedOrgs: number;
  unmatchedOrgNames: Record<string, number>;
}

export function auditProposals(records: ProposalRecord[], coverage: ProposalsCoverage, log: (l: string) => void = console.log) {
  assert(records.length > 50, "Proposals index looks empty");
  const ids = new Set<string>();
  const repos = new Set(coverage.sources.map((s) => s.repo));
  for (const r of records) {
    assert(r.id && !ids.has(r.id), `Duplicate proposal id: ${r.id}`); ids.add(r.id);
    assert(r.title?.trim(), `Missing title: ${r.id}`);
    assert(["accepted", "rejected", "unknown"].includes(r.status), `Bad status: ${r.id}`);
    assert(["pdf", "md", "docx", "link"].includes(r.format), `Bad format: ${r.id}`);
    assert(r.year === null || (Number.isInteger(r.year) && r.year >= 2005 && r.year <= 2030), `Bad year: ${r.id}`);
    assert(repos.has(r.sourceRepo), `Unknown source repo: ${r.id}`);
    let u: URL; try { u = new URL(r.url); } catch { assert.fail(`Bad URL: ${r.id}: ${r.url}`); }
    assert(u.protocol === "https:", `Proposal links must be https: ${r.id}`);
    assert(!/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(`${r.title} ${r.author}`), `Email in proposal record: ${r.id}`);
  }
  assert.equal(coverage.total, records.length, "Coverage total differs");
  for (const s of coverage.sources) if (s.proposals) assert(/^[0-9a-f]{40}$/.test(s.revision), `Unpinned source: ${s.repo}`);
  log(`Proposals: ${records.length} records, ${coverage.matchedOrgs} orgs matched, ${Object.keys(coverage.unmatchedOrgNames).length} archive org names unmatched.`);
}

export function main() {
  const dir = path.join(process.cwd(), "public/data/proposals");
  if (!fs.existsSync(path.join(dir, "proposals.json"))) { console.log("No proposals data yet; skipping proposals audit."); return; }
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  auditProposals(read("proposals.json"), read("source-coverage.json"));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
