import { createHash } from "node:crypto";
import { ORG_ALIASES } from "./org-aliases";
import type { Mentor } from "../../src/lib/types";

export function cleanMarkdown(value: string): string {
  return value.replace(/\[([^\]]+)\]\((?:[^()]|\([^)]*\))*\)/g, "$1")
    .replace(/\\([*_`])/g, "$1").replace(/\*\*|__/g, "")
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, "$1")
    .replace(/`([^`]+)`/g, "$1").replace(/^\s*(?:>\s*|#{1,6}\s+)/gm, "")
    .replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}
export function slugify(value: string): string {
  return cleanMarkdown(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function canonicalOrganization(value: string): string {
  const clean = cleanMarkdown(value).replace(/^[\s*]+|[\s*:]+$/g, "");
  return ORG_ALIASES[slugify(clean)] || clean;
}
export function extractUrls(value: string): string[] {
  const matches = value.match(/https?:\/\/[^\s<>"\]]+/g) || [];
  return [...new Set(matches.map(url => {
    // Stop at the first unmatched closing delimiter, including "),and" in prose.
    let depth = 0;
    for (let i = 0; i < url.length; i++) {
      if (url[i] === "(") depth++;
      if (url[i] === ")") { if (depth === 0) { url = url.slice(0, i); break; } depth--; }
    }
    return url.replace(/[.,;:]+$/, "");
  }))];
}
export function parseSkills(value: string): string[] {
  const aliases: Record<string, string> = { golang: "Go", "go programming": "Go", js: "JavaScript", ts: "TypeScript", k8s: "Kubernetes", cpp: "C++", python3: "Python", "python 3": "Python" };
  return [...new Set(cleanMarkdown(value).split(/[,;\n]/).map(s => s.replace(/^\s*[-*+]\s*/, "").trim()).filter(Boolean).map(s => aliases[s.toLowerCase()] || s))];
}
export function parsePeople(value: string): Mentor[] {
  value = value.replace(/([\w.+-]+)\s+at\s+([\w.-]+)\s+dot\s+([a-z]{2,})/gi, "$1@$2.$3").replace(/\[at\]/gi, "@").replace(/\\([()])/g, "$1").replace(/，/g, ",");
  value = value.replace(/@?\[([^\]]+)\]\(https?:\/\/github\.com\/([\w-]+)\/?\)/g,
    (_, name: string, handle: string) => name.startsWith("@") || name.toLowerCase() === handle.toLowerCase() ? `@${handle}` : `${name} (@${handle})`);
  value = value.replace(/\[([^\]]+)\]\((?:https?:\/\/|mailto:)[^)]+\)/g, "$1");
  value = value.replace(/\)\s+(?=[\p{L}][^()\n]*\(@)/gu, "); ");
  // Join a comma-separated email to its preceding name before splitting people.
  value = value.replace(/,\s*([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi, " $1");
  value = value.replace(/,\s+(?=[\p{L}][^(),\n]+\s*\(@)/gu, "\n");
  value = value.replace(/([^,@();\n]+),\s*(@[\w-]+)/g, "$1 $2");
  const chunks: string[] = [];
  let depth = 0, chunk = "";
  for (const char of value) {
    if (char === "(") depth++;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === "\n" || ((char === "," || char === ";") && depth === 0)) { chunks.push(chunk); chunk = ""; depth = 0; }
    else chunk += char;
  }
  chunks.push(chunk);
  const people: Mentor[] = [];
  for (let cleaned of chunks.flatMap(c => c.split(/\s+and\s+|\s*&\s*/))) {
    cleaned = cleaned.replace(/^\s*[-*+]\s*/, "").trim().replace(/^(?:Mentor\(s\):\s*)+/i, "").replace(/^(?:(?:primary|secondary|co[- ]?|adjunct)\s*)?(?:mentor(?: name)?\s*)?:\s*/i, "").trim();
    if (!cleaned || /^(?:https?:|mentor name$|mentee name$|tbd|n\/a|none|same email|upstream|lfx url)/i.test(cleaned)) continue;
    const github = cleaned.match(/(?:^|[\s(])@([a-z\d](?:[a-z\d-]*[a-z\d])?)/i)?.[1] || "";
    const email = cleaned.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || "";
    let name = cleaned;
    // Remove contact groups while retaining nicknames such as Fisher (Fei) Xu.
    for (let pass = 0; pass < 3; pass++) name = name.replace(/\(([^()]*)\)/g, (whole, inner: string) => /@|https?:/.test(inner) || /^[\s,;]*$/.test(inner) ? "" : whole);
    name = cleanMarkdown(name.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "").replace(/@[\w-]+/g, ""))
      .replace(/^[\s\[\]:<>(),;\\-]+|[\s\[\]:<>(),;\\-]+$/g, "").replace(/ from Grafana also available to help$/, "").trim();
    if (/https?:|github\.com|@/.test(name) || (!name && !github)) continue;
    const person: Mentor = { name: name || github, github, email, ...(!name ? { nameIsHandle: true } : {}) };
    if (!people.some(p => p.name === person.name && p.github === github)) people.push(person);
  }
  return people;
}

export interface ParsedProject {
  organization: string;
  title: string;
  description: string;
  expectedOutcome: string;
  skills: string[];
  technologies: string[];
  mentors: Mentor[];
  mentees: Mentor[];
  upstreamIssueUrls: string[];
  lfxUrls: string[];
  links: string[];
  line: number;
  raw: string;
}
export interface SectionRecord { line: number; heading: string; kind: "project" | "organization" | "section" | "template"; }
export interface ParsedDocument { projects: ParsedProject[]; sections: SectionRecord[]; }

function fieldName(label: string): string | undefined {
  label = label.toLowerCase().replace(/[*_]/g, "").replace(/\([^)]*\)/g, "").replace(/[- ]+/g, " ").trim();
  if (/^(?:project )?description$/.test(label)) return "description";
  if (/^(?:expected |project )?outcomes?$/.test(label)) return "outcome";
  if (/^(?:(?:recommended|recommend|required|prerequisite) )?skills?$/.test(label)) return "skills";
  if (/^(?:technologies|tech stack|technology)$/.test(label)) return "technologies";
  if (/^(?:(?:primary|secondary|co|potential) )?(?:mentors?|metors?|mentor name)$/.test(label)) return "mentors";
  if (/^(?:accepted )?mentees?$/.test(label)) return "mentees";
  if (/^(?:(?:upstream|relevant) )?issues?(?: urls?)?$/.test(label)) return "issues";
  if (/^(?:lfx urls?|apply|project urls?|community ?bridge project|community ?bridge urls?)$/.test(label)) return "lfx";
  return undefined;
}
function fieldLine(line: string): { field: string; text: string } | undefined {
  const clean = line.replace(/^\s*[-*+]\s+/, "").replace(/\*\*|__/g, "").trim();
  const match = clean.match(/^([^:]{1,65}):\s*(.*)$/);
  const field = fieldName(match ? match[1] : clean);
  return field ? { field, text: match?.[2] || "" } : undefined;
}
const ADMIN = /^(?:(?:list of )?(?:participating|accepted|selected|completed|proposed)?\s*projects?(?: ideas)?|proposed project ideas|table of contents|timeline|(?:project|application) instructions|guidelines|sample|template|cncf project name|title|q[1-4](?:-q[1-4])?(?: \- .*)?|\d{4}|term\s.*|mentorship duration.*)$/i;

/** Classify headings by their own content and known organizations, not a global depth. */
export function parseReadme(markdown: string, knownOrganizations: Record<string, string>): ParsedDocument {
  const lines = markdown.split(/\r?\n/);
  const blocks: { level: number; title: string; line: number; body: string[]; template: boolean }[] = [];
  let fence = "", templateLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const code = line.match(/^\s*(```+|~~~+)/);
    if (code) { fence = fence ? "" : code[1][0]; if (blocks.length) blocks.at(-1)!.body.push(line); continue; }
    if (fence) { if (blocks.length) blocks.at(-1)!.body.push(line); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const level = heading[1].length, title = heading[2];
      const field = fieldName(title);
      if (field && blocks.length) { blocks.at(-1)!.body.push(`${title}:`); continue; }
      if (templateLevel && level <= templateLevel) templateLevel = 0;
      if (/^(?:sample|template)(?:\b|:)|\(sample\)/i.test(title)) templateLevel = level;
      blocks.push({ level, title, line: i + 1, body: [], template: !!templateLevel });
    } else if (blocks.length) blocks.at(-1)!.body.push(line);
  }
  const result: ParsedDocument = { projects: [], sections: [] };
  let org = "";
  for (let index = 0; index < blocks.length; index++) {
    const b = blocks[index], title = cleanMarkdown(b.title).replace(/[\s*:]+$/, "");
    const fields: Record<string, string[]> = {};
    let current = "", hasField = false;
    for (const line of b.body) {
      const match = fieldLine(line);
      if (match) { current = match.field; hasField = true; (fields[current] ||= []).push(match.text); }
      else {
        // Unknown labels end the previous field, avoiding mentor/URL contamination.
        const unknown = line.match(/^[-*+]\s+([A-Z][\w ()/-]{1,50}):\s*(.*)$/);
        if (unknown) current = `other:${unknown[1]}`;
        (fields[current || "intro"] ||= []).push(line.replace(/^\s*[-*+]\s+/, ""));
      }
    }
    const known = knownOrganizations[slugify(title)] || knownOrganizations[slugify(canonicalOrganization(title))];
    const admin = ADMIN.test(title) || /^\d{4}\s+term\b/i.test(title);
    const isOrganization = !!known && !hasField;
    let kind: SectionRecord["kind"] = "section";
    if (b.template) kind = "template";
    else if (isOrganization) { org = known; kind = "organization"; }
    else if (!admin && (hasField || (org && extractUrls(b.title).length && b.body.some(l => l.trim())))) {
      if (!org) throw new Error(`No organization for project at line ${b.line}: ${title}`);
      kind = "project";
      const text = (key: string) => (fields[key] || []).join("\n").trim();
      const raw = [b.title, ...b.body].join("\n");
      const headingLinks = extractUrls(b.title);
      const lfxUrls = [...new Set([...extractUrls(text("lfx")), ...headingLinks.filter(u => /(?:mentorship\.lfx\.linuxfoundation|people\.communitybridge)\.org\/project\//.test(u))])];
      result.projects.push({ organization: org, title, description: cleanMarkdown(text("description") || text("intro")), expectedOutcome: cleanMarkdown(text("outcome")), skills: parseSkills(text("skills")), technologies: parseSkills(text("technologies")), mentors: parsePeople(text("mentors")), mentees: parsePeople(text("mentees")), upstreamIssueUrls: extractUrls(text("issues")), lfxUrls, links: extractUrls(raw), line: b.line, raw });
    } else if (!admin && !b.template && blocks[index + 1]?.level > b.level && !known && !/^(?:sig |wg |kubernetes \(sig)/i.test(title)) {
      // Fail closed: additions require an organization mapping, never inherit an unrelated org.
      throw new Error(`Unmapped organization or section at line ${b.line}: ${title}`);
    }
    result.sections.push({ line: b.line, heading: title, kind });
  }
  // 2019 and 2020 Q1 publish completed projects as a table, with unavailable fields empty.
  for (let i = 0; i < lines.length; i++) {
    if (!/^\|\s*CNCF Projects\s*\|/.test(lines[i])) continue;
    for (let row = i + 2; row < lines.length && /^\|/.test(lines[row]); row++) {
      const cells = lines[row].split("|").slice(1, -1).map(s => s.trim());
      if (cells.length < 4) throw new Error(`Invalid completed project table at line ${row + 1}`);
      result.projects.push({ organization: canonicalOrganization(cells[0]), title: cleanMarkdown(cells[1]), description: "", expectedOutcome: "", skills: [], technologies: [], mentors: parsePeople(cells[2]), mentees: parsePeople(cells[3]), upstreamIssueUrls: [], lfxUrls: [], links: extractUrls(lines[row]), line: row + 1, raw: lines[row] });
      result.sections.push({ line: row + 1, heading: cleanMarkdown(cells[1]), kind: "project" });
    }
  }
  return result;
}
export const contentHash = (text: string) => createHash("sha256").update(text).digest("hex");
