/**
 * GSoC importer. Primary source: api.gsocorganizations.dev (accepted organizations and projects,
 * 2016 to 2026). Secondary: cncf/mentoring programs/summerofcode/<year>.md (CNCF idea lists,
 * pinned to a commit in scripts/gsoc-cncf-source.json).
 *
 *   --refresh        fetch live data, move the CNCF pin to main, rewrite the raw cache
 *   --check          rebuild and fail when the committed output differs
 *   --year 2025      only rebuild that year's projects file (organizations.json is always rebuilt)
 *   --source-dir d   read d/gsoc/<year>.json, d/gsoc/organizations.json, d/cncf/<year>.md instead of the network
 *
 * Raw downloads are cached in scripts/.cache/gsoc (git-ignored) so --check works offline.
 * Mentor emails from the CNCF files stay in the pipeline and are never written to public/.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import Fuse from "fuse.js";
import type { GsocMentor, GsocOrganization, GsocProject, GsocYearFile, ProjectSource } from "../src/lib/types";
import { GSOC_SEARCH_KEYS, gsocCurrentYear, gsocToExplorerOrg } from "../src/lib/explorer/gsoc-model";
import { contentHash, slugify } from "./lib/lfx-parser";
import { parseCncfGsoc } from "./lib/cncf-gsoc-parser";
import { canonicalTag } from "./lib/tag-aliases";
import { auditGsocData, type GsocCoverage } from "./audit-gsoc-data";

const API = "https://api.gsocorganizations.dev";
const REPO = "https://github.com/cncf/mentoring";
const YEARS = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2016 + i);
const OUT_DIR = path.join(process.cwd(), "public/data/gsoc");
const CACHE_DIR = path.join(__dirname, ".cache");
const CNCF_SLUG = "cncf";

interface ApiProject { title: string; short_description: string; description: string; student_name: string; code_url: string; project_url: string; proposal_id?: string }
interface ApiYearOrg {
  name: string; image_url: string; image_background_color: string; description: string; url: string; category: string;
  projects_url: string; ideas_url?: string; guide_url?: string; topics: string[]; technologies: string[];
  irc_channel: string; contact_email: string; mailing_list: string; twitter_url: string; blog_url: string; num_projects: number; projects: ApiProject[];
}
interface ApiYearFile { year: number; archive_url: string; organizations: ApiYearOrg[] }
interface ApiOrg extends Omit<ApiYearOrg, "projects_url" | "num_projects" | "projects"> { years: Record<string, { projects_url: string; num_projects: number; projects: ApiProject[] }> }

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

async function get(url: string): Promise<string> {
  const headers: Record<string, string> = { "User-Agent": "ossgrid-sync (https://www.ossgrid.tech)" };
  if (url.includes("github") && process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  return response.text();
}

/** Read from --source-dir, else the cache, else the network (writing the cache). */
async function load(relative: string, url: string, refresh: boolean, sourceDir?: string): Promise<string> {
  if (sourceDir) return fs.readFileSync(path.join(sourceDir, relative), "utf8");
  const cached = path.join(CACHE_DIR, relative);
  if (!refresh && fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");
  const text = await get(url);
  fs.mkdirSync(path.dirname(cached), { recursive: true });
  fs.writeFileSync(cached, text);
  return text;
}

/** HTML to plain text. Email addresses are removed: OSSGrid never publishes personal contact details. */
export function stripHtml(html: string): string {
  return (html || "").replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function normalizeUrl(url: string): string {
  const u = (url || "").trim();
  // Drop mailto:, malformed values, and links that embed a personal address (e.g. code-review "owner:" queries).
  if (!u || u.startsWith("mailto:") || /[\s<>"\\]/.test(u) || /[\w.+-]+@(?:gmail|googlemail|outlook|hotmail|yahoo|protonmail|icloud)\./i.test(u)) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (/^www\./i.test(u)) return `https://${u}`;
  return "";
}

function chatUrl(irc: string): string {
  const u = normalizeUrl(irc);
  if (u) return u;
  const m = irc.match(/#([\w-]+)\s+on\s+(libera|oftc|freenode)/i);
  if (m) return m[2].toLowerCase() === "libera" ? `https://web.libera.chat/#${m[1]}` : m[2].toLowerCase() === "oftc" ? `https://webchat.oftc.net/?channels=${m[1]}` : "";
  return "";
}

export interface TagReport { canonical: Record<string, number>; unmatched: Record<string, number> }

function normalizeTags(raw: string[], report: TagReport): string[] {
  const out: string[] = [];
  for (const r of raw) {
    const { label, matched } = canonicalTag(r);
    if (!label) continue;
    if (matched) report.canonical[label] = (report.canonical[label] || 0) + 1;
    else report.unmatched[label] = (report.unmatched[label] || 0) + 1;
    if (!out.includes(label)) out.push(label);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function publicMentor(m: { name: string; github: string; primary?: boolean }): GsocMentor {
  return m.primary ? { name: m.name, github: m.github, primary: true } : { name: m.name, github: m.github };
}

export interface BuildInput {
  orgsJson: string;
  yearJson: Map<number, string>;
  cncfMarkdown: Map<number, string>;
  cncfRevision: string;
  aliases: Record<string, string>;
  /** Sanity floor for organizations.json; lowered only in tests. */
  minOrgs?: number;
}

/** Loose key for matching an organization listed under slightly different names across years. */
export function orgNameKey(name: string): string {
  return slugify(name)
    .replace(/\b(?:the|project|foundation|initiative|inc|llc|gmbh|org|com|team|group|lab|labs|software|open-source|opensource)\b/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; }
}
const GENERIC_HOSTS = new Set(["github.com", "gitlab.com", "sourceforge.net", "bitbucket.org", "google.com", "sites.google.com", "wordpress.com", "medium.com"]);

export function buildGsocDataset(input: BuildInput) {
  const { aliases } = input;
  const bySlug = new Set<string>(), byHost = new Map<string, string | null>(), byKey = new Map<string, string | null>();
  const register = (slug: string, name: string, url: string) => {
    bySlug.add(slug);
    const host = hostOf(url);
    if (host && !GENERIC_HOSTS.has(host)) byHost.set(host, byHost.has(host) && byHost.get(host) !== slug ? null : slug);
    const key = orgNameKey(name);
    if (key) byKey.set(key, byKey.has(key) && byKey.get(key) !== slug ? null : slug);
  };
  /** Explicit alias → same slug → same website host → same loose name key → new slug. */
  const canonicalSlug = (name: string, url = "") => {
    const s = slugify(name);
    if (aliases[s]) return aliases[s];
    if (bySlug.has(s)) return s;
    const host = hostOf(url);
    if (host && !GENERIC_HOSTS.has(host) && byHost.get(host)) return byHost.get(host)!;
    const key = orgNameKey(name);
    if (key && byKey.get(key)) return byKey.get(key)!;
    return s;
  };
  const tagReport: TagReport = { canonical: {}, unmatched: {} };
  const orgs = new Map<string, GsocOrganization>();
  const projectsByYear = new Map<number, GsocProject[]>();
  const coverage: GsocCoverage = { api: {}, cncf: { revision: input.cncfRevision, files: {} }, tagReport, orgCount: 0, projectCount: 0, warnings: [] };

  // 1. Organizations: one record per canonical slug, merged from organizations.json and every <year>.json.
  const upsert = (a: Omit<ApiYearOrg, "projects_url" | "num_projects" | "projects">, yearsData: Record<string, { projects_url: string; num_projects: number }>) => {
    const slug = canonicalSlug(a.name, a.url);
    const years = Object.keys(yearsData).map(Number).sort((x, y) => x - y);
    const existing = orgs.get(slug);
    register(slug, a.name, a.url);
    const latestArchive = yearsData[String(years[years.length - 1])]?.projects_url || "";
    const record: GsocOrganization = existing ?? {
      slug, name: a.name, logoUrl: "", logoBackground: "", description: "", website: "", category: "", topics: [], technologies: [],
      years: [], projectsByYear: {}, archiveByYear: {}, projectCount: 0, firstYear: 0, latestYear: 0,
      links: { ideas: "", guide: "", chat: "", mailingList: "", blog: "", twitter: "", archive: "" },
    };
    const newer = !existing || years[years.length - 1] >= record.latestYear;
    if (newer) {
      record.name = a.name;
      record.logoUrl = normalizeUrl(a.image_url) || record.logoUrl;
      record.logoBackground = a.image_background_color || record.logoBackground;
      record.description = stripHtml(a.description) || record.description;
      record.website = normalizeUrl(a.url) || record.website;
      record.category = a.category || record.category;
      record.links = {
        ideas: normalizeUrl(a.ideas_url || "") || record.links.ideas,
        guide: normalizeUrl(a.guide_url || "") || record.links.guide,
        chat: chatUrl(a.irc_channel || "") || record.links.chat,
        mailingList: normalizeUrl(a.mailing_list || "") || record.links.mailingList,
        blog: normalizeUrl(a.blog_url || "") || record.links.blog,
        twitter: normalizeUrl(a.twitter_url || "") || record.links.twitter,
        archive: latestArchive || record.links.archive,
      };
    }
    record.topics = [...new Set([...record.topics, ...(a.topics || []).map((t) => t.trim().toLowerCase()).filter(Boolean)])].sort();
    record.technologies = [...new Set([...record.technologies, ...normalizeTags(a.technologies || [], tagReport)])].sort((x, y) => x.localeCompare(y));
    for (const y of years) {
      record.projectsByYear[String(y)] = yearsData[String(y)].num_projects;
      if (yearsData[String(y)].projects_url) record.archiveByYear[String(y)] = yearsData[String(y)].projects_url;
    }
    record.years = Object.keys(record.projectsByYear).map(Number).sort((x, y) => x - y);
    record.firstYear = record.years[0];
    record.latestYear = record.years[record.years.length - 1];
    record.projectCount = Object.values(record.projectsByYear).reduce((n, v) => n + v, 0);
    orgs.set(slug, record);
    return record;
  };
  const apiOrgs: ApiOrg[] = JSON.parse(input.orgsJson);
  if (!Array.isArray(apiOrgs) || apiOrgs.length < (input.minOrgs ?? 100)) throw new Error(`organizations.json looks wrong (fewer than ${input.minOrgs ?? 100} records)`);
  for (const a of apiOrgs) upsert(a, a.years);

  // 2. Accepted projects per year from <year>.json.
  for (const [year, text] of [...input.yearJson.entries()].sort((a, b) => a[0] - b[0])) {
    const file: ApiYearFile = JSON.parse(text);
    if (file.year !== year || !Array.isArray(file.organizations)) throw new Error(`${year}.json has an unexpected shape`);
    const list: GsocProject[] = [];
    const ids = new Set<string>();
    for (const o of file.organizations) {
      const slug = canonicalSlug(o.name, o.url);
      if (!orgs.has(slug)) coverage.warnings.push(`${year}: organization "${o.name}" is missing from organizations.json; record built from ${year}.json`);
      upsert(o, { [String(year)]: { projects_url: o.projects_url, num_projects: o.num_projects ?? o.projects.length } });
      for (const p of o.projects || []) {
        if (!p.title?.trim()) continue;
        const base = `${slug}-${year}-${slugify(p.title).slice(0, 60)}`;
        let id = base, n = 2;
        while (ids.has(id)) id = `${base}-${n++}`;
        ids.add(id);
        const description = stripHtml(p.description);
        list.push({
          id, orgSlug: slug, year, title: p.title.trim(), summary: stripHtml(p.short_description) || description.split("\n")[0].slice(0, 200), description,
          contributor: stripHtml(p.student_name || ""), projectUrl: normalizeUrl(p.project_url), codeUrl: normalizeUrl(p.code_url),
          origin: "gsoc", status: "accepted", skills: [], mentors: [], upstreamIssueUrls: [], sources: [], missingFields: [],
        });
      }
    }
    coverage.api[String(year)] = { organizations: file.organizations.length, projects: list.length, sha256: contentHash(text) };
    projectsByYear.set(year, list);
  }

  // 3. CNCF idea lists → proposed projects under the CNCF umbrella org.
  const cncf = orgs.get(CNCF_SLUG);
  for (const [year, markdown] of [...input.cncfMarkdown.entries()].sort((a, b) => a[0] - b[0])) {
    const doc = parseCncfGsoc(markdown, year);
    const file = `${year}.md`;
    coverage.cncf.files[file] = { sha256: contentHash(markdown), projects: doc.projects.length, organizations: new Set(doc.projects.map((p) => p.organization)).size, warnings: doc.warnings };
    if (!cncf) { coverage.warnings.push(`${year}: CNCF is not in the API data; CNCF ideas skipped`); continue; }
    const list = projectsByYear.get(year) ?? [];
    const ids = new Set(list.map((p) => p.id));
    for (const p of doc.projects) {
      const base = `${CNCF_SLUG}-${year}-idea-${slugify(`${p.organization} ${p.title}`).slice(0, 70)}`;
      let id = base, n = 2;
      while (ids.has(id)) id = `${base}-${n++}`;
      ids.add(id);
      const source: ProjectSource = { url: `${REPO}/blob/${input.cncfRevision}/programs/summerofcode/${file}#L${p.line}`, path: `programs/summerofcode/${file}`, revision: input.cncfRevision, line: p.line, contentHash: p.contentHash, status: "proposed" };
      const skills = normalizeTags(p.skills, tagReport);
      const missing = (["description", "expectedOutcome", "skills", "mentors", "upstreamIssueUrls", "size"] as const).filter((k) => { const v = p[k]; return v === undefined || v === "" || (Array.isArray(v) && v.length === 0); });
      list.push({
        id, orgSlug: CNCF_SLUG, year, title: p.title, summary: p.description.split(/(?<=\.)\s/)[0].slice(0, 200), description: [p.description, p.expectedOutcome && `Expected outcome: ${p.expectedOutcome}`].filter(Boolean).join("\n\n"),
        contributor: "", projectUrl: p.upstreamIssueUrls[0] || "", codeUrl: "", origin: "cncf", status: "proposed", subProject: p.organization,
        skills, size: p.size, difficulty: p.difficulty, mentors: p.mentors.map(publicMentor), upstreamIssueUrls: p.upstreamIssueUrls, sources: [source], missingFields: [...missing],
      });
      for (const s of skills) if (!cncf.technologies.includes(s)) cncf.technologies.push(s);
    }
    cncf.technologies.sort((x, y) => x.localeCompare(y));
    projectsByYear.set(year, list);
  }

  const organizations = [...orgs.values()].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }) || a.slug.localeCompare(b.slug));
  coverage.orgCount = organizations.length;
  coverage.projectCount = [...projectsByYear.values()].reduce((n, l) => n + l.length, 0);
  return { organizations, projectsByYear, coverage };
}

export async function main() {
  const refresh = flag("--refresh"), check = flag("--check");
  const onlyYear = option("--year") ? Number(option("--year")) : undefined;
  const sourceDir = option("--source-dir");
  const pinPath = path.join(__dirname, "gsoc-cncf-source.json");
  const pin = JSON.parse(fs.readFileSync(pinPath, "utf8"));
  const aliases = JSON.parse(fs.readFileSync(path.join(__dirname, "gsoc-org-aliases.json"), "utf8"));
  delete aliases._comment;

  let revision: string = pin.revision;
  if (refresh && !sourceDir) revision = JSON.parse(await get("https://api.github.com/repos/cncf/mentoring/commits/main")).sha;
  if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error("CNCF revision must be a 40-character commit SHA");

  const orgsJson = await load("gsoc/organizations.json", `${API}/organizations.json`, refresh, sourceDir);
  const yearJson = new Map<number, string>();
  const cncfMarkdown = new Map<number, string>();
  for (const year of YEARS) {
    if (onlyYear && year !== onlyYear && fs.existsSync(path.join(OUT_DIR, `projects-${year}.json`))) continue;
    try { yearJson.set(year, await load(`gsoc/${year}.json`, `${API}/${year}.json`, refresh, sourceDir)); }
    catch (error) { console.warn(`! ${year}.json unavailable: ${error instanceof Error ? error.message : error}`); }
    if ((pin.years as number[]).includes(year)) {
      try { cncfMarkdown.set(year, await load(`cncf/${revision}/${year}.md`, `https://raw.githubusercontent.com/cncf/mentoring/${revision}/${pin.root}${year}.md`, refresh, sourceDir)); }
      catch (error) { console.warn(`! cncf ${year}.md unavailable: ${error instanceof Error ? error.message : error}`); }
    }
  }
  if (!yearJson.size) throw new Error("No GSoC year files could be loaded");

  const result = buildGsocDataset({ orgsJson, yearJson, cncfMarkdown, cncfRevision: revision, aliases });
  const yearFiles = new Map<number, GsocYearFile>([...result.projectsByYear.entries()].map(([year, projects]) => [year, { year, projects }]));
  auditGsocData(result.organizations, yearFiles, result.coverage);

  const currentYear = gsocCurrentYear(result.organizations);
  const explorerOrgs = result.organizations.map((o) => gsocToExplorerOrg(o, currentYear));
  const searchIndex = Fuse.createIndex(GSOC_SEARCH_KEYS.map((k) => k.name), explorerOrgs).toJSON();

  const outputs: Record<string, unknown> = { "organizations.json": result.organizations, "source-coverage.json": result.coverage, "search-index.json": searchIndex };
  for (const [year, file] of yearFiles) outputs[`projects-${year}.json`] = file;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let differs = 0;
  for (const [file, data] of Object.entries(outputs)) {
    const target = path.join(OUT_DIR, file);
    const contents = JSON.stringify(data, file === "search-index.json" ? undefined : null, file === "search-index.json" ? undefined : 2) + "\n";
    if (check) { if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== contents) { console.error(`Regeneration differs: ${file}`); differs++; } }
    else fs.writeFileSync(target, contents);
  }
  if (check && differs) throw new Error(`${differs} GSoC output file(s) differ from the committed data`);
  if (refresh && !check && !sourceDir) {
    fs.writeFileSync(pinPath, JSON.stringify({ ...pin, revision, hashes: Object.fromEntries(Object.entries(result.coverage.cncf.files).map(([f, v]) => [f, v.sha256])) }, null, 2) + "\n");
  }
  const unmatched = Object.entries(result.coverage.tagReport.unmatched).sort((a, b) => b[1] - a[1]);
  console.log(`${check ? "Reproduced" : "Generated"} ${result.organizations.length} organizations, ${result.coverage.projectCount} projects across ${yearFiles.size} years; CNCF at ${revision.slice(0, 7)}; ${Object.keys(result.coverage.tagReport.canonical).length} canonical tags, ${unmatched.length} unmatched (top: ${unmatched.slice(0, 8).map(([t, n]) => `${t}×${n}`).join(", ")})`);
  for (const w of result.coverage.warnings) console.warn(`! ${w}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { console.error(error); process.exitCode = 1; });
