// =============================================================================
// LFX Organizations — Data Pipeline
// Fetches, normalizes, and audits LFX mentorship data from cncf/mentoring repo
// Usage: npx tsx scripts/fetch-lfx-data.ts
// =============================================================================

import * as fs from "fs";
import * as path from "path";
import { Project, Organization } from "../src/lib/types";

// ---------------------------------------------------------------------------
// Term Manifest — all known LFX mentorship terms with verified GitHub paths
// ---------------------------------------------------------------------------
const TERMS = [
  { year: 2027, term: "01-Mar-May", label: "2027 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2026, term: "03-Sep-Nov", label: "2026 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2026, term: "02-Jun-Aug", label: "2026 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2026, term: "01-Mar-May", label: "2026 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2025, term: "03-Sep-Nov", label: "2025 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2025, term: "02-Jun-Aug", label: "2025 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2025, term: "01-Mar-May", label: "2025 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2024, term: "03-Sep-Nov", label: "2024 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2024, term: "02-Jun-Aug", label: "2024 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2024, term: "01-Mar-May", label: "2024 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2023, term: "03-Sep-Nov", label: "2023 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2023, term: "02-Jun-Aug", label: "2023 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2023, term: "01-Mar-May", label: "2023 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2022, term: "03-Sept-Nov", label: "2022 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2022, term: "02-Summer", label: "2022 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2022, term: "01-Spring", label: "2022 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2021, term: "03-Fall", label: "2021 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2021, term: "02-Summer", label: "2021 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2021, term: "01-Spring", label: "2021 Term 1 (Mar-May)", termIndex: 1 },
];

// ---------------------------------------------------------------------------
// Canonical Organization Aliases
// Normalizes fragmented headings or sub-projects into authoritative CNCF orgs
// ---------------------------------------------------------------------------
const ORG_ALIASES: Record<string, string> = {
  "add-guac-support": "in-toto",
  "headlamp-a-kubernetes-ui": "Headlamp",
  "the-update-framework-tuf": "The Update Framework (TUF)",
  "tuf": "The Update Framework (TUF)",
  "wasmedge-runtime": "WasmEdge",
  "volcano-agentcube": "Volcano",
  "volcano-kthena": "Volcano",
  "knative-functions": "Knative",
  "cilium-tetragon": "Cilium",
  "konveyor-ai": "Konveyor",
  "krkn-chaos": "Krkn",
  "cncf-tag-network-and-observability": "CNCF TAG Network",
  "cncf-tag-contributor-strategy-ii": "CNCF TAG Contributor Strategy",
  "cluster-api-provider-gcp": "Kubernetes",
  "buildpacks": "Cloud Native Buildpacks",
  "support-remote-terraform-hcl-git-repo-or-configmap-in-terraform-controller": "KubeVela",
  "elekto-and-kubernetes-sig-contribex": "Kubernetes",
  "kubernetes-policy-working-group-wg": "Kubernetes",
  "opentelemetry-php": "OpenTelemetry",
};

// ---------------------------------------------------------------------------
// Headings that are NOT organization names — expanded blocklist
// ---------------------------------------------------------------------------
const BLOCKED_HEADINGS = new Set([
  "projects",
  "projects ideas",
  "project ideas",
  "accepted projects",
  "selected projects",
  "proposed project ideas",
  "participating projects",
  "participating-projects",
  "table of contents",
  "timeline",
  "project instructions",
  "application instructions",
  "template",
  "sample",
  "prometheus (sample)",
  "cncf project name",
  "upcoming term",
  "guidelines",
  "mentors",
  "schedule",
  "mentorship project title",
  "how to apply",
  "eligibility",
  "stipend",
  "community bridge",
  "program administrators",
  "communication channel",
  "current cycle",
  "completed projects",
  "previous terms",
  "contents",
  "about",
  "notes",
  "important",
  "instructions",
  "archived",
  "faq",
  "frequently asked questions",
  "program timeline",
  "term 1",
  "term 2",
  "term 3",
  "spring",
  "summer",
  "fall",
  "q1",
  "q2",
  "q3",
  "q4",
]);

