/**
 * Integrity checks for public/data/gsoc. Run by the importer before writing and by `npm run audit:data`.
 * Prints a tag cardinality report; fails on structural problems.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import type { GsocOrganization, GsocYearFile } from "../src/lib/types";

export interface GsocCoverage {
  api: Record<string, { organizations: number; projects: number; sha256: string }>;
  cncf: { revision: string; files: Record<string, { sha256: string; projects: number; organizations: number; warnings: string[] }> };
  tagReport: { canonical: Record<string, number>; unmatched: Record<string, number> };
  orgCount: number;
  projectCount: number;
  warnings: string[];
}

const EMAIL = /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i;

function validUrl(url: string, context: string) {
  assert(!/[\s<>"\\]/.test(url), `URL artifacts: ${context}: ${url}`);
  let parsed: URL;
  try { parsed = new URL(url); } catch { assert.fail(`Invalid URL: ${context}: ${url}`); }
  assert(["https:", "http:"].includes(parsed.protocol) && parsed.hostname.includes("."), `Invalid URL: ${context}: ${url}`);
}

export function auditGsocData(orgs: GsocOrganization[], years: Map<number, GsocYearFile>, coverage: GsocCoverage, log: (line: string) => void = console.log) {
  assert(Array.isArray(orgs) && orgs.length >= 100, "GSoC organizations must not be empty");
  assert(/^[a-f0-9]{40}$/.test(coverage.cncf.revision), "Missing immutable CNCF revision");
  const slugs = new Set<string>();
  const byYearCounts = new Map<string, number>();
  for (const org of orgs) {
    assert(org.slug && /^[a-z0-9][a-z0-9-]*$/.test(org.slug) && !slugs.has(org.slug), `Bad or duplicate slug: ${org.slug}`); slugs.add(org.slug);
    assert(org.name?.trim(), `Missing name: ${org.slug}`);
    assert(org.years.length >= 1 && org.years.every((y, i) => Number.isInteger(y) && y >= 2005 && (i === 0 || y > org.years[i - 1])), `Years missing or unsorted: ${org.slug}`);
    assert.equal(org.firstYear, org.years[0], `firstYear differs: ${org.slug}`);
    assert.equal(org.latestYear, org.years[org.years.length - 1], `latestYear differs: ${org.slug}`);
    assert.deepEqual(Object.keys(org.projectsByYear).map(Number).sort((a, b) => a - b), org.years, `projectsByYear keys differ from years: ${org.slug}`);
    assert.equal(org.projectCount, Object.values(org.projectsByYear).reduce((n, v) => n + v, 0), `projectCount differs: ${org.slug}`);
    assert(typeof org.category === "string" && org.category, `Missing category: ${org.slug}`);
    assert(typeof org.description === "string", `Missing description: ${org.slug}`);
    for (const [k, u] of Object.entries({ website: org.website, logoUrl: org.logoUrl, ...org.links, ...org.archiveByYear })) if (u) validUrl(u, `${org.slug}.${k}`);
    // Mailing-list and chat links may legitimately contain an address; prose and names must not.
    assert(!EMAIL.test(JSON.stringify({ name: org.name, description: org.description, topics: org.topics, technologies: org.technologies })), `Email address shipped in organization record: ${org.slug}`);
    assert.deepEqual([...org.technologies], [...new Set(org.technologies)], `Duplicate technologies: ${org.slug}`);
    for (const y of org.years) byYearCounts.set(String(y), (byYearCounts.get(String(y)) || 0) + 1);
  }
  let projectTotal = 0;
  for (const [year, file] of years) {
    assert.equal(file.year, year, `Year file mismatch: ${year}`);
    const ids = new Set<string>();
    for (const p of file.projects) {
      projectTotal++;
      assert(p.id && !ids.has(p.id), `Duplicate project id: ${p.id}`); ids.add(p.id);
      assert(slugs.has(p.orgSlug), `Project for unknown organization: ${p.id}`);
      assert.equal(p.year, year, `Project year differs from file: ${p.id}`);
      assert(p.title?.trim(), `Missing title: ${p.id}`);
      assert(["gsoc", "cncf"].includes(p.origin) && ["accepted", "proposed"].includes(p.status), `Bad origin/status: ${p.id}`);
      for (const u of [p.projectUrl, p.codeUrl, ...p.upstreamIssueUrls].filter(Boolean)) validUrl(u, p.id);
      for (const m of p.mentors) {
        assert(m.name?.trim() && !EMAIL.test(m.name) && !/https?:|\[|\]|@/.test(m.name), `Invalid mentor name: ${p.id}: ${m.name}`);
        assert(!("email" in m), `Mentor email shipped: ${p.id}`);
        assert(!m.github || /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(m.github), `Invalid GitHub handle: ${p.id}: ${m.github}`);
      }
      assert(!EMAIL.test(JSON.stringify({ title: p.title, summary: p.summary, contributor: p.contributor, mentors: p.mentors, skills: p.skills, subProject: p.subProject })), `Email address shipped in project: ${p.id}`);
      if (p.origin === "cncf") {
        assert(p.sources.length === 1 && p.sources[0].revision === coverage.cncf.revision && p.sources[0].line > 0 && /^[a-f0-9]{64}$/.test(p.sources[0].contentHash), `Bad CNCF provenance: ${p.id}`);
        assert.equal(p.sources[0].url, `https://github.com/cncf/mentoring/blob/${coverage.cncf.revision}/${p.sources[0].path}#L${p.sources[0].line}`, `Bad CNCF source link: ${p.id}`);
        assert(p.subProject, `CNCF idea without upstream project: ${p.id}`);
      }
    }
    if (coverage.api[String(year)]) assert(file.projects.filter((p) => p.origin === "gsoc").length === coverage.api[String(year)].projects, `Coverage count differs for ${year}`);
  }
  assert.equal(coverage.projectCount, projectTotal, "Coverage project count differs");
  assert.equal(coverage.orgCount, orgs.length, "Coverage organization count differs");

  // Tag cardinality report (informational).
  const canonical = Object.entries(coverage.tagReport.canonical).sort((a, b) => b[1] - a[1]);
  const unmatched = Object.entries(coverage.tagReport.unmatched).sort((a, b) => b[1] - a[1]);
  const techCount = new Map<string, number>();
  for (const org of orgs) for (const t of org.technologies) techCount.set(t, (techCount.get(t) || 0) + 1);
  log(`GSoC tags: ${techCount.size} distinct technologies across ${orgs.length} organizations; ${canonical.length} canonical labels, ${unmatched.length} unmatched raw tags.`);
  log(`  top technologies: ${[...techCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t, n]) => `${t} (${n})`).join(", ")}`);
  if (unmatched.length) log(`  unmatched (add to scripts/gsoc-tag-aliases.json): ${unmatched.slice(0, 25).map(([t, n]) => `${t}×${n}`).join(", ")}${unmatched.length > 25 ? ", …" : ""}`);
  log(`  organizations per year: ${[...byYearCounts.entries()].sort().map(([y, n]) => `${y}:${n}`).join(" ")}`);
}

export function main() {
  const dir = path.join(process.cwd(), "public/data/gsoc");
  if (!fs.existsSync(path.join(dir, "organizations.json"))) { console.log("No GSoC data yet; skipping GSoC audit."); return; }
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const years = new Map<number, GsocYearFile>();
  for (const f of fs.readdirSync(dir)) { const m = f.match(/^projects-(\d{4})\.json$/); if (m) years.set(Number(m[1]), read(f)); }
  const coverage: GsocCoverage = read("source-coverage.json");
  auditGsocData(read("organizations.json"), years, coverage);
  console.log(`GSoC integrity checks passed for ${coverage.orgCount} organizations and ${coverage.projectCount} projects.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
