import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import type { Organization, Project } from "../src/lib/types";
import type { Coverage } from "./fetch-lfx-data";
import { ORG_ALIASES } from "./lib/org-aliases";
import { slugify } from "./lib/lfx-parser";

function validUrl(url: string, context: string) {
  assert(!/[\s<>"\]\\]/.test(url), `URL artifacts: ${context}: ${url}`);
  const parsed = new URL(url);
  assert(["https:", "http:"].includes(parsed.protocol) && parsed.hostname, `Invalid URL: ${context}`);
  assert((url.match(/\)/g)?.length || 0) <= (url.match(/\(/g)?.length || 0), `Unbalanced URL: ${context}: ${url}`);
}
export function auditData(orgs: Organization[], projects: Project[], coverage: Coverage) {
  assert(Array.isArray(orgs) && orgs.length > 0, "Organizations must not be empty");
  assert(Array.isArray(projects) && projects.length > 0, "Projects must not be empty");
  assert(/^[a-f0-9]{40}$/.test(coverage.revision), "Missing immutable source revision");
  assert.equal(coverage.projectCount, projects.length, "Coverage project count differs");
  const ids = new Set<string>(), orgIds = new Set<string>(), sourceIds = new Set<string>();
  const lock = JSON.parse(fs.readFileSync(path.join(__dirname, "lfx-source.json"), "utf8"));
  const expectedPaths: string[] = lock.paths;
  assert.deepEqual(coverage.files.map(f => f.path).sort(), expectedPaths, "Missing/unexpected source files; review the source lock before importing new cohorts");
  for (const org of orgs) {
    assert(org.id && !orgIds.has(org.id), `Duplicate organization ${org.id}`); orgIds.add(org.id);
    assert(!ORG_ALIASES[org.id] || slugify(ORG_ALIASES[org.id]) === org.id, `Fragmented organization ${org.id}`);
    assert(org.name && org.description?.trim().length > 0, `Missing/low-quality organization description: ${org.id}`);
    assert(org.sources?.length, `Missing organization sources: ${org.id}`);
    [...org.sources, org.website, org.github].filter(Boolean).forEach(u => validUrl(u, org.id));
    assert.equal(org.projectCount, org.projects.length, `Incorrect projectCount: ${org.id}`);
    assert.deepEqual(org.years, [...new Set(org.projects.map(p => p.year))], `Incorrect years: ${org.id}`);
    assert.deepEqual(org.terms, [...new Set(org.projects.map(p => p.term))], `Incorrect terms: ${org.id}`);
    assert.deepEqual(org.technologies, [...new Set(org.projects.flatMap(p => [...p.technologies, ...p.skills]))].sort(), `Incorrect technologies: ${org.id}`);
  }
  assert.deepEqual(orgs.flatMap(o => o.projects), projects, "Nested and flat datasets differ");
  for (const p of projects) {
    assert(p.id && !ids.has(p.id), `Duplicate project ID: ${p.id}`); ids.add(p.id);
    const org = orgs.find(o => o.id === p.organizationId);
    assert(org && org.name === p.organization && org.projects.some(x => x.id === p.id), `Invalid organization: ${p.id}`);
    assert(p.title?.trim() && p.term && Number.isInteger(p.year) && Number.isInteger(p.termIndex), `Incomplete identity: ${p.id}`);
    assert(["accepted", "proposed"].includes(p.status), `Missing source status: ${p.id}`);
    assert(p.program === (p.year <= 2020 ? "CommunityBridge" : "LFX Mentorship"), `Wrong program: ${p.id}`);
    assert(p.sources?.length, `Missing project provenance: ${p.id}`);
    assert.equal(p.status, p.sources[0].status, `Incorrect source priority: ${p.id}`);
    for (const source of p.sources) {
      assert.equal(source.revision, coverage.revision, `Mixed source revisions: ${p.id}`);
      assert(/^[a-f0-9]{64}$/.test(source.contentHash), `Missing content hash: ${p.id}`);
      assert(source.line > 0 && expectedPaths.includes(source.path), `Invalid source position: ${p.id}`);
      assert.equal(source.url, `https://github.com/cncf/mentoring/blob/${coverage.revision}/programs/lfx-mentorship/${source.path}#L${source.line}`, `Invalid source link: ${p.id}`);
      const key = `${source.path}:${source.line}`;
      assert(!sourceIds.has(key), `Source record used twice: ${key}`); sourceIds.add(key);
    }
    for (const key of ["description", "expectedOutcome", "skills", "technologies", "mentors", "mentees", "upstreamIssueUrls"] as const) {
      assert(typeof p[key] === (key === "description" || key === "expectedOutcome" ? "string" : "object"), `Invalid ${key}: ${p.id}`);
      assert.equal(p.missingFields.includes(key), p[key].length === 0, `Undocumented missing ${key}: ${p.id}`);
    }
    assert.equal(p.missingFields.includes("lfxUrls"), !p.lfxUrl, `Undocumented missing LFX URL: ${p.id}`);
    // Missing descriptions are retained only when the official archive is a table without descriptions.
    assert(p.description || (p.year <= 2020 && p.sources[0].path.endsWith("README.md")), `Missing project description: ${p.id}`);
    assert.equal(p.upstreamIssueUrl, p.upstreamIssueUrls[0] || "", `Primary issue URL differs: ${p.id}`);
    [...p.links, ...p.upstreamIssueUrls, p.lfxUrl].filter(Boolean).forEach(u => validUrl(u, p.id));
    for (const m of [...p.mentors, ...p.mentees]) {
      assert(m.name?.trim() && !/https?:|github\.com|\[|\]|@/.test(m.name), `Invalid person name: ${p.id}: ${m.name}`);
      assert(!m.github || /^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(m.github), `Invalid GitHub handle: ${p.id}: ${m.github}`);
    }
    assert.equal(new Set(p.skills).size, p.skills.length, `Duplicate skills: ${p.id}`);
  }
  const covered = new Set<string>();
  for (const file of coverage.files) {
    assert.equal(file.projects, lock.counts[file.path], `Source project count changed; reconcile all entries and update the reviewed lock: ${file.path}`);
    if (coverage.revision === lock.revision) assert.equal(file.sha256, lock.hashes[file.path], `Source content differs from pinned revision: ${file.path}`);
    assert(/^[a-f0-9]{64}$/.test(file.sha256), `Missing source hash: ${file.path}`);
    const rows = file.sections.filter(s => s.kind === "project");
    assert.equal(file.projects, rows.length, `Unreconciled source count: ${file.path}`);
    for (const section of rows) {
      assert(section.projectId && ids.has(section.projectId), `Unreconciled entry: ${file.path}:${section.line}`);
      const key = `${file.path}:${section.line}`; covered.add(key);
      assert(projects.find(p => p.id === section.projectId)?.sources.some(s => s.path === file.path && s.line === section.line), `Wrong source mapping: ${key}`);
    }
  }
  assert.deepEqual([...sourceIds].sort(), [...covered].sort(), "Source coverage differs from projects");
}
export function main() {
  const read = (file: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/data", file), "utf8"));
  const projects = read("projects.json");
  auditData(read("organizations.json"), projects, read("source-coverage.json"));
  console.log(`Integrity checks passed for ${projects.length} projects. Source reproduction is checked separately; this is not a claim of manual verification.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
