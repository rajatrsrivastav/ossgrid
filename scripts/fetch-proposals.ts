/**
 * Proposals library importer. Reads scripts/proposal-sources.json, lists each archive through the
 * GitHub Trees API at its pinned revision (--refresh moves pins to the branch head), parses the
 * layouts in scripts/lib/proposals-parser.ts, resolves organizations against the GSoC dataset, and
 * writes public/data/proposals/{proposals,by-org,source-coverage}.json. Files are linked, never
 * downloaded. Raw API responses are cached in scripts/.cache/proposals (git-ignored).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import type { GsocOrganization } from "../src/lib/types";
import { slugify } from "./lib/lfx-parser";
import { recordsFromTree, type ProposalRecord, type ProposalSource, type TreeEntry } from "./lib/proposals-parser";
import { orgNameKey } from "./fetch-gsoc-data";
import { auditProposals, type ProposalsCoverage } from "./audit-proposals";

const OUT_DIR = path.join(process.cwd(), "public/data/proposals");
const CACHE_DIR = path.join(__dirname, ".cache/proposals");
const args = process.argv.slice(2);
const flag = (n: string) => args.includes(n);

async function get(url: string): Promise<string> {
  const headers: Record<string, string> = { "User-Agent": "ossgrid-sync (https://www.ossgrid.tech)", Accept: "application/vnd.github+json" };
  if (url.includes("github") && process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  await new Promise((r) => setTimeout(r, 250)); // stay polite with the unauthenticated limit
  return res.text();
}

async function cached(relative: string, url: string, refresh: boolean): Promise<string> {
  const file = path.join(CACHE_DIR, relative);
  if (!refresh && fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const text = await get(url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  return text;
}

/** Resolve an archive's organization folder name to a GSoC slug: alias → exact slug → loose name key. */
export function makeOrgResolver(orgs: GsocOrganization[], aliases: Record<string, string>) {
  const bySlug = new Set(orgs.map((o) => o.slug));
  const byKey = new Map<string, string | null>();
  for (const o of orgs) {
    const keys = [orgNameKey(o.name), ...(o.name.match(/\(([A-Za-z0-9.+-]{2,12})\)/g) || []).map((a) => slugify(a))].filter(Boolean);
    for (const k of keys) byKey.set(k, byKey.has(k) && byKey.get(k) !== o.slug ? null : o.slug);
  }
  return (name: string): string => {
    if (!name) return "";
    const s = slugify(name);
    if (aliases[s]) return aliases[s];
    if (bySlug.has(s)) return s;
    const k = orgNameKey(name);
    return (k && byKey.get(k)) || "";
  };
}

export async function main() {
  const refresh = flag("--refresh"), check = flag("--check");
  const configPath = path.join(__dirname, "proposal-sources.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as { sources: ProposalSource[] };
  const orgs: GsocOrganization[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/data/gsoc/organizations.json"), "utf8"));
  const aliases = JSON.parse(fs.readFileSync(path.join(__dirname, "gsoc-org-aliases.json"), "utf8"));
  delete aliases._comment;
  const resolve = makeOrgResolver(orgs, aliases);

  const records: ProposalRecord[] = [];
  const coverage: ProposalsCoverage = { sources: [], total: 0, matchedOrgs: 0, unmatchedOrgNames: {} };
  for (const source of config.sources) {
    if (source.layout === "skip") { coverage.sources.push({ repo: source.repo, revision: "", files: 0, proposals: 0, note: source.note }); continue; }
    let revision = source.revision || "";
    if (refresh || !revision) revision = JSON.parse(await get(`https://api.github.com/repos/${source.repo}/commits/${source.branch}`)).sha;
    if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error(`Bad revision for ${source.repo}`);
    source.revision = revision;
    const tree = JSON.parse(await cached(`${source.repo.replace("/", "__")}/${revision}/tree.json`, `https://api.github.com/repos/${source.repo}/git/trees/${revision}?recursive=1`, false));
    if (tree.truncated) throw new Error(`Truncated tree for ${source.repo}`);
    const entries: TreeEntry[] = tree.tree;
    const contents = new Map<string, string>();
    if (source.layout === "org-year-md-table" || source.layout === "year-md-list") {
      for (const e of entries.filter((x) => x.type === "blob" && /\.md$/i.test(x.path) && !/readme/i.test(x.path))) {
        contents.set(e.path, await cached(`${source.repo.replace("/", "__")}/${revision}/${e.path}`, `https://raw.githubusercontent.com/${source.repo}/${revision}/${e.path}`, false));
      }
    }
    const list = recordsFromTree(source, entries, revision, contents).map((r) => ({ ...r, orgId: resolve(r.orgName) }));
    for (const r of list) if (r.orgName && !r.orgId) coverage.unmatchedOrgNames[r.orgName] = (coverage.unmatchedOrgNames[r.orgName] || 0) + 1;
    records.push(...list);
    coverage.sources.push({ repo: source.repo, revision, files: entries.filter((e) => e.type === "blob").length, proposals: list.length, license: source.license });
  }
  records.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.orgName.localeCompare(b.orgName) || a.title.localeCompare(b.title));
  coverage.total = records.length;
  const byOrg: Record<string, number> = {};
  for (const r of records) if (r.orgId) byOrg[r.orgId] = (byOrg[r.orgId] || 0) + 1;
  coverage.matchedOrgs = Object.keys(byOrg).length;
  auditProposals(records, coverage);

  const outputs: Record<string, unknown> = { "proposals.json": records, "by-org.json": byOrg, "source-coverage.json": coverage };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let differs = 0;
  for (const [file, data] of Object.entries(outputs)) {
    const target = path.join(OUT_DIR, file), contents = JSON.stringify(data, null, 2) + "\n";
    if (check) { if (!fs.existsSync(target) || fs.readFileSync(target, "utf8") !== contents) { console.error(`Regeneration differs: ${file}`); differs++; } }
    else fs.writeFileSync(target, contents);
  }
  if (check && differs) throw new Error(`${differs} proposals output file(s) differ`);
  if (refresh && !check) fs.writeFileSync(configPath, JSON.stringify({ _comment: JSON.parse(fs.readFileSync(configPath, "utf8"))._comment, sources: config.sources }, null, 2) + "\n");
  const unmatched = Object.entries(coverage.unmatchedOrgNames).sort((a, b) => b[1] - a[1]);
  console.log(`${check ? "Reproduced" : "Generated"} ${records.length} proposals from ${coverage.sources.filter((s) => s.proposals).length} archives; ${coverage.matchedOrgs} organizations matched, ${unmatched.length} archive org names unmatched (top: ${unmatched.slice(0, 10).map(([n, c]) => `${n}×${c}`).join(", ")})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((e) => { console.error(e); process.exitCode = 1; });