function isBlockedHeading(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (BLOCKED_HEADINGS.has(lower)) return true;
  // Block generic patterns
  if (/^term\s+\d/i.test(lower)) return true;
  if (/^\d{4}\s+term/i.test(lower)) return true;
  if (/^q[1-4]$/i.test(lower)) return true;
  if (/^mentorship duration/i.test(lower)) return true;
  if (/participating projects/i.test(lower)) return true;
  if (/\(sample\)/i.test(lower)) return true;
  if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(lower)) return true;
  if (/^(timeline|table of contents|instructions|guidelines|schedule|eligibility|archived|template)/i.test(lower)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Technology → Category mapping
// ---------------------------------------------------------------------------
const TECH_CATEGORY_MAP: Record<string, string> = {
  kubernetes: "Infrastructure & Cloud", docker: "Infrastructure & Cloud", helm: "Infrastructure & Cloud",
  envoy: "Infrastructure & Cloud", istio: "Infrastructure & Cloud", "service mesh": "Infrastructure & Cloud",
  containerd: "Infrastructure & Cloud", cri: "Infrastructure & Cloud", grpc: "Infrastructure & Cloud",
  cloud: "Infrastructure & Cloud", etcd: "Infrastructure & Cloud",
  prometheus: "Observability", grafana: "Observability", opentelemetry: "Observability",
  jaeger: "Observability", tracing: "Observability", metrics: "Observability",
  ebpf: "Systems & Kernel", kernel: "Systems & Kernel", linux: "Systems & Kernel",
  bpf: "Systems & Kernel", wasm: "Systems & Kernel", wasmedge: "Systems & Kernel",
  security: "Security", tls: "Security", encryption: "Security", policy: "Security",
  kyverno: "Security", falco: "Security",
  "machine learning": "AI & Data", ai: "AI & Data", llm: "AI & Data",
  "deep learning": "AI & Data", tensorflow: "AI & Data", pytorch: "AI & Data", data: "AI & Data",
  go: "Development Tools", golang: "Development Tools", rust: "Development Tools",
  python: "Development Tools", typescript: "Development Tools", javascript: "Development Tools",
  react: "Development Tools", cli: "Development Tools", testing: "Development Tools",
  documentation: "Development Tools",
  networking: "Networking", cni: "Networking", dns: "Networking", http: "Networking", mqtt: "Networking",
  storage: "Storage", database: "Storage", registry: "Storage", harbor: "Storage",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanOrgName(raw: string): string {
  const stripped = raw
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[#\s*]+|[#\s*]+$/g, "")
    .trim();
  const slug = slugify(stripped);
  if (ORG_ALIASES[slug]) {
    return ORG_ALIASES[slug];
  }
  return stripped;
}

function generateLogoSvg(name: string): string {
  const words = name.split(/[\s\-\/]+/).filter((w) => w.length > 0);
  const initials = words.slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const sat = 65 + (Math.abs(hash >> 8) % 20);
  const light = 45 + (Math.abs(hash >> 16) % 15);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue},${sat}%,${light}%)"/><stop offset="100%" style="stop-color:hsl(${(hue + 40) % 360},${sat}%,${light - 10}%)"/></linearGradient></defs><rect width="80" height="80" rx="16" fill="url(#g)"/><text x="40" y="40" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function inferCategory(skills: string[], orgName: string): string {
  const allText = [...skills, orgName].join(" ").toLowerCase();
  for (const [keyword, category] of Object.entries(TECH_CATEGORY_MAP)) {
    if (allText.includes(keyword)) return category;
  }
  return "Cloud Native";
}

function isSkillFragment(s: string): boolean {
  const wordCount = s.trim().split(/\s+/).length;
  if (wordCount > 4) return true;
  if (s.trim().endsWith(".") || s.trim().endsWith("!")) return true;
  const lower = s.trim().toLowerCase();
  if (/^(and|or|to|as|for|with|but|in|of|the|a |an )/i.test(lower)) return true;
  return false;
}

function parseSkills(skillsStr: string): string[] {
  return skillsStr
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 50)
    .filter((s) => !isSkillFragment(s))
    .map((s) => {
      const lower = s.toLowerCase();
      if (lower === "golang" || lower === "go programming") return "Go";
      if (lower === "c++" || lower === "cpp") return "C++";
      if (lower === "js") return "JavaScript";
      if (lower === "ts") return "TypeScript";
      if (lower === "k8s") return "Kubernetes";
      if (lower === "python3" || lower === "python 3") return "Python";
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
}

function truncateToSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const sentenceEnd = /[.!?](?:\s|$)/g;
  let lastGoodEnd = 0;
  let match: RegExpExecArray | null;
  while ((match = sentenceEnd.exec(text)) !== null) {
    const endPos = match.index + 1;
    if (endPos > maxLen) break;
    lastGoodEnd = endPos;
  }
  if (lastGoodEnd > 0) {
    return text.slice(0, lastGoodEnd).trim() + "…";
  }
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function parseMentors(
  mentorLines: string[]
): { name: string; github: string; email: string }[] {
  const mentors: { name: string; github: string; email: string }[] = [];
  for (const line of mentorLines) {
    const clean = line.replace(/^\s*-\s*/, "").trim();
    // Discard any line that is a URL or empty or boilerplate template
    if (
      !clean ||
      /^https?:\/\//i.test(clean) ||
      clean.includes("github.com/") ||
      clean.includes("same email address as you use on the LFX") ||
      clean.includes("Mentor Name")
    ) {
      continue;
    }

    const match = clean.match(
      /^(.+?)\s*\(@?([a-zA-Z0-9_\-]+)\s*(?:,\s*([^\s)]+))?\s*\)/
    );
    if (match) {
      mentors.push({
        name: match[1].trim(),
        github: match[2].replace(/^@/, ""),
        email: match[3] || "",
      });
    } else {
      const parts = clean.split("(")[0].trim();
      if (parts && parts.length > 1 && parts.length < 60 && !parts.startsWith("http")) {
        mentors.push({
          name: parts,
          github: "",
          email: "",
        });
      }
    }
  }
  return mentors.filter((m) => m.name.length > 0);
}

function parseMentees(
  menteeLines: string[]
): { name: string; github: string }[] {
  const mentees: { name: string; github: string }[] = [];
  for (const line of menteeLines) {
    const match = line.match(/^\s*-\s*(.+?)\s*\(@?([a-zA-Z0-9_\-]+)\s*\)/);
    if (match) {
      mentees.push({ name: match[1].trim(), github: match[2].replace(/^@/, "") });
    } else {
      const clean = line.replace(/^\s*-\s*/, "").trim();
      if (clean && clean.length > 1 && clean.length < 80 && !clean.startsWith("http")) {
        mentees.push({ name: clean.split("(")[0].trim(), github: "" });
      }
    }
  }
  return mentees.filter((m) => m.name.length > 0);
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/^>\s*##?\s*Description\s*>?\s*/gi, "")
    .replace(/^>\s*/gm, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[>#]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Markdown Parser
// ---------------------------------------------------------------------------
interface RawProject {
  organization: string;
  title: string;
  description: string;
  expectedOutcome: string;
  skills: string[];
  mentors: { name: string; github: string; email: string }[];
  mentees: { name: string; github: string }[];
  upstreamIssueUrl: string;
  lfxUrl: string;
  _term?: string;
  _year?: number;
  _termIndex?: number;
}

function parseReadme(markdown: string): RawProject[] {
  const projects: RawProject[] = [];
  const lines = markdown.split("\n");

  let h3Count = 0;
  let h4Count = 0;
  for (const l of lines) {
    if (/^###\s+/.test(l)) h3Count++;
    if (/^####\s+/.test(l)) h4Count++;
  }
  // If the document has many H4s and very few H3s, H4 is the org level (2021 & early 2022 format)
  const isH4OrgStructure = h4Count > 10 && h3Count < 6;

  let currentOrg = "";
  let currentTitle = "";
  let currentField = "";
  let fieldLines: string[] = [];
  let projectData: Record<string, string[]> = {};
  let inProject = false;
  let mentorLines: string[] = [];
  let menteeLines: string[] = [];
  let collectingMentors = false;
  let collectingMentees = false;
  let currentOrgLevel = 0;

  function flushProject() {
    if (!currentOrg || !currentTitle) return;

    const descLines =
      projectData["description"] || projectData["project description"] || [];
    const outcomeLines =
      projectData["expected outcome"] ||
      projectData["expected outcomes"] ||
      [];
    const skillLines =
      projectData["recommended skills"] ||
      projectData["recommended skill"] ||
      projectData["required skills"] ||
      projectData["required skill"] ||
      projectData["skills"] ||
      projectData["skill"] ||
      [];
    const issueLines =
      projectData["upstream issue"] || projectData["upstream issues"] || [];
    const lfxLines =
      projectData["lfx url"] ||
      projectData["lfx urls"] ||
      projectData["project url"] ||
      [];

    const description = cleanMarkdown(descLines.join(" ").trim());
    const expectedOutcome = cleanMarkdown(outcomeLines.join(" ").trim());
    const skillsStr = skillLines.join(", ");
    const upstreamIssueUrl = issueLines.join("").trim();
    const lfxUrl = lfxLines.join("").trim();

    if (description || expectedOutcome) {
      projects.push({
        organization: cleanOrgName(currentOrg),
        title: cleanMarkdown(currentTitle),
        description,
        expectedOutcome,
        skills: parseSkills(skillsStr),
        mentors: parseMentors(mentorLines),
        mentees: parseMentees(menteeLines),
        upstreamIssueUrl: upstreamIssueUrl.replace(/^.*?(https?:\/\/)/, "$1"),
        lfxUrl: lfxUrl.replace(/^.*?(https?:\/\/)/, "$1"),
      });
    }

    projectData = {};
    mentorLines = [];
    menteeLines = [];
    currentField = "";
    fieldLines = [];
    collectingMentors = false;
    collectingMentees = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect headings (## to ######)
    const headingMatch = line.match(/^(#{2,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      // Skip blocked headings and reset org state
      if (isBlockedHeading(text)) {
        flushProject();
        currentOrg = "";
        currentTitle = "";
        inProject = false;
        continue;
      }

      const isOrg = isH4OrgStructure
        ? level === 4
        : level === 2 || level === 3;

      if (isOrg) {
        flushProject();
        currentOrg = cleanOrgName(text);
        currentOrgLevel = level;
        currentTitle = "";
        inProject = false;
        continue;
      }

      const isProj = isH4OrgStructure
        ? level >= 5 && currentOrg !== ""
        : (level === currentOrgLevel + 1 || level === 4) && currentOrg !== "";

      if (isProj) {
        flushProject();
        currentTitle = text;
        inProject = true;
        projectData = {};
        fieldLines = [];
        currentField = "";
        continue;
      }
    }

    if (!inProject) continue;

    // Field line: "- Description:", "- Expected Outcome:", etc.
    const fieldMatch = line.match(
      /^\s*-\s+(Description|Project Description|Expected Outcomes?|Recommended Skills?|Required Skills?|Skills?|Mentor\(s\)|Mentors?|Primary Mentor|Co-Mentors?|Mentee\(s\)|Mentees?|Accepted Mentees?|Upstream Issues?|LFX URLs?|Project URLs?)\s*:\s*(.*)/i
    );
    if (fieldMatch) {
      // Save previous field data
      if (currentField && fieldLines.length > 0) {
        if (
          !currentField.includes("mentor") &&
          !currentField.includes("mentee")
        ) {
          projectData[currentField] = fieldLines;
        }
      }

      const fieldName = fieldMatch[1].toLowerCase();
      const fieldValue = fieldMatch[2].trim();

      if (fieldName.includes("mentee")) {
        collectingMentees = true;
        collectingMentors = false;
        currentField = "mentees";
        fieldLines = [];
        if (fieldValue) menteeLines.push(fieldValue);
      } else if (fieldName.includes("mentor")) {
        collectingMentors = true;
        collectingMentees = false;
        currentField = "mentors";
        fieldLines = [];
        if (fieldValue) mentorLines.push(fieldValue);
      } else {
        collectingMentors = false;
        collectingMentees = false;
        currentField = fieldName;
        fieldLines = fieldValue ? [fieldValue] : [];
      }
      continue;
    }

    // Sub-bullets for mentors
    if (collectingMentors && line.match(/^\s+-\s+/)) {
      mentorLines.push(line);
      continue;
    }

    // Sub-bullets for mentees
    if (collectingMentees && line.match(/^\s+-\s+/)) {
      menteeLines.push(line);
      continue;
    }

    // Continuation lines for other fields
    if (
      currentField &&
      !collectingMentors &&
      !collectingMentees &&
      (line.match(/^\s+-\s+/) || line.match(/^\s{2,}/))
    ) {
      const content = line
        .replace(/^\s+-\s+/, "")
        .replace(/^\s+/, "")
        .trim();
      if (content) fieldLines.push(content);
      continue;
    }

    // Blank line ends current field collection
    if (line.trim() === "" && currentField) {
      if (collectingMentors) {
        collectingMentors = false;
      } else if (collectingMentees) {
        collectingMentees = false;
      } else if (fieldLines.length > 0) {
        projectData[currentField] = fieldLines;
      }
    }
  }

  // Flush last project
  flushProject();
  return projects;
}

// ---------------------------------------------------------------------------
// Fetcher with lfx-export.json priority & fallback
// ---------------------------------------------------------------------------

interface LfxMentorExport {
  name?: string;
  github_handle?: string;
  email?: string;
}

interface LfxProgramExport {
  cncf_project?: string;
  cncf_project_slug?: string;
  program_name_short?: string;
  program_name_full?: string;
  description?: string;
  expected_outcomes?: string;
  skills?: string;
  technologies?: string;
  mentors?: LfxMentorExport[];
  upstream_issue_url?: string;
  issue_url?: string;
  lfx_url?: string;
}

async function fetchTermData(year: number, term: string): Promise<RawProject[]> {
  // 1. Check if machine-readable lfx-export.json exists (e.g. 2026 Term 3)
  const exportUrl = `https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/${year}/${term}/lfx-export.json`;
  try {
    const exportResp = await fetch(exportUrl);
    if (exportResp.ok) {
      const data = await exportResp.json();
      if (data && Array.isArray(data.programs) && data.programs.length > 0) {
        return (data.programs as LfxProgramExport[]).map((p) => ({
          organization: cleanOrgName(p.cncf_project || p.cncf_project_slug || "CNCF"),
          title: cleanMarkdown(p.program_name_short || p.program_name_full || "Mentorship Project"),
          description: cleanMarkdown(p.description || ""),
          expectedOutcome: cleanMarkdown(p.expected_outcomes || ""),
          skills: p.skills ? parseSkills(p.skills) : (p.technologies ? parseSkills(p.technologies) : []),
          mentors: (p.mentors || []).map((m) => ({
            name: m.name || "",
            github: (m.github_handle || "").replace(/^@/, ""),
            email: m.email || "",
          })),
          mentees: [],
          upstreamIssueUrl: p.upstream_issue_url || p.issue_url || "",
          lfxUrl: p.lfx_url || "",
        }));
      }
    }
  } catch {}

  // 2. Fetch README.md (accepted projects in older terms)
  const readmeUrl = `https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/${year}/${term}/README.md`;
  let readmeMd = "";
  try {
    const r = await fetch(readmeUrl);
    if (r.ok) readmeMd = await r.text();
  } catch {}

  let projects = readmeMd ? parseReadme(readmeMd) : [];
  if (projects.length > 0) return projects;

  // 3. Fall back to project_ideas.md only if README had 0 projects
  const ideasUrl = `https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/${year}/${term}/project_ideas.md`;
  try {
    const r = await fetch(ideasUrl);
    if (r.ok) {
      const ideasMd = await r.text();
      projects = parseReadme(ideasMd);
    }
  } catch {}

  return projects;
}

// ---------------------------------------------------------------------------
// Main Pipeline
// ---------------------------------------------------------------------------

async function main() {
  console.log("🚀 LFX Organizations Data Pipeline");
  console.log("===================================\n");

  // Load curated metadata registry
  const metaPath = path.join(__dirname, "org-metadata.json");
  let orgMetadata: Record<
    string,
    {
      name?: string;
      description?: string;
      website?: string;
      github?: string;
      category?: string;
    }
  > = {};

  if (fs.existsSync(metaPath)) {
    try {
      orgMetadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    } catch (e) {
      console.warn("⚠️ Could not parse org-metadata.json", e);
    }
  }

  const allProjects: RawProject[] = [];
  const termLabels: Record<
    string,
    { year: number; termIndex: number; label: string }
  > = {};

  for (const termDef of TERMS) {
    process.stdout.write(`📥 Fetching ${termDef.label}... `);

    const projects = await fetchTermData(termDef.year, termDef.term);

    if (projects.length === 0) {
      console.log("❌ Not found, skipping");
      continue;
    }

    console.log(`✅ Found ${projects.length} projects`);

    for (const p of projects) {
      p._term = termDef.label;
      p._year = termDef.year;
      p._termIndex = termDef.termIndex;
    }

    allProjects.push(...projects);
    termLabels[termDef.label] = {
      year: termDef.year,
      termIndex: termDef.termIndex,
      label: termDef.label,
    };
  }

  console.log(`\n📊 Total raw projects: ${allProjects.length}`);

  // ---------------------------------------------------------------------------
  // Aggregate into organizations & generate collision-free IDs
  // ---------------------------------------------------------------------------
  const orgMap = new Map<
    string,
    {
      name: string;
      projects: Project[];
      terms: Set<string>;
      years: Set<number>;
      technologies: Set<string>;
      descriptions: string[];
    }
  >();

  const titleCounter = new Map<string, number>();

  for (const rawProject of allProjects) {
    const canonicalName = cleanOrgName(rawProject.organization);
    const orgId = slugify(canonicalName);
    const term = rawProject._term!;
    const year = rawProject._year!;
    const termIndex = rawProject._termIndex!;

    if (!orgMap.has(orgId)) {
      orgMap.set(orgId, {
        name: canonicalName,
        projects: [],
        terms: new Set(),
        years: new Set(),
        technologies: new Set(),
        descriptions: [],
      });
    }

    const org = orgMap.get(orgId)!;
    org.terms.add(term);
    org.years.add(year);
    rawProject.skills.forEach((s) => org.technologies.add(s));
    if (rawProject.description) {
      org.descriptions.push(rawProject.description);
    }

    // Collision-free unique ID scoped with term and counter if duplicate titles
    const baseTitleSlug = slugify(rawProject.title);
    const titleKey = `${orgId}-${year}-t${termIndex}-${baseTitleSlug}`;
    const count = (titleCounter.get(titleKey) || 0) + 1;
    titleCounter.set(titleKey, count);
    const projectId = count > 1 ? `${titleKey}-${count}` : titleKey;

    org.projects.push({
      id: projectId,
      title: rawProject.title,
      organization: canonicalName,
      organizationId: orgId,
      description: rawProject.description,
      expectedOutcome: rawProject.expectedOutcome,
      skills: rawProject.skills,
      mentors: rawProject.mentors,
      mentees: rawProject.mentees,
      upstreamIssueUrl: rawProject.upstreamIssueUrl,
      lfxUrl: rawProject.lfxUrl,
      term,
      year,
      termIndex,
    });
  }

  // Build final organizations array
  const organizations: Organization[] = Array.from(orgMap.entries()).map(
    ([orgId, org]) => {
      const meta = orgMetadata[orgId];
      const technologies = Array.from(org.technologies);
      const category = meta?.category || inferCategory(technologies, org.name);
      const yearsArr = Array.from(org.years).sort((a, b) => b - a);
      const termsArr = Array.from(org.terms).sort().reverse();

      // Check for custom PNG/SVG logo in public/logos/
      const logoPngPath = path.join(process.cwd(), "public", "logos", `${orgId}.png`);
      const logoSvgPath = path.join(process.cwd(), "public", "logos", `${orgId}.svg`);
      let logoUrl = generateLogoSvg(org.name);
      if (fs.existsSync(logoPngPath)) {
        logoUrl = `/logos/${orgId}.png`;
      } else if (fs.existsSync(logoSvgPath)) {
        logoUrl = `/logos/${orgId}.svg`;
      }

      // Verified description from registry or fallback
      const description =
        meta?.description ||
        (org.descriptions[0]
          ? truncateToSentence(cleanMarkdown(org.descriptions[0]), 220)
          : `${org.name} participates in LFX Mentorship.`);

      return {
        id: orgId,
        name: meta?.name || org.name,
        logoUrl,
        description,
        foundation: "CNCF",
        category,
        terms: termsArr,
        years: yearsArr,
        technologies: technologies.slice(0, 15),
        projectCount: org.projects.length,
        projects: org.projects,
      };
    }
  );

  // Sort by most recent year, then project count
  organizations.sort((a, b) => {
    const yearDiff = (Number(b.years[0]) || 0) - (Number(a.years[0]) || 0);
    if (yearDiff !== 0) return yearDiff;
    return b.projectCount - a.projectCount;
  });

  // Build flat projects array
  const flatProjects = organizations.flatMap((org) => org.projects);

  // ---------------------------------------------------------------------------
  // Output
  // ---------------------------------------------------------------------------
  const outDir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "organizations.json"),
    JSON.stringify(organizations, null, 2)
  );

  fs.writeFileSync(
    path.join(outDir, "projects.json"),
    JSON.stringify(flatProjects, null, 2)
  );

  console.log(`\n✅ Output written to ${outDir}`);
  console.log(`   📦 ${organizations.length} organizations`);
  console.log(`   📋 ${flatProjects.length} projects`);
}

main().catch(console.error);
