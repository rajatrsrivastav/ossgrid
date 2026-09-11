/** Reproducible CNCF importer. Unknown sections and failed fetches are errors. */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import type { Organization, Project, ProjectSource } from "../src/lib/types";
import { canonicalOrganization, cleanMarkdown, contentHash, extractUrls, parseReadme, parseSkills, slugify, type ParsedProject, type SectionRecord } from "./lib/lfx-parser";
import { auditData } from "./audit-data";

const ROOT = "programs/lfx-mentorship/";
const REPO = "https://github.com/cncf/mentoring";
export interface OrgMetadata { name: string; description: string; website: string; github: string; category: string; sources: string[]; }
export interface SourceFile { path: string; sha256: string; projects: number; sections: (SectionRecord & { projectId?: string })[]; }
export interface Coverage { revision: string; policy: string; files: SourceFile[]; projectCount: number; }
interface Candidate { data: ParsedProject; source: ProjectSource; year: number; cohort: string; term: string; termIndex: number; }

const historicalNames: Record<string, string> = {
  "2019": "2019 Pilot", "2020/q1": "2020 Q1", "2020/q2": "2020 Q2", "2020/q3-q4": "2020 Q3–Q4",
  "2021/01-Spring": "2021 Spring (Mar-May)", "2021/02-Summer": "2021 Summer (Jun-Aug)", "2021/03-Fall": "2021 Fall (Sep-Nov)",
  "2022/01-Spring": "2022 Spring (Mar-May)", "2022/02-Summer": "2022 Summer (Jun-Aug)",
};
function cohortInfo(file: string) {
  const parts = file.split("/");
  const year = Number(parts[0]);
  const cohort = year === 2019 ? "2019" : parts.slice(0, 2).join("/");
  const termIndex = year === 2019 ? 0 : Number(parts[1].match(/^(?:q)?(\d+)/)?.[1]);
  if (!Number.isInteger(termIndex)) throw new Error(`Unknown cohort: ${file}`);
  const months = ["", "Mar-May", "Jun-Aug", "Sep-Nov"];
  const term = historicalNames[cohort] || `${year} Term ${termIndex} (${months[termIndex]})`;
  if (!historicalNames[cohort] && !months[termIndex]) throw new Error(`Unmapped cohort: ${file}`);
  return { year, cohort, term, termIndex };
}
interface ExportProgram {
  issue_number: number; cncf_project: string; program_name_short: string; description: string;
  technologies?: string; skills?: string; expected_outcomes?: string; upstream_issue_url?: string; issue_url?: string; lfx_url?: string;
  mentors: { name: string; github_handle?: string; email?: string }[];
}
function parseExport(text: string): ParsedProject[] {
  const data = JSON.parse(text);
  if (!Array.isArray(data.programs) || data._count !== data.programs.length) throw new Error("Invalid LFX export count/schema");
  return data.programs.map((p: ExportProgram) => {
    if (!p.cncf_project || !p.program_name_short || !p.description || !Array.isArray(p.mentors)) throw new Error(`Incomplete export record ${p.issue_number}`);
    const parts = p.description.split(/^#{1,6}\s+Expected outcomes?\s*$/im);
    const mentors = p.mentors.map(m => {
      if (!m.name?.trim()) throw new Error(`Missing export mentor name in ${p.issue_number}`);
      return { name: cleanMarkdown(m.name), github: (m.github_handle || "").replace(/^@/, ""), email: m.email || "" };
    });
    const offset = text.indexOf(`"issue_number": ${p.issue_number}`);
    return { organization: canonicalOrganization(p.cncf_project), title: cleanMarkdown(p.program_name_short), description: cleanMarkdown(parts[0].replace(/^#{1,6}\s+Description\s*/i, "")), expectedOutcome: cleanMarkdown(p.expected_outcomes || parts.slice(1).join("\n")), skills: parseSkills(p.skills || ""), technologies: parseSkills(p.technologies || ""), mentors, mentees: [], upstreamIssueUrls: extractUrls(p.upstream_issue_url || ""), lfxUrls: extractUrls(p.lfx_url || ""), links: extractUrls(JSON.stringify(p).replace(/\\n/g, "\n").replace(/\\"/g, '"')), line: text.slice(0, offset).split("\n").length, raw: JSON.stringify(p) };
  });
}
async function get(url: string): Promise<string> {
  const response = await fetch(url, { headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  return response.text();
}
export async function buildDataset(documents: Map<string, string>, revision: string, metadata: Record<string, OrgMetadata>) {
  const known = Object.fromEntries(Object.entries(metadata).map(([id, m]) => [id, m.name]));
  const candidates: Candidate[] = [];
  const files: SourceFile[] = [];
  // Accepted/export records take precedence over proposal copies, without mixing conflicting fields.
  const priority = (f: string) => f.endsWith("lfx-export.json") ? 0 : f.endsWith("project_ideas.md") ? 2 : 1;
  const paths = [...documents.keys()].sort((a, b) => priority(a) - priority(b) || a.localeCompare(b));
  for (const file of paths) {
    const text = documents.get(file)!;
    const info = cohortInfo(file);
    const status = file.endsWith("project_ideas.md") ? "proposed" : "accepted";
    const parsed = file.endsWith(".json") ? { projects: parseExport(text), sections: [] as SectionRecord[] } : parseReadme(text, known);
    if (!parsed.sections.length && parsed.projects.length) parsed.sections = parsed.projects.map(p => ({ line: p.line, heading: p.title, kind: "project" }));
    files.push({ path: file, sha256: contentHash(text), projects: parsed.projects.length, sections: parsed.sections });
    for (const data of parsed.projects) {
      const source: ProjectSource = { url: `${REPO}/blob/${revision}/${ROOT}${file}#L${data.line}`, path: file, revision, line: data.line, contentHash: contentHash(data.raw), status };
      candidates.push({ data, source, ...info });
    }
  }
  const projects: Project[] = [];
  const identities = new Map<string, Project>();
  const titles = new Map<string, Project[]>();
  const sectionBySource = new Map(files.flatMap(f => f.sections.map(s => [`${f.path}:${s.line}`, s] as const)));
  const sourceEquivalences: Record<string, string> = JSON.parse(fs.readFileSync(path.join(__dirname, "source-equivalences.json"), "utf8"));
  for (const c of candidates) {
    const p = c.data, orgId = slugify(canonicalOrganization(p.organization));
    const scope = `${orgId}-${c.year}-t${c.termIndex}`;
    const matchTitle = sourceEquivalences[`${c.source.path}:${p.title}`] || p.title;
    const titleKey = `${scope}-${slugify(matchTitle)}`;
    const strongLinks = [...p.lfxUrls.filter(u => !u.includes("people.communitybridge.org")), ...p.upstreamIssueUrls.filter(u => /github\.com\/[^/]+\/[^/]+\/issues\/\d+(?:$|#)/.test(u))];
    const keys = strongLinks.map(u => `${scope}:${u}`);
    let existing = keys.map(k => identities.get(k)).find(e => e && !e.sources.some(s => s.path === c.source.path));
    // Different non-empty LFX URLs identify distinct projects even when titles/issues repeat.
    if (existing?.lfxUrl && p.lfxUrls.length && !p.lfxUrls.includes(existing.lfxUrl)) existing = undefined;
    if (!existing) existing = (titles.get(titleKey) || []).find(e => !e.lfxUrl || !p.lfxUrls.length || p.lfxUrls.includes(e.lfxUrl));
    if (existing) {
      // Same-source duplicates must really be identical; otherwise make the conflict reviewable.
      if (!sourceEquivalences[`${c.source.path}:${p.title}`] && existing.sources.some(s => s.path === c.source.path) && (existing.title !== p.title || existing.description !== p.description)) throw new Error(`Conflicting duplicate ${c.source.path}:${p.title}`);
      existing.sources.push(c.source);
      sectionBySource.get(`${c.source.path}:${c.source.line}`)!.projectId = existing.id;
      for (const k of keys) if (!identities.has(k)) identities.set(k, existing);
      continue;
    }
    const baseId = `${scope}-${slugify(p.title)}`;
    const id = projects.some(p => p.id === baseId) ? `${baseId}-${contentHash(strongLinks[0] || p.raw).slice(0, 8)}` : baseId;
    const missingFields = ["description", "expectedOutcome", "skills", "technologies", "mentors", "mentees", "upstreamIssueUrls", "lfxUrls"].filter(k => !p[k as keyof ParsedProject] || (p[k as keyof ParsedProject] as { length: number }).length === 0);
    const project: Project = { id, title: p.title, organization: metadata[orgId]?.name || p.organization, organizationId: orgId, description: p.description, expectedOutcome: p.expectedOutcome, skills: p.skills, technologies: p.technologies, mentors: p.mentors, mentees: p.mentees.map(m => ({ name: m.name, github: m.github })), upstreamIssueUrl: p.upstreamIssueUrls[0] || "", upstreamIssueUrls: p.upstreamIssueUrls, lfxUrl: p.lfxUrls[0] || "", links: p.links, program: c.year <= 2020 ? "CommunityBridge" : "LFX Mentorship", status: c.source.status, sources: [c.source], missingFields, term: c.term, year: c.year, termIndex: c.termIndex };
    projects.push(project);
    sectionBySource.get(`${c.source.path}:${c.source.line}`)!.projectId = id;
    for (const k of keys) if (!identities.has(k)) identities.set(k, project);
    titles.set(titleKey, [...(titles.get(titleKey) || []), project]);
  }
  const organizations: Organization[] = [];
  for (const id of [...new Set(projects.map(p => p.organizationId))]) {
    const meta = metadata[id];
    if (!meta) throw new Error(`Missing sourced organization metadata: ${id}`);
    const orgProjects = projects.filter(p => p.organizationId === id).sort((a, b) => b.year - a.year || b.termIndex - a.termIndex || a.id.localeCompare(b.id));
    const png = `/logos/${id}.png`, svg = `/logos/${id}.svg`;
    const initials = meta.name.split(/\s+/).map(w => w[0]).slice(0, 2).join("").replace(/[^\w]/g, "");
    const logoUrl = fs.existsSync(path.join(process.cwd(), "public", png)) ? png : fs.existsSync(path.join(process.cwd(), "public", svg)) ? svg : `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="#334155"/><text x="40" y="50" text-anchor="middle" fill="white" font-size="26">${initials}</text></svg>`)}`;
    organizations.push({ id, name: meta.name, description: meta.description, website: meta.website, github: meta.github, sources: meta.sources, foundation: "CNCF", category: meta.category, logoUrl, projects: orgProjects, projectCount: orgProjects.length, terms: [...new Set(orgProjects.map(p => p.term))], years: [...new Set(orgProjects.map(p => p.year))], technologies: [...new Set(orgProjects.flatMap(p => [...p.technologies, ...p.skills]))].sort() });
  }
  organizations.sort((a, b) => b.years[0] - a.years[0] || b.projectCount - a.projectCount || a.id.localeCompare(b.id));
  const coverage: Coverage = { revision, policy: "All official cohort project records, including proposal-only entries labeled proposed. Export/accepted records take precedence over proposal copies. Missing source values remain empty.", files: files.sort((a, b) => a.path.localeCompare(b.path)), projectCount: projects.length };
  return { organizations, projects: organizations.flatMap(o => o.projects), coverage };
}
export async function main() {
  const args = process.argv.slice(2), option = (name: string) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
  const lockPath = path.join(__dirname, "lfx-source.json");
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  const revision = args.includes("--refresh") ? JSON.parse(await get("https://api.github.com/repos/cncf/mentoring/commits/main")).sha : lock.revision;
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error("Source revision must be an immutable commit SHA");
  const local = option("--source-dir");
  let sourcePaths: string[];
  if (local) {
    sourcePaths = fs.readdirSync(local, { recursive: true }).map(String).filter(f => /^(?:2019\/README\.md|\d{4}\/[^/]+\/(?:README\.md|project_ideas\.md|selected_projects\.md|lfx-export\.json))$/.test(f));
  } else {
    const tree = JSON.parse(await get(`https://api.github.com/repos/cncf/mentoring/git/trees/${revision}?recursive=1`));
    if (tree.truncated) throw new Error("GitHub returned an incomplete tree");
    sourcePaths = tree.tree.map((f: { path: string }) => f.path).filter((p: string) => p.startsWith(ROOT)).map((p: string) => p.slice(ROOT.length)).filter((p: string) => /^(?:2019\/README\.md|\d{4}\/[^/]+\/(?:README\.md|project_ideas\.md|selected_projects\.md|lfx-export\.json))$/.test(p));
  }
  sourcePaths.sort();
  if (!args.includes("--refresh") && JSON.stringify(sourcePaths) !== JSON.stringify(lock.paths)) throw new Error("Source file inventory differs from reviewed lock");
  const documents = new Map<string, string>();
  for (const file of sourcePaths) documents.set(file, local ? fs.readFileSync(path.join(local, file), "utf8") : await get(`https://raw.githubusercontent.com/cncf/mentoring/${revision}/${ROOT}${file}`));
  const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, "org-metadata.json"), "utf8"));
  const result = await buildDataset(documents, revision, metadata);
  auditData(result.organizations, result.projects, result.coverage);
  const outputs = { "organizations.json": result.organizations, "projects.json": result.projects, "source-coverage.json": result.coverage };
  for (const [file, data] of Object.entries(outputs)) {
    const target = path.join(process.cwd(), "public/data", file), contents = JSON.stringify(data, null, 2) + "\n";
    if (args.includes("--check")) { if (fs.readFileSync(target, "utf8") !== contents) throw new Error(`Regeneration differs: ${file}`); }
    else fs.writeFileSync(target, contents);
  }
  if (args.includes("--refresh") && !args.includes("--check")) fs.writeFileSync(lockPath, JSON.stringify({ revision, paths: sourcePaths, counts: lock.counts, hashes: Object.fromEntries(result.coverage.files.map(f => [f.path, f.sha256])) }, null, 2) + "\n");
  console.log(`${args.includes("--check") ? "Reproduced" : "Generated"} ${result.projects.length} projects, ${result.organizations.length} organizations, ${sourcePaths.length} source documents at ${revision}`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => { console.error(error); process.exitCode = 1; });
