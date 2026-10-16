/**
 * Parser for github.com/cncf/mentoring/programs/summerofcode/<year>.md (2017 to 2026).
 *
 * The files changed shape over the years:
 *   2017–2023:  ### Org / #### Project title   (2021–2022 sometimes ##### for titles)
 *   2024+:      #### Org / ##### Project title
 * Field bullets vary too (Issue vs Upstream Issue (URL), Required vs Recommended Skills, Expected
 * outcome(s), Expected project size vs size in the title, Difficulty). Headings are therefore
 * classified by content, not by a fixed depth: a block with recognised field bullets is a project,
 * and its organization is the nearest shallower heading that is not administrative or a template.
 * A malformed block produces a warning, never an exception.
 */
import { cleanMarkdown, contentHash, extractUrls, parsePeople } from "./lfx-parser";
import { canonicalTag } from "./tag-aliases";
import type { Mentor } from "../../src/lib/types";

export type GsocProjectSize = "small" | "medium" | "large";

export interface ParsedGsocMentor extends Mentor {
  primary?: boolean;
}

export interface ParsedGsocProject {
  /** Upstream CNCF project name, e.g. "Kubernetes". */
  organization: string;
  organizationUrl: string;
  title: string;
  description: string;
  expectedOutcome: string;
  skills: string[];
  size?: GsocProjectSize;
  difficulty?: string;
  mentors: ParsedGsocMentor[];
  upstreamIssueUrls: string[];
  links: string[];
  line: number;
  raw: string;
  contentHash: string;
}

export interface ParsedGsocDocument {
  year: number;
  projects: ParsedGsocProject[];
  warnings: string[];
  /** Headings seen, for coverage reports. */
  sections: { line: number; heading: string; kind: "organization" | "project" | "section" | "template" }[];
}

type Field = "description" | "outcome" | "skills" | "size" | "mentors" | "issues" | "difficulty";

