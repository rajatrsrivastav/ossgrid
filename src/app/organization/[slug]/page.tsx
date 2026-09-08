import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ExternalLink, ArrowLeft, Users, Layers, TrendingUp, Calendar, Code2 } from "lucide-react";
import { Organization, Project } from "@/lib/types";
import OrgChartWrapper from "@/components/OrgChartWrapper";
import Header from "@/components/Header";
import { sanitizeDescription } from "@/lib/utils";

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function GitHubIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ─── SSG ─────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return [];
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return orgs.map((org) => ({ slug: org.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return { title: "Organization Not Found" };
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const org = orgs.find((o) => o.id === slug);
  if (!org) return { title: "Organization Not Found" };
  const desc = `${org.name} has ${org.projectCount} LFX Mentorship projects across ${org.years.length} terms. View projects, mentors, and participation history.`;
  return {
    title: `${org.name} — LFX Mentorship`,
    description: desc,
    openGraph: { title: `${org.name} — LFX Mentorship`, description: desc, type: "website" },
    twitter: { card: "summary", title: `${org.name} — LFX Mentorship`, description: desc },
  };
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function getOrganization(slug: string): Promise<Organization | null> {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return null;
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return orgs.find((o) => o.id === slug) || null;
}

async function getAllOrganizations(): Promise<Organization[]> {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseTerm(term: string): { year: number; termNum: number; monthRange: string } {
  const m = term.match(/(\d{4})\s+Term\s+(\d+)\s*\(([^)]+)\)/i);
  if (!m) return { year: 0, termNum: 0, monthRange: term };
  return { year: Number(m[1]), termNum: Number(m[2]), monthRange: m[3] };
}

function sortTermsDesc(terms: string[]): string[] {
  return [...terms].sort((a, b) => {
    const pa = parseTerm(a), pb = parseTerm(b);
    if (pa.year !== pb.year) return pb.year - pa.year;
    return pb.termNum - pa.termNum;
  });
}

function getTermStatus(term: string): "open" | "closing" | "closed" {
  const { year } = parseTerm(term);
  // 2026 Term 3 is concluded; next active cycle is 2027 Term 1
  if (year <= 2026) return "closed";
  return "open";
}

function getTechFrequency(projects: Project[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const p of projects) {
    for (const s of p.skills) freq.set(s, (freq.get(s) ?? 0) + 1);
  }
  return freq;
}

function deduplicateMentors(projects: Project[]): Array<{ name: string; github: string }> {
  const seen = new Set<string>();
  const out: Array<{ name: string; github: string }> = [];
  for (const p of projects) {
    for (const m of p.mentors) {
      if (m.github && !seen.has(m.github)) {
        seen.add(m.github);
        out.push({ name: m.name, github: m.github });
      }
    }
  }
  return out;
}

function getRelatedOrgs(org: Organization, all: Organization[]): Organization[] {
  const myTechs = new Set(org.technologies);
  return all
    .filter((o) => o.id !== org.id)
    .map((o) => ({ org: o, score: o.technologies.filter((t) => myTechs.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.org);
}

/** Clean project descriptions: strip scraper artifacts, markdown links, and bare URLs */
function sanitizeProjectDesc(desc: string): string {
  if (!desc) return "";
  const clean = desc
    .replace(/^(\s*[:\-–—]\s*|\s*description:\s*|\s*project\s+description:\s*)/i, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return clean.length > 20 ? clean : "";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TermBadge({ status, term }: { status: "open" | "closing" | "closed"; term: string }) {
  const { monthRange, year, termNum } = parseTerm(term);
  const cfg = {
    open: { dot: "#34d399", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.25)", text: "#34d399", label: "OPEN" },
    closing: { dot: "#fbbf24", bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.30)", text: "#fbbf24", label: "CLOSING SOON" },
    closed: { dot: "#6b7e99", bg: "rgba(107,126,153,0.08)", border: "rgba(107,126,153,0.15)", text: "#6b7e99", label: "CLOSED" },
  }[status];

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.08em", fontWeight: 600, color: cfg.text }}>
      {status !== "closed" && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot, boxShadow: status === "open" ? `0 0 6px ${cfg.dot}` : undefined }} />}
      {cfg.label}
      <span style={{ color: "var(--text-muted)", letterSpacing: "0.02em" }}>{year} T{termNum} · {monthRange}</span>
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [org, allOrgs] = await Promise.all([getOrganization(slug), getAllOrganizations()]);
  if (!org) notFound();

  const sortedTerms = sortTermsDesc(org.terms);
  const latestTerm = sortedTerms[0];
  const termStatus = latestTerm ? getTermStatus(latestTerm) : "closed";
  const latestTermProjects = org.projects.filter((p) => p.term === latestTerm);
  const latestLfxUrl = latestTermProjects.find((p) => p.lfxUrl)?.lfxUrl ?? org.projects.find((p) => p.lfxUrl)?.lfxUrl;

  const projectsByYearTerm: Record<number, Record<string, Project[]>> = {};
  for (const project of org.projects) {
    if (!projectsByYearTerm[project.year]) projectsByYearTerm[project.year] = {};
    if (!projectsByYearTerm[project.year][project.term]) projectsByYearTerm[project.year][project.term] = [];
    projectsByYearTerm[project.year][project.term].push(project);
  }
  const displayYears = Object.keys(projectsByYearTerm).map(Number).sort((a, b) => b - a);

  const techFreq = getTechFrequency(org.projects);
  const techsSorted = [...techFreq.entries()].sort((a, b) => b[1] - a[1]);
  const maxFreq = techsSorted[0]?.[1] ?? 1;

  const currentMentors = deduplicateMentors(latestTermProjects);
  const allMentors = deduplicateMentors(org.projects);
  const mentorsToShow = currentMentors.length > 0 ? currentMentors : allMentors.slice(0, 8);

  const relatedOrgs = getRelatedOrgs(org, allOrgs);

  const yearSpan = { min: Math.min(...org.years), max: Math.max(...org.years) };
  const allYears: number[] = [];
  for (let y = yearSpan.max; y >= yearSpan.min; y--) allYears.push(y);
  const allTermNums = [1, 2, 3];

  const cleanDesc = sanitizeDescription(org.description, org.name, org.id);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      <Header variant="simple" />

      {/* ══════════════════════════════════════════
          HERO BANNER — Full-width premium identity
      ══════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(79,142,255,0.08) 0%, rgba(167,139,250,0.05) 50%, transparent 100%)",
          borderBottom: "1px solid var(--border-card)",
        }}
      >
        {/* Dot grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(79,142,255,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
          }}
        />

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 pt-6 pb-8">
          {/* Breadcrumb */}
          <Link href="/lfx" className="inline-flex items-center gap-1.5 text-xs mb-8 transition-colors hover:text-blue-400" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={13} />
            LFX Mentorship
          </Link>

          {/* Identity: logo + name + meta */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-10">
            {/* Logo */}
            <div
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ border: "1px solid var(--border-card)", background: "var(--bg-raised)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            >
              <Image src={org.logoUrl || "/placeholder.png"} alt={`${org.name} logo`} width={96} height={96} className="w-full h-full object-contain p-2" unoptimized />
            </div>

            {/* Name + badges + description */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {org.foundation && (
                  <span className="badge badge-accent" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.06em" }}>
                    {org.foundation}
                  </span>
                )}
                <span className="badge" style={{ fontSize: "0.7rem" }}>{org.category}</span>
                {latestTerm && (
                  <div className="flex items-center gap-2">
                    <TermBadge status={termStatus} term={latestTerm} />
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Next: 2027 T1
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none mb-3" style={{ color: "var(--text-primary)" }}>
                {org.name}
              </h1>

              <p className="text-sm lg:text-base leading-relaxed max-w-2xl" style={{ color: "var(--text-secondary)" }}>
                {cleanDesc}
              </p>
            </div>

            {/* Stats strip — right-aligned on desktop */}
            <div className="flex lg:flex-col gap-6 lg:gap-4 flex-shrink-0 lg:items-end">
              <div className="text-right">
                <div className="text-3xl font-black font-mono" style={{ color: "var(--color-accent-raw)", letterSpacing: "-0.02em" }}>
                  {org.projectCount}
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)", marginTop: 2 }}>total projects</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono" style={{ color: "var(--color-purple, #a78bfa)", letterSpacing: "-0.02em" }}>
                  {org.years.length}
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)", marginTop: 2 }}>years active</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-zinc-400" style={{ letterSpacing: "-0.02em" }}>
                  {latestTermProjects.length}
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)", marginTop: 2 }}>2026 T3 (over)</div>
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            {latestLfxUrl && (
              <a href={latestLfxUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" id="apply-cta-main" style={{ padding: "11px 24px", fontSize: "0.9rem", fontWeight: 700, borderRadius: "var(--radius-lg)" }}>
                <ExternalLink size={15} />
                Check LFX Portal
              </a>
            )}
            <a href={`https://github.com/search?q=${encodeURIComponent(org.name)}&type=repositories`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "11px 20px", fontSize: "0.85rem" }}>
              <GitHubIcon size={14} />
              GitHub
            </a>
            {/* Tech pills — top 3 inline in hero */}
            <div className="flex items-center gap-2 ml-2">
              {techsSorted.slice(0, 3).map(([tech]) => (
                <span key={tech} className="badge" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", background: "var(--bg-badge)", border: "1px solid var(--border-card)" }}>
                  {tech}
                </span>
              ))}
              {techsSorted.length > 3 && (
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>+{techsSorted.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN: Two-column layout
          LEFT (flex-1): Projects
          RIGHT (w-80/w-96 sticky): Analytics sidebar
      ══════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 pb-28">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT COLUMN: Projects ── */}
          <main className="flex-1 min-w-0 space-y-14">

            {/* Section: Technologies */}
            <section id="technologies" aria-label="Technologies">
              <div className="flex items-center gap-3 mb-5">
                <Code2 size={15} style={{ color: "var(--color-accent-raw)" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent-raw)" }}>Technologies</span>
                <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {techsSorted.slice(0, 5).map(([tech, count]) => {
                  const weight = count / maxFreq;
                  return (
                    <Link
                      key={tech}
                      href={`/?tech=${encodeURIComponent(tech)}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: `${4 + weight * 4}px ${8 + weight * 6}px`,
                        borderRadius: "var(--radius-sm)",
                        background: weight > 0.6 ? "rgba(79,142,255,0.12)" : weight > 0.3 ? "rgba(79,142,255,0.07)" : "var(--bg-badge)",
                        border: `1px solid ${weight > 0.6 ? "rgba(79,142,255,0.3)" : weight > 0.3 ? "rgba(79,142,255,0.18)" : "var(--border-card)"}`,
                        fontFamily: "var(--font-mono)", fontSize: `${0.65 + weight * 0.15}rem`,
                        fontWeight: weight > 0.5 ? 600 : 500,
                        color: weight > 0.6 ? "var(--color-accent-raw)" : weight > 0.3 ? "var(--text-secondary)" : "var(--text-muted)",
                        textDecoration: "none", transition: "all 0.15s ease", letterSpacing: "0.03em",
                      }}
                      title={`${count} project${count !== 1 ? "s" : ""} use ${tech}`}
                    >
                      {tech}
                      {count > 1 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", opacity: 0.65 }}>×{count}</span>}
                    </Link>
                  );
                })}
              </div>
              {techsSorted.length > 5 && (
                <p style={{ marginTop: 8, fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  +{techsSorted.length - 5} more {techsSorted.length - 5 === 1 ? "technology" : "technologies"}
                </p>
              )}
            </section>

            {/* Section: Projects */}
            <section id="projects" aria-label="Project list">
              <div className="flex items-center gap-3 mb-6">
                <Layers size={15} style={{ color: "var(--color-accent-raw)" }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent-raw)" }}>Projects</span>
                <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
              </div>

              <div className="space-y-10">
                {displayYears.map((year) => {
                  const termsForYear = Object.keys(projectsByYearTerm[year]).sort((a, b) => parseTerm(b).termNum - parseTerm(a).termNum);
                  return (
                    <div key={year}>
                      {/* Year header */}
                      <div className="flex items-center gap-3 mb-5 pb-2" style={{ borderBottom: "1px solid var(--border-card)" }}>
                        <span className="text-lg font-black font-mono" style={{ color: "var(--color-purple, #a78bfa)", letterSpacing: "0.04em" }}>{year}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {Object.values(projectsByYearTerm[year]).flat().length} projects
                        </span>
                      </div>

                      <div className="space-y-8">
                        {termsForYear.map((termLabel) => {
                          const { termNum, monthRange } = parseTerm(termLabel);
                          const projects = projectsByYearTerm[year][termLabel];
                          const isCurrentTerm = termLabel === latestTerm;
                          return (
                            <div key={termLabel}>
                              {/* Term sub-header */}
                              <div className="flex items-center gap-3 mb-4">
                                <span
                                  style={{
                                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                                    background: isCurrentTerm ? "var(--color-accent-raw)" : "var(--text-muted)",
                                    boxShadow: isCurrentTerm ? "0 0 8px var(--color-accent-raw)" : undefined,
                                  }}
                                />
                                <span className="text-xs font-semibold uppercase tracking-wide font-mono" style={{ color: isCurrentTerm ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                  Term {termNum} · {monthRange}
                                </span>
                                {isCurrentTerm && <TermBadge status={termStatus} term={termLabel} />}
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
                              </div>

                              {/* Project cards grid — more visual than a table */}
                              <div className="space-y-3">
                                {projects.map((project, i) => {
                                  const primaryMentor = project.mentors[0];
                                  const cleanProjectDesc = sanitizeProjectDesc(project.description || project.expectedOutcome || "");
                                  return (
                                    <div
                                      key={`${project.id}-${i}`}
                                      className="rounded-xl p-4 transition-all"
                                      style={{
                                        background: "var(--bg-raised)",
                                        border: `1px solid ${isCurrentTerm ? "var(--border-card)" : "var(--border-card)"}`,
                                      }}
                                    >
                                      {/* Title row */}
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                          <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                                            {project.title}
                                          </h3>
                                        </div>
                                        {/* Right: mentor + links */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {primaryMentor?.github && (
                                            <a href={`https://github.com/${primaryMentor.github}`} target="_blank" rel="noopener noreferrer" title={primaryMentor.name} style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img src={`https://github.com/${primaryMentor.github}.png?size=40`} alt={primaryMentor.name} width={22} height={22} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid var(--border-card)" }} loading="lazy" />
                                              <span className="hidden sm:block text-xs font-mono" style={{ color: "var(--text-muted)" }}>@{primaryMentor.github}</span>
                                            </a>
                                          )}
                                          {project.upstreamIssueUrl && (
                                            <a href={project.upstreamIssueUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "3px 8px", fontSize: "0.7rem" }} aria-label={`GitHub issue for ${project.title}`}>
                                              <GitHubIcon size={11} /> Issue
                                            </a>
                                          )}
                                          {project.lfxUrl ? (
                                            <a href={project.lfxUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "3px 8px", fontSize: "0.7rem" }} aria-label={`View on LFX Portal: ${project.title}`}>
                                              LFX <ExternalLink size={10} />
                                            </a>
                                          ) : (
                                            <span style={{ padding: "3px 8px", fontSize: "0.7rem", color: "var(--text-muted)", background: "var(--bg-badge)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-card)", opacity: 0.5 }}>
                                              Closed
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Description */}
                                      {cleanProjectDesc && (
                                        <p className="text-xs leading-relaxed mb-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                                          {cleanProjectDesc}
                                        </p>
                                      )}

                                      {/* Skills */}
                                      {project.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {project.skills.slice(0, 6).map((skill) => (
                                            <span key={skill} style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)", background: "var(--bg-badge)", border: "1px solid var(--border-card)", borderRadius: "var(--radius-xs)", padding: "2px 6px", whiteSpace: "nowrap" }}>
                                              {skill}
                                            </span>
                                          ))}
                                          {project.skills.length > 6 && (
                                            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>+{project.skills.length - 6}</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Mentors */}
            {allMentors.length > 0 && (
              <section id="mentors" aria-label="Organization mentors">
                <div className="flex items-center gap-3 mb-5">
                  <Users size={15} style={{ color: "var(--color-accent-raw)" }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent-raw)" }}>Mentors</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>({allMentors.length})</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {allMentors.slice(0, 9).map((mentor) => (
                    <a
                      key={mentor.github}
                      href={`https://github.com/${mentor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:border-[var(--border-hover)]"
                      style={{
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border-card)",
                        textDecoration: "none",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://github.com/${mentor.github}.png?size=64`}
                        alt={mentor.name}
                        width={36}
                        height={36}
                        style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, border: "1px solid var(--border-card)" }}
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{mentor.name}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-accent-raw)", opacity: 0.9 }}>@{mentor.github}</div>
                      </div>
                      <ExternalLink size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Related Organizations */}
            {relatedOrgs.length > 0 && (
              <section id="related" aria-label="Related organizations">
                <div className="flex items-center gap-3 mb-5">
                  <Users size={15} style={{ color: "var(--color-accent-raw)" }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent-raw)" }}>Related Organizations</span>
                  <div style={{ flex: 1, height: 1, background: "var(--border-card)" }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedOrgs.map((related) => {
                    const sharedTechs = related.technologies.filter((t) => org.technologies.includes(t));
                    return (
                      <Link key={related.id} href={`/organization/${related.id}`} style={{ display: "block", padding: "14px 16px", borderRadius: "var(--radius-lg)", background: "var(--bg-raised)", border: "1px solid var(--border-card)", textDecoration: "none", transition: "border-color 0.15s, transform 0.15s" }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid var(--border-card)", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Image src={related.logoUrl || "/placeholder.png"} alt={related.name} width={30} height={30} className="object-contain p-0.5" unoptimized />
                          </div>
                          <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{related.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sharedTechs.slice(0, 3).map((t) => (
                            <span key={t} style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-accent-raw)", background: "var(--color-accent-dim)", border: "1px solid rgba(79,142,255,0.15)", borderRadius: "var(--radius-sm)", padding: "2px 6px" }}>{t}</span>
                          ))}
                          {sharedTechs.length > 3 && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>+{sharedTechs.length - 3}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </main>

          {/* ── RIGHT COLUMN: Sticky Analytics Sidebar ── */}
          <aside className="w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 space-y-5 lg:sticky lg:top-24">
            {/* CTA Card */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-card)" }}>
              {latestTerm && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Term Status</p>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                      Next: 2027 T1
                    </span>
                  </div>
                  <TermBadge status={termStatus} term={latestTerm} />
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    2026 Term 3 has concluded. Upcoming cycle is 2027 Term 1 (Spring, Mar–May).
                  </p>
                </div>
              )}
              {latestLfxUrl ? (
                <a href={latestLfxUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full" style={{ justifyContent: "center", padding: "12px", fontSize: "0.9rem", fontWeight: 700, borderRadius: "var(--radius-lg)" }}>
                  <ExternalLink size={15} /> Check LFX Portal
                </a>
              ) : (
                <div style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", padding: "10px 0" }}>Applications currently closed</div>
              )}
              <a href={`https://github.com/search?q=${encodeURIComponent(org.name)}&type=repositories`} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full mt-2" style={{ justifyContent: "center", fontSize: "0.8rem" }}>
                <GitHubIcon size={13} /> View on GitHub
              </a>
            </div>

            {/* Bar Chart Card */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-card)" }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} style={{ color: "var(--color-accent-raw)" }} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Projects by year</p>
              </div>
              <div style={{ height: 210 }}>
                <OrgChartWrapper projects={org.projects} />
              </div>
            </div>

            {/* Participation Card */}
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-card)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={14} style={{ color: "var(--color-accent-raw)" }} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Participation</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: "5px", fontFamily: "var(--font-mono)", fontSize: "0.65rem", width: "100%" }} aria-label="Participation matrix by year and term">
                  <thead>
                    <tr>
                      <th style={{ color: "var(--text-muted)", textAlign: "left", paddingRight: 8, fontWeight: 500 }}>Year</th>
                      {allTermNums.map((t) => (
                        <th key={t} style={{ color: "var(--text-muted)", fontWeight: 500, textAlign: "center", width: 28 }}>T{t}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allYears.map((year) => (
                      <tr key={year}>
                        <td style={{ color: "var(--text-secondary)", paddingRight: 12, fontWeight: 600, letterSpacing: "0.03em" }}>{year}</td>
                        {allTermNums.map((termNum) => {
                          const participated = org.terms.some((t) => { const p = parseTerm(t); return p.year === year && p.termNum === termNum; });
                          const isLatest = latestTerm && parseTerm(latestTerm).year === year && parseTerm(latestTerm).termNum === termNum;
                          return (
                            <td key={termNum} style={{ textAlign: "center" }}>
                              <div
                                style={{
                                  width: 18, height: 18, borderRadius: 3, margin: "0 auto",
                                  background: participated ? (isLatest ? "var(--color-accent-raw)" : "rgba(79,142,255,0.35)") : "var(--bg-primary)",
                                  border: `1px solid ${participated ? (isLatest ? "rgba(79,142,255,0.6)" : "rgba(79,142,255,0.25)") : "var(--border-card)"}`,
                                  boxShadow: isLatest ? "0 0 8px rgba(79,142,255,0.4)" : undefined,
                                }}
                                title={participated ? `Participated in ${year} Term ${termNum}` : `No participation in ${year} Term ${termNum}`}
                                role="img"
                                aria-label={participated ? `Participated ${year} Term ${termNum}` : `Absent ${year} Term ${termNum}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-3 mt-3" style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1.5"><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--color-accent-raw)" }} /> Current</span>
                  <span className="flex items-center gap-1.5"><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "rgba(79,142,255,0.35)" }} /> Past</span>
                  <span className="flex items-center gap-1.5"><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "var(--bg-primary)", border: "1px solid var(--border-card)" }} /> No projects</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* ── Sticky bottom CTA bar ── */}
      {latestLfxUrl && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-md"
          style={{
            background: "color-mix(in srgb, var(--bg-secondary) 88%, transparent)",
            borderTop: "1px solid var(--border-card)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {latestTerm && <TermBadge status={termStatus} term={latestTerm} />}
              <span className="hidden sm:block truncate text-xs" style={{ color: "var(--text-muted)" }}>
                2026 T3 closed · Next cycle: 2027 Term 1 · {org.name}
              </span>
            </div>
            <a href={latestLfxUrl} target="_blank" rel="noopener noreferrer" className="btn-primary flex-shrink-0" id="apply-cta-sticky" style={{ padding: "8px 20px", fontSize: "0.875rem", fontWeight: 600 }}>
              <ExternalLink size={14} /> Check LFX Portal
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
