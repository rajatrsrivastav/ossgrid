/**
 * Turns a repository file tree (and, for Markdown archives, file contents) into proposal records.
 * Pure functions; the network lives in scripts/fetch-proposals.ts.
 */
import { slugify } from "./lfx-parser";

export type ProposalStatus = "accepted" | "rejected" | "unknown";
export type ProposalFormat = "pdf" | "md" | "docx" | "link";

export interface ProposalSource {
  repo: string;
  branch: string;
  revision?: string;
  layout: "org-file" | "org-status-file" | "year-org-file" | "year-org-year-name" | "fos" | "org-year-md-table" | "year-md-list" | "flat-pdf" | "skip";
  year?: number;
  status?: ProposalStatus;
  license?: string;
  note?: string;
}

export interface ProposalRecord {
  id: string;
  year: number | null;
  /** Organization name as written in the archive. */
  orgName: string;
  /** Resolved GSoC organization slug, or "" when unmatched. */
  orgId: string;
  title: string;
  author: string;
  status: ProposalStatus;
  format: ProposalFormat;
  /** Link to the original file or document. Never a copy. */
  url: string;
  sourceRepo: string;
  license: string;
}

export interface TreeEntry { path: string; type: string; sha?: string }

const DOC_EXT = /\.(pdf|md|docx)$/i;
const IGNORED = /(^|\/)(\.ds_store|readme\.md|license(\.md)?|contributing\.md|code_of_conduct\.md|authors\.md|\.github\/)/i;

export function formatOf(path: string): ProposalFormat {
  const m = path.toLowerCase().match(/\.(pdf|md|docx)$/);
  return (m?.[1] as ProposalFormat) || "link";
}

export function titleFromFilename(file: string): string {
  return file.replace(DOC_EXT, "").replace(/[_]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function blobUrl(repo: string, revision: string, path: string): string {
  return `https://github.com/${repo}/blob/${revision}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function statusOf(folder: string, fallback: ProposalStatus = "unknown"): ProposalStatus {
  const f = folder.toLowerCase();
  if (f.startsWith("accept")) return "accepted";
  if (f.startsWith("reject")) return "rejected";
  return fallback;
}

/** Parse rows of a Markdown table: `| Title | [Link](url) | [Link](url) |`. First link is the proposal. */
export function parseMarkdownTable(markdown: string): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line) || /^\s*\|\s*:?-{2,}/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2 || /^project title$/i.test(cells[0])) continue;
    const link = cells.slice(1).map((c) => c.match(/\((https?:\/\/[^)\s]+)\)/)?.[1]).find(Boolean);
    if (!link) continue;
    out.push({ title: cells[0].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim(), url: link });
  }
  return out;
}

/** Parse `- [Label](url)` list items. */
export function parseMarkdownList(markdown: string): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  for (const m of markdown.matchAll(/^\s*[-*+]\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm)) out.push({ label: m[1].trim(), url: m[2] });
  return out;
}

export function recordsFromTree(source: ProposalSource, tree: TreeEntry[], revision: string, contents: Map<string, string> = new Map()): ProposalRecord[] {
  const files = tree.filter((t) => t.type === "blob" && !IGNORED.test(t.path));
  const license = source.license || "unknown";
  const out: ProposalRecord[] = [];
  const push = (r: Omit<ProposalRecord, "id" | "sourceRepo" | "license">) => {
    const base = slugify(`${source.repo.split("/")[1]} ${r.year ?? "na"} ${r.orgName} ${r.title}`).slice(0, 90);
    let id = base, n = 2;
    while (out.some((x) => x.id === id)) id = `${base}-${n++}`;
    out.push({ id, sourceRepo: source.repo, license, ...r });
  };
  const docs = files.filter((f) => DOC_EXT.test(f.path));

  switch (source.layout) {
    case "org-file":
      for (const f of docs) {
        const [org, file] = f.path.split("/");
        if (!file) continue;
        push({ year: source.year ?? null, orgName: org, orgId: "", title: titleFromFilename(file), author: "", status: source.status ?? "unknown", format: formatOf(file), url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "org-status-file":
      for (const f of docs) {
        const [org, status, file] = f.path.split("/");
        if (!file) continue;
        const raw = file.replace(DOC_EXT, "");
        const author = raw.match(/_([A-Za-z][A-Za-z0-9-]*)$/)?.[1] || "";
        push({ year: source.year ?? null, orgName: org, orgId: "", title: titleFromFilename(author ? raw.slice(0, -author.length - 1) : raw) || titleFromFilename(raw), author, status: statusOf(status, source.status), format: formatOf(file), url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "year-org-file":
      for (const f of docs) {
        const [year, org, file] = f.path.split("/");
        if (!file || !/^\d{4}$/.test(year)) continue;
        push({ year: Number(year), orgName: org, orgId: "", title: titleFromFilename(file), author: "", status: source.status ?? "unknown", format: formatOf(file), url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "year-org-year-name":
      for (const f of docs) {
        const [year, file] = f.path.split("/");
        if (!file || !/^\d{4}$/.test(year)) continue;
        const m = titleFromFilename(file).match(/^(.*?)\s*-\s*(\d{4})\s*-\s*(.*)$/);
        push({ year: Number(year), orgName: (m?.[1] || titleFromFilename(file)).trim(), orgId: "", title: m ? `${m[1].trim()} proposal by ${m[3].trim()}` : titleFromFilename(file), author: m?.[3]?.trim() || "", status: source.status ?? "unknown", format: formatOf(file), url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "fos":
      for (const f of docs.filter((d) => /\.md$/i.test(d.path) && !/\/media\//.test(d.path))) {
        const parts = f.path.split("/");
        const year = Number(parts[0].match(/(\d{4})/)?.[1]);
        if (!year || parts.length < 3) continue;
        const status = statusOf(parts[1]);
        const folder = parts[parts.length - 2] || "";
        const segs = folder.split("-");
        const orgName = segs[0] || folder;
        const author = segs[1]?.replace(/([a-z])([A-Z])/g, "$1 $2") || "";
        push({ year, orgName, orgId: "", title: segs.slice(2).join(" ") || folder, author, status, format: "md", url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "org-year-md-table":
      for (const f of files.filter((d) => /\.md$/i.test(d.path))) {
        const [org, file] = f.path.split("/");
        const year = Number(file?.match(/(\d{4})/)?.[1]);
        const text = contents.get(f.path);
        if (!file || !year || !text) continue;
        for (const row of parseMarkdownTable(text)) push({ year, orgName: org, orgId: "", title: row.title, author: "", status: source.status ?? "unknown", format: "link", url: row.url });
      }
      break;
    case "year-md-list":
      for (const f of files.filter((d) => /^\d{4}\.md$/i.test(d.path))) {
        const year = Number(f.path.slice(0, 4));
        const text = contents.get(f.path);
        if (!text) continue;
        for (const item of parseMarkdownList(text)) push({ year, orgName: "", orgId: "", title: `Proposal by ${item.label}`, author: item.label, status: source.status ?? "unknown", format: "link", url: item.url });
      }
      break;
    case "flat-pdf":
      for (const f of docs) {
        const file = f.path.split("/").pop()!;
        push({ year: source.year ?? null, orgName: "", orgId: "", title: titleFromFilename(file), author: "", status: source.status ?? "unknown", format: formatOf(file), url: blobUrl(source.repo, revision, f.path) });
      }
      break;
    case "skip":
      break;
  }
  return out;
}