function fieldName(label: string): Field | undefined {
  const l = label.toLowerCase().replace(/[*_`]/g, "").replace(/\([^)]*\)/g, "").replace(/[- ]+/g, " ").trim();
  if (/^(?:detailed |project |short )?descriptions?$/.test(l)) return "description";
  if (/^(?:expected |project )?(?:outcomes?|deliverables?|results?)$/.test(l)) return "outcome";
  if (/^(?:(?:recommended|recommend|required|prerequisite|preferred|desired|suggested) )?skills?(?: ?required)?$/.test(l)) return "skills";
  if (/^(?:expected (?:project )?size|expected size of the project|project size|size)$/.test(l)) return "size";
  if (/^(?:(?:likely|potential|primary|co) )?mentors?(?: names?)?$/.test(l)) return "mentors";
  if (/^(?:upstream |relevant |related |github )?issues?(?: links?| urls?)?$/.test(l) || /^(?:task|issue) link$/.test(l) || /^upstream issues$/.test(l)) return "issues";
  if (/^difficulty(?: rating| level)?$|^diffuculty$/.test(l)) return "difficulty";
  return undefined;
}

function fieldLine(line: string): { field: Field; text: string } | undefined {
  const clean = line.replace(/^\s*[-*+]\s+/, "").replace(/\*\*|__/g, "").trim();
  const match = clean.match(/^([^:]{1,60}):\s*(.*)$/);
  if (!match) return undefined;
  const field = fieldName(match[1]);
  return field ? { field, text: match[2] } : undefined;
}

const ADMIN = /^(?:project ideas?|ideas?|proposals?|proposed project ideas|table of contents|toc|students?|mentors?|template|templates?|timeline|how to apply|guidelines|notes?|\d{4}|cncf project name|(?:project )?title|accepted projects?|selected projects?|results?|sample)$/i;
const TEMPLATE_HEADING = /^(?:template|sample)\b|\(sample\)|\bsample\b|^cncf project name$|^(?:project )?title$/i;

export function normalizeSize(text: string): GsocProjectSize | undefined {
  const t = text.toLowerCase();
  if (/\blarge\b|350/.test(t)) return "large";
  if (/\bmedium\b|175/.test(t)) return "medium";
  if (/\bsmall\b|\b90\b/.test(t)) return "small";
  return undefined;
}

export function parseGsocSkills(text: string): string[] {
  const out: string[] = [];
  for (const part of cleanMarkdown(text).split(/[,;\n]|\band\/or\b|\s\/\s/)) {
    const raw = part.replace(/^\s*[-*+]\s*/, "").replace(/\(.*?\)/g, "").replace(/\.$/, "").trim();
    if (!raw || raw.length > 40 || /^(?:etc|none|n\/a|tbd)$/i.test(raw)) continue;
    const { label } = canonicalTag(raw);
    if (!out.includes(label)) out.push(label);
  }
  return out;
}

/** Split a mentors field into people, keeping the "- primary" marker as a flag and never dropping emails (the pipeline strips them before publishing). */
export function parseGsocMentors(text: string): ParsedGsocMentor[] {
  const people: ParsedGsocMentor[] = [];
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const chunks = lines.length ? lines : [text];
  for (const line of chunks) {
    const primary = /[-–—(]\s*primary\b/i.test(line) || /\bprimary\s*(?:mentor)?\s*[)\]]?\s*$/i.test(line);
    const cleaned = line.replace(/\s*[-–—]\s*\(?primary(?: mentor)?\)?\s*$/i, "").replace(/\(primary(?: mentor)?\)/gi, "").replace(/#.*$/, "");
    for (const person of parsePeople(cleaned)) {
      if (/^(?:jane|john) doe$/i.test(person.name)) continue;
      if (!people.some((p) => p.name === person.name && p.github === person.github)) people.push(primary ? { ...person, primary: true } : person);
    }
  }
  return people;
}

/** Strip a trailing size annotation such as "(Size: Medium)" from a title; returns the size when found. */
function titleSize(title: string): { title: string; size?: GsocProjectSize } {
  const m = title.match(/\s*[\[(]\s*(?:size|project size)\s*:?\s*([a-z]+)[^)\]]*[\])]\s*$/i);
  if (!m) return { title };
  return { title: title.slice(0, m.index).trim(), size: normalizeSize(m[1]) };
}

export function parseCncfGsoc(markdown: string, year: number): ParsedGsocDocument {
  const result: ParsedGsocDocument = { year, projects: [], warnings: [], sections: [] };
  const lines = markdown.split(/\r?\n/);

  // 1. Split into heading blocks, skipping fenced code (the template lives in a fence from 2024 on).
  type Block = { level: number; title: string; line: number; body: string[]; template: boolean };
  const blocks: Block[] = [];
  let fence = "", templateLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const code = line.match(/^\s*(```+|~~~+)/);
    if (code) { fence = fence ? "" : code[1][0]; continue; }
    if (fence) continue;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2];
      if (fieldName(title.replace(/:$/, "")) && blocks.length) { blocks.at(-1)!.body.push(`${title.replace(/:$/, "")}:`); continue; }
      if (templateLevel && level <= templateLevel) templateLevel = 0;
      if (TEMPLATE_HEADING.test(cleanMarkdown(title))) templateLevel = templateLevel || level;
      blocks.push({ level, title, line: i + 1, body: [], template: !!templateLevel });
    } else if (blocks.length) blocks.at(-1)!.body.push(line);
  }
  // Setext headings ("Project Ideas\n-----") only appear as the document title; nothing to do.

  // 2. Classify blocks.
  type Org = { name: string; url: string; level: number };
  const orgStack: Org[] = [];
  for (const b of blocks) {
    try {
      const rawTitle = cleanMarkdown(b.title).replace(/[\s*:]+$/, "");
      const headingUrls = extractUrls(b.title);
      const cleanTitle = rawTitle.replace(/\s*\((?:https?:\/\/[^)]*)\)\s*/g, " ").replace(/\s{2,}/g, " ").trim();

      if (b.template) { result.sections.push({ line: b.line, heading: cleanTitle, kind: "template" }); continue; }

      // Collect fields.
      const fields: Partial<Record<Field, string[]>> = {};
      let current: Field | "" = "", hasField = false;
      const intro: string[] = [];
      for (const line of b.body) {
        const match = fieldLine(line);
        if (match) { current = match.field; hasField = true; (fields[current] ||= []).push(match.text); continue; }
        const unknownLabel = /^\s*[-*+]\s+(?:\*\*)?[A-Z][\w ()/-]{1,40}(?:\*\*)?:\s*/.test(line);
        if (unknownLabel) { current = ""; continue; }
        // A new top-level bullet ends the previous field; only indented lines continue it.
        const topLevelBullet = /^[-*+]\s+/.test(line);
        if (current && !topLevelBullet) fields[current]!.push(line.replace(/^\s*[-*+]\s+/, "").trim());
        else { current = ""; intro.push(line); }
      }

      // A project heading at the same depth as its organization (2021 Pravega) keeps that organization.
      while (orgStack.length && (hasField ? orgStack.at(-1)!.level > b.level : orgStack.at(-1)!.level >= b.level)) orgStack.pop();
      const admin = ADMIN.test(cleanTitle);

      if (hasField && !admin) {
        const org = orgStack.at(-1);
        if (!org) { result.warnings.push(`${year}.md:${b.line}: project "${cleanTitle}" has no organization heading; skipped`); result.sections.push({ line: b.line, heading: cleanTitle, kind: "section" }); continue; }
        const text = (k: Field) => (fields[k] || []).join("\n").trim();
        const { title, size: sizeFromTitle } = titleSize(cleanTitle);
        const description = cleanMarkdown(text("description") || intro.filter((l) => l.trim()).map((l) => l.replace(/^\s*[-*+]\s+/, "")).join("\n"));
        if (!title) { result.warnings.push(`${year}.md:${b.line}: project without a title; skipped`); continue; }
        const raw = [b.title, ...b.body].join("\n");
        const upstreamIssueUrls = extractUrls(text("issues"));
        const project: ParsedGsocProject = {
          organization: org.name,
          organizationUrl: org.url,
          title,
          description,
          expectedOutcome: cleanMarkdown(text("outcome")),
          skills: parseGsocSkills(text("skills")),
          size: normalizeSize(text("size")) || sizeFromTitle,
          difficulty: cleanMarkdown(text("difficulty")) || undefined,
          mentors: parseGsocMentors(text("mentors")),
          upstreamIssueUrls,
          links: extractUrls(raw),
          line: b.line,
          raw,
          contentHash: contentHash(raw),
        };
        if (!project.description) result.warnings.push(`${year}.md:${b.line}: "${title}" has no description`);
        result.projects.push(project);
        result.sections.push({ line: b.line, heading: title, kind: "project" });
        continue;
      }

      if (admin) { result.sections.push({ line: b.line, heading: cleanTitle, kind: "section" }); continue; }
      // Any other heading is a candidate organization for the projects nested under it.
      orgStack.push({ name: cleanTitle, url: headingUrls[0] || "", level: b.level });
      result.sections.push({ line: b.line, heading: cleanTitle, kind: "organization" });
    } catch (error) {
      result.warnings.push(`${year}.md:${b.line}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  // Organization headings that never received a project are demoted to plain sections.
  const orgsWithProjects = new Set(result.projects.map((p) => p.organization));
  for (const s of result.sections) if (s.kind === "organization" && !orgsWithProjects.has(s.heading)) s.kind = "section";
  return result;
}
