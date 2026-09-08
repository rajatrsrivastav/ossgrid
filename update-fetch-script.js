const fs = require('fs');
const content = `// =============================================================================
// LFX Organizations — Data Pipeline
// Fetches and normalizes LFX mentorship data from cncf/mentoring repo
// Usage: npx tsx scripts/fetch-lfx-data.ts
// =============================================================================

import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Term Manifest — all known LFX mentorship terms
// ---------------------------------------------------------------------------
const TERMS = [
  { year: 2027, term: "01-Mar-May", label: "2027 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2026, term: "03-Sep-Nov", label: "2026 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2026, term: "02-Jun-Aug", label: "2026 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2026, term: "01-Mar-May", label: "2026 Term 1 (Mar-May)", termIndex: 1, status: "Accepting Applications" },
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
  { year: 2022, term: "02-Jun-Aug", label: "2022 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2022, term: "01-Mar-May", label: "2022 Term 1 (Mar-May)", termIndex: 1 },
  { year: 2021, term: "03-Sept-Nov", label: "2021 Term 3 (Sep-Nov)", termIndex: 3 },
  { year: 2021, term: "02-Jun-Aug", label: "2021 Term 2 (Jun-Aug)", termIndex: 2 },
  { year: 2021, term: "01-Mar-May", label: "2021 Term 1 (Mar-May)", termIndex: 1 },
];

// ---------------------------------------------------------------------------
// Technology → Category mapping
// ---------------------------------------------------------------------------
const TECH_CATEGORY_MAP: Record<string, string> = {
  kubernetes: "Infrastructure & Cloud", docker: "Infrastructure & Cloud", helm: "Infrastructure & Cloud", envoy: "Infrastructure & Cloud", istio: "Infrastructure & Cloud", "service mesh": "Infrastructure & Cloud", containerd: "Infrastructure & Cloud", cri: "Infrastructure & Cloud", grpc: "Infrastructure & Cloud", cloud: "Infrastructure & Cloud", etcd: "Infrastructure & Cloud", prometheus: "Observability", grafana: "Observability", opentelemetry: "Observability", jaeger: "Observability", tracing: "Observability", metrics: "Observability", ebpf: "Systems & Kernel", kernel: "Systems & Kernel", linux: "Systems & Kernel", bpf: "Systems & Kernel", wasm: "Systems & Kernel", wasmedge: "Systems & Kernel", security: "Security", tls: "Security", encryption: "Security", policy: "Security", kyverno: "Security", falco: "Security", "machine learning": "AI & Data", ai: "AI & Data", llm: "AI & Data", "deep learning": "AI & Data", tensorflow: "AI & Data", pytorch: "AI & Data", data: "AI & Data", go: "Development Tools", golang: "Development Tools", rust: "Development Tools", python: "Development Tools", typescript: "Development Tools", javascript: "Development Tools", react: "Development Tools", cli: "Development Tools", testing: "Development Tools", documentation: "Development Tools", networking: "Networking", cni: "Networking", dns: "Networking", http: "Networking", mqtt: "Networking", storage: "Storage", database: "Storage", registry: "Storage", harbor: "Storage"
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function generateLogoSvg(name: string): string {
  const initials = name.split(/[\s\-\/]+/).filter((w) => w.length > 0).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  const hue = Math.abs(hash) % 360;
  const saturation = 65 + (Math.abs(hash >> 8) % 20);
  const lightness = 45 + (Math.abs(hash >> 16) % 15);
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(\${hue},\${saturation}%,\${lightness}%)"/><stop offset="100%" style="stop-color:hsl(\${(hue + 40) % 360},\${saturation}%,\${lightness - 10}%)"/></linearGradient></defs><rect width="80" height="80" rx="16" fill="url(#g)"/><text x="40" y="40" font-family="system-ui,sans-serif" font-size="28" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="central">\${initials}</text></svg>\`;
  return \`data:image/svg+xml;base64,\${Buffer.from(svg).toString("base64")}\`;
}

function inferCategory(skills: string[], orgName: string): string {
  const allText = [...skills, orgName].join(" ").toLowerCase();
  for (const [keyword, category] of Object.entries(TECH_CATEGORY_MAP)) {
    if (allText.includes(keyword)) return category;
  }
  return "Cloud Native";
}

function parseSkills(skillsStr: string): string[] {
  return skillsStr.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 50).map((s) => {
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

function parseMentors(mentorLines: string[]): { name: string; github: string; email: string }[] {
  const mentors: { name: string; github: string; email: string }[] = [];
  for (const line of mentorLines) {
    const match = line.match(/^\s*-\s*(.+?)\s*\(@(\w[\w.-]*)\s*(?:,\s*([^\s)]+))?\s*\)/);
    if (match) {
      mentors.push({ name: match[1].trim(), github: match[2], email: match[3] || "" });
    } else {
      const cleanMatch = line.replace(/^\s*-\s*/, '').trim();
      if (cleanMatch && !cleanMatch.includes("same email address as you use on the LFX")) {
        mentors.push({ name: cleanMatch.split('(')[0].trim(), github: '', email: '' });
      }
    }
  }
  return mentors.filter(m => m.name && !m.name.includes('Mentor Name'));
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
  upstreamIssueUrl: string;
  lfxUrl: string;
}

function parseReadme(markdown: string): RawProject[] {
  const projects: RawProject[] = [];
  const lines = markdown.split("\n");

  let currentOrg = "";
  let currentTitle = "";
  let currentField = "";
  let fieldLines: string[] = [];
  let projectData: Record<string, string[]> = {};
  let inProject = false;
  let mentorLines: string[] = [];
  let collectingMentors = false;
  
  let currentOrgLevel = 0;

  function flushProject() {
    if (!currentOrg || !currentTitle) return;

    const descLines = projectData["description"] || [];
    const outcomeLines = projectData["expected outcome"] || projectData["expected outcomes"] || [];
    const skillLines = projectData["recommended skills"] || projectData["recommended skills:"] || [];
    const issueLines = projectData["upstream issue"] || [];
    const lfxLines = projectData["lfx url"] || [];

    const description = descLines.join(" ").trim();
    const expectedOutcome = outcomeLines.join(" ").trim();
    const skillsStr = skillLines.join(", ");
    const upstreamIssueUrl = issueLines.join("").trim();
    const lfxUrl = lfxLines.join("").trim();

    if (description || expectedOutcome) {
      projects.push({
        organization: currentOrg,
        title: currentTitle,
        description,
        expectedOutcome,
        skills: parseSkills(skillsStr),
        mentors: parseMentors(mentorLines),
        upstreamIssueUrl: upstreamIssueUrl.replace(/^.*?(https?:\/\/)/, "$1"),
        lfxUrl: lfxUrl.replace(/^.*?(https?:\/\/)/, "$1"),
      });
    }

    projectData = {};
    mentorLines = [];
    currentField = "";
    fieldLines = [];
    collectingMentors = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check headings
    const headingMatch = line.match(/^(#{2,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();

      const lower = text.toLowerCase();
      if (["projects", "table of contents", "timeline", "project instructions", "application instructions", "template", "cncf project name", "proposed project ideas"].includes(lower)) {
        continue;
      }

      if (level === 2 || level === 3) {
        if (!currentOrg || level <= currentOrgLevel) {
          flushProject();
          currentOrg = text;
          currentOrgLevel = level;
          currentTitle = "";
          inProject = false;
          continue;
        }
      }

      if (level === currentOrgLevel + 1 || level === 4) {
        flushProject();
        currentTitle = text;
        inProject = true;
        continue;
      }
    }

    if (!inProject) continue;

    const fieldMatch = line.match(/^\s*-\s+(Description|Expected Outcome|Expected Outcomes|Recommended Skills?|Mentor\(s\)|Mentors?|Upstream Issue|LFX URL)\s*:\s*(.*)/i);
    if (fieldMatch) {
      if (currentField && fieldLines.length > 0) {
        if (currentField !== "mentors" && currentField !== "mentor(s)") {
          projectData[currentField] = fieldLines;
        }
      }

      const fieldName = fieldMatch[1].toLowerCase();
      const fieldValue = fieldMatch[2].trim();

      if (fieldName.includes("mentor")) {
        collectingMentors = true;
        currentField = "mentors";
        fieldLines = [];
        mentorLines = [];
        if (fieldValue) mentorLines.push(fieldValue);
      } else {
        collectingMentors = false;
        currentField = fieldName;
        fieldLines = fieldValue ? [fieldValue] : [];
      }
      continue;
    }

    if (collectingMentors && line.match(/^\s+-\s+/)) {
      mentorLines.push(line);
      continue;
    }

    if (currentField && !collectingMentors && (line.match(/^\s+-\s+/) || line.match(/^\s{2,}/))) {
      const content = line.replace(/^\s+-\s+/, "").replace(/^\s+/, "").trim();
      if (content) fieldLines.push(content);
      continue;
    }

    if (line.trim() === "" && currentField) {
      if (currentField === "mentors" || currentField === "mentor(s)") {
        collectingMentors = false;
      } else if (fieldLines.length > 0) {
        projectData[currentField] = fieldLines;
      }
    }
  }

  flushProject();
  return projects;
}

// ---------------------------------------------------------------------------
// Main Pipeline
// ---------------------------------------------------------------------------

async function fetchTermJson(year: number, term: string): Promise<any> {
  const url = \`https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/\${year}/\${term}/lfx-export.json\`;
  try {
    const resp = await fetch(url);
    if (resp.ok) return await resp.json();
  } catch {}
  return null;
}

async function fetchTermMarkdown(year: number, term: string): Promise<string> {
  const urls = [
    \`https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/\${year}/\${term}/project_ideas.md\`,
    \`https://raw.githubusercontent.com/cncf/mentoring/main/programs/lfx-mentorship/\${year}/\${term}/README.md\`
  ];
  
  let combined = "";
  for (const url of urls) {
    try {
      const resp = await fetch(url);
      if (resp.ok) combined += "\n" + (await resp.text());
    } catch {}
  }
  return combined;
}

async function main() {
  console.log("🚀 LFX Organizations Data Pipeline");
  console.log("===================================\n");

  const allProjects: RawProject[] = [];
  const termLabels: Record<string, { year: number; termIndex: number; label: string }> = {};

  for (const termDef of TERMS) {
    process.stdout.write(\`📥 Fetching \${termDef.label}... \`);

    // 1. Try lfx-export.json first
    const json = await fetchTermJson(termDef.year, termDef.term);
    let projects: RawProject[] = [];

    if (json && Array.isArray(json)) {
      projects = json.map((p: any) => ({
        organization: p.organization || p.org || p.project || "Unknown Org",
        title: p.title || p.project_title || p.name || "",
        description: p.description || "",
        expectedOutcome: p.expected_outcome || p.outcome || "",
        skills: Array.isArray(p.skills) ? p.skills : typeof p.skills === 'string' ? parseSkills(p.skills) : [],
        mentors: Array.isArray(p.mentors) ? p.mentors.map((m: any) => ({
           name: m.name || m,
           github: m.github || "",
           email: m.email || ""
        })) : typeof p.mentors === 'string' ? parseMentors([p.mentors]) : [],
        upstreamIssueUrl: p.issue_url || p.upstream_issue || "",
        lfxUrl: p.lfx_url || p.url || ""
      }));
    } else {
      // 2. Fallback to scraping Markdown
      const markdown = await fetchTermMarkdown(termDef.year, termDef.term);
      if (markdown && markdown.trim().length > 0) {
        projects = parseReadme(markdown);
      }
    }

    if (projects.length === 0) {
      console.log("❌ Not found, skipping");
      continue;
    }

    console.log(\`✅ Found \${projects.length} projects\`);

    for (const p of projects) {
      (p as any)._term = termDef.label;
      (p as any)._year = termDef.year;
      (p as any)._termIndex = termDef.termIndex;
    }

    allProjects.push(...projects);
    termLabels[termDef.label] = { year: termDef.year, termIndex: termDef.termIndex, label: termDef.label };
  }

  console.log(\`\n📊 Total raw projects: \${allProjects.length}\`);

  const orgMap = new Map<string, any>();

  for (const rawProject of allProjects) {
    const orgId = slugify(rawProject.organization);
    const term = (rawProject as any)._term;
    const year = (rawProject as any)._year;
    const termIndex = (rawProject as any)._termIndex;

    if (!orgMap.has(orgId)) {
      orgMap.set(orgId, {
        name: rawProject.organization,
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
    if (rawProject.description) org.descriptions.push(rawProject.description);

    org.projects.push({
      id: slugify(\`\${rawProject.organization}-\${rawProject.title}\`),
      title: rawProject.title,
      organization: rawProject.organization,
      organizationId: orgId,
      description: rawProject.description,
      expectedOutcome: rawProject.expectedOutcome,
      skills: rawProject.skills,
      mentors: rawProject.mentors,
      upstreamIssueUrl: rawProject.upstreamIssueUrl,
      lfxUrl: rawProject.lfxUrl,
      term, year, termIndex,
    });
  }

  const organizations = Array.from(orgMap.entries()).map(([orgId, org]) => {
    const technologies = Array.from(org.technologies) as string[];
    const category = inferCategory(technologies, org.name);

    return {
      id: orgId,
      name: org.name,
      logoUrl: generateLogoSvg(org.name),
      description: org.descriptions[0]?.substring(0, 200) || \`\${org.name} participates in LFX Mentorship\`,
      foundation: "CNCF",
      category,
      terms: Array.from(org.terms).sort().reverse(),
      years: Array.from(org.years).sort((a: any, b: any) => b - a),
      technologies: technologies.slice(0, 15),
      projectCount: org.projects.length,
      projects: org.projects,
    };
  });

  organizations.sort((a, b) => {
    const yearDiff = (b.years[0] || 0) - (a.years[0] || 0);
    if (yearDiff !== 0) return yearDiff;
    return b.projectCount - a.projectCount;
  });

  const flatProjects = organizations.flatMap((org) => org.projects);

  const outDir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "organizations.json"), JSON.stringify(organizations, null, 2));
  fs.writeFileSync(path.join(outDir, "projects.json"), JSON.stringify(flatProjects, null, 2));

  console.log(\`\n✅ Output written to \${outDir}\`);
  console.log(\`   📦 \${organizations.length} organizations\`);
  console.log(\`   📋 \${flatProjects.length} projects\`);
}

main().catch(console.error);
`;
fs.writeFileSync('scripts/fetch-lfx-data.ts', content);
