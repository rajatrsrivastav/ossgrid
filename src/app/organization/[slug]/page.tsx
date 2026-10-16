import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { cache } from "react";
import { ExternalLink, ArrowLeft, Users, Layers, TrendingUp, Calendar } from "lucide-react";
import { Organization, Project } from "@/lib/types";
import OrgChartWrapper from "@/components/OrgChartWrapper";
import Header from "@/components/Header";
import OrgSectionNav from "@/components/OrgSectionNav";
import { sanitizeDescription, cn } from "@/lib/utils";
import { safeJsonLd } from "@/lib/seo";
import { lfxCalendar } from "@/data/programs";

const getOrganizationsCached = cache(async (): Promise<Organization[]> => {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
});

function GitHubIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ─── SSG ─────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const orgs = await getOrganizationsCached();
  return orgs.map((org) => ({ slug: org.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const orgs = await getOrganizationsCached();
  const org = orgs.find((o) => o.id === slug);
  if (!org) return { title: "Organization not found" };
  const desc = `${org.name} has run ${org.projectCount} LFX Mentorship ${org.projectCount === 1 ? "project" : "projects"} over ${org.years.length} ${org.years.length === 1 ? "year" : "years"}. Projects, mentors and technologies (${org.technologies.slice(0, 5).join(", ")}).`;
  const canonicalUrl = `https://www.ossgrid.tech/organization/${slug}`;
  const ogImage = org.logoUrl || "/og-image.jpg";
  const title = `${org.name} — LFX Mentorship projects and mentors`;
  return {
    title,
    description: desc,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description: desc, url: canonicalUrl, type: "website", siteName: "OSSGrid", images: [{ url: ogImage, alt: `${org.name} logo` }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [ogImage] },
  };
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

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

/** A term is "upcoming" only if the program calendar lists it as such. */
function getTermStatus(term: string): "upcoming" | "concluded" {
  const { year, termNum } = parseTerm(term);
  const match = lfxCalendar.terms.find((t) => t.label === `${year} Term ${termNum}`);
  return match?.status === "upcoming" ? "upcoming" : "concluded";
}

const nextTerm = lfxCalendar.terms.find((t) => t.status === "upcoming");

function getTechFrequency(projects: Project[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const p of projects) for (const s of p.skills) freq.set(s, (freq.get(s) ?? 0) + 1);
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
  const mine = new Set(org.technologies);
  return all
    .filter((o) => o.id !== org.id)
    .map((o) => ({ org: o, score: o.technologies.filter((t) => mine.has(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.org);
}

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

function SectionTitle({ icon: Icon, children, count }: { icon: typeof Layers; children: React.ReactNode; count?: number }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <Icon size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{children}</h2>
      {count !== undefined && <span className="num text-sm text-[var(--text-muted)]">{count}</span>}
      <span className="h-px flex-1 bg-[var(--border)]" aria-hidden="true" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allOrgs = await getOrganizationsCached();
  const org = allOrgs.find((o) => o.id === slug);
  if (!org) notFound();

  const sortedTerms = sortTermsDesc(org.terms);
  const latestTerm = sortedTerms[0];
  const latestParsed = latestTerm ? parseTerm(latestTerm) : null;
  const latestStatus = latestTerm ? getTermStatus(latestTerm) : "concluded";
  const latestTermProjects = org.projects.filter((p) => p.term === latestTerm);
  const latestLfxUrl = latestTermProjects.find((p) => p.lfxUrl)?.lfxUrl ?? org.projects.find((p) => p.lfxUrl)?.lfxUrl;

  const projectsByYearTerm: Record<number, Record<string, Project[]>> = {};
  for (const project of org.projects) {
    projectsByYearTerm[project.year] ??= {};
    projectsByYearTerm[project.year][project.term] ??= [];
    projectsByYearTerm[project.year][project.term].push(project);
  }
  const displayYears = Object.keys(projectsByYearTerm).map(Number).sort((a, b) => b - a);

  const techsSorted = [...getTechFrequency(org.projects).entries()].sort((a, b) => b[1] - a[1]);
  const allMentors = deduplicateMentors(org.projects);
  const relatedOrgs = getRelatedOrgs(org, allOrgs);

  const yearSpan = { min: Math.min(...org.years), max: Math.max(...org.years) };
  const allYears: number[] = [];
  for (let y = yearSpan.max; y >= yearSpan.min; y--) allYears.push(y);

  const cleanDesc = sanitizeDescription(org.description, org.name, org.id);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
      { "@type": "ListItem", position: 2, name: "LFX Mentorship organizations", item: "https://www.ossgrid.tech/lfx" },
      { "@type": "ListItem", position: 3, name: org.name, item: `https://www.ossgrid.tech/organization/${org.id}` },
    ],
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.website || `https://www.ossgrid.tech/organization/${org.id}`,
    logo: org.logoUrl || "https://www.ossgrid.tech/placeholder.svg",
    description: cleanDesc,
    sameAs: [org.website, org.github].filter(Boolean),
    knowsAbout: org.technologies,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(orgLd) }} />
      <Header variant="simple" />

      {/* Identity */}
      <div id="overview" className="scroll-mt-28 border-b border-[var(--border)] bg-[var(--bg-raised)]">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--text-muted)]">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-[var(--text-primary)]">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/lfx" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"><ArrowLeft size={12} aria-hidden="true" /> LFX organizations</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="truncate text-[var(--text-secondary)]">{org.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white lg:h-24 lg:w-24">
              <Image src={org.logoUrl || "/placeholder.svg"} alt={`${org.name} logo`} width={96} height={96} className="h-full w-full object-contain p-2.5" unoptimized />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {org.foundation && <span className="chip chip-active"><span>{org.foundation}</span></span>}
                <span className="chip"><span>{org.category}</span></span>
                {latestParsed && (
                  <span className={cn("pill", latestStatus === "upcoming" ? "pill-success" : "pill-muted")}>
                    {latestStatus === "upcoming" && <span className="pill-dot" aria-hidden="true" />}
                    {latestStatus === "upcoming" ? "Listed for" : "Last term"} <span className="num">{latestParsed.year} T{latestParsed.termNum}</span>
                  </span>
                )}
              </div>
              <h1 className="display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl lg:text-5xl">{org.name}</h1>
              <p className="prose-measure mt-3 text-sm leading-relaxed text-[var(--text-secondary)] lg:text-base">{cleanDesc}</p>
            </div>

            <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] lg:w-[360px]">
              {[
                { label: "Projects", value: org.projectCount },
                { label: "Years active", value: org.years.length },
                { label: latestParsed ? `In ${latestParsed.year} T${latestParsed.termNum}` : "Latest term", value: latestTermProjects.length },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--bg-card)] px-4 py-3 text-right">
                  <dd className="num text-2xl font-semibold text-[var(--text-primary)]">{s.value}</dd>
                  <dt className="mt-0.5 text-xs text-[var(--text-muted)]">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {latestLfxUrl && (
              <a href={latestLfxUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" id="apply-cta-main">
                View on the LFX portal <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <a href={org.github || org.sources[0]} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <GitHubIcon size={14} /> {org.github ? "GitHub" : "Source file"}
            </a>
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Website <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            <ul className="ml-1 flex flex-wrap items-center gap-1.5" aria-label="Most requested skills">
              {techsSorted.slice(0, 4).map(([tech]) => (
                <li key={tech} className="chip chip-mono"><span>{tech}</span></li>
              ))}
              {techsSorted.length > 4 && <li className="chip chip-quiet chip-mono"><span>+{techsSorted.length - 4}</span></li>}
            </ul>
          </div>
        </div>
      </div>

      <OrgSectionNav projectCount={org.projectCount} mentorCount={allMentors.length} />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <main className="min-w-0 flex-1 space-y-14">
            {/* Projects */}
            <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-28">
              <SectionTitle icon={Layers} count={org.projectCount}><span id="projects-heading">Projects</span></SectionTitle>

              <div className="space-y-10">
                {displayYears.map((year) => {
                  const termsForYear = Object.keys(projectsByYearTerm[year]).sort((a, b) => parseTerm(b).termNum - parseTerm(a).termNum);
                  const yearCount = Object.values(projectsByYearTerm[year]).flat().length;
                  return (
                    <div key={year}>
                      <div className="mb-4 flex items-baseline gap-3 border-b border-[var(--border)] pb-2">
                        <h3 className="num text-lg font-semibold text-[var(--text-primary)]">{year}</h3>
                        <span className="num text-xs text-[var(--text-muted)]">{yearCount} {yearCount === 1 ? "project" : "projects"}</span>
                      </div>

                      <div className="space-y-6">
                        {termsForYear.map((termLabel) => {
                          const { termNum, monthRange } = parseTerm(termLabel);
                          const projects = projectsByYearTerm[year][termLabel];
                          const isLatest = termLabel === latestTerm;
                          return (
                            <div key={termLabel}>
                              <p className="num mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <span className={cn("h-1.5 w-1.5 rounded-full", isLatest ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]")} aria-hidden="true" />
                                Term {termNum} · {monthRange} · {projects.length} {projects.length === 1 ? "project" : "projects"}
                              </p>

                              <ul className="space-y-3">
                                {projects.map((project, i) => {
                                  const primaryMentor = project.mentors[0];
                                  const desc = sanitizeProjectDesc(project.description || project.expectedOutcome || "");
                                  return (
                                    <li key={`${project.id}-${i}`} className="card p-4">
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-sm font-semibold leading-snug text-[var(--text-primary)]">{project.title}</h4>
                                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                                            {project.program} · {project.status === "proposed" ? "Proposed, acceptance not recorded" : "Listed in the official cohort"}
                                          </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                                          {primaryMentor?.github && (
                                            <a
                                              href={`https://github.com/${primaryMentor.github}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="chip h-7 gap-1.5 pl-1 hover:border-[var(--border-strong)]"
                                              title={`Mentor: ${primaryMentor.name}`}
                                            >
                                              <Image src={`https://github.com/${primaryMentor.github}.png?size=40`} alt="" width={20} height={20} unoptimized className="h-5 w-5 rounded-full" />
                                              <span className="num">@{primaryMentor.github}</span>
                                            </a>
                                          )}
                                          <a href={project.sources[0].url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`Source file for ${project.title} on GitHub`}>
                                            Source <ExternalLink size={11} aria-hidden="true" />
                                          </a>
                                          {project.upstreamIssueUrl && (
                                            <a href={project.upstreamIssueUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`GitHub issue for ${project.title}`}>
                                              <GitHubIcon size={11} /> Issue
                                            </a>
                                          )}
                                          {project.lfxUrl && (
                                            <a href={project.lfxUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`${project.title} on the LFX portal`}>
                                              {project.program === "CommunityBridge" ? "CommunityBridge" : "LFX portal"} <ExternalLink size={11} aria-hidden="true" />
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                      {desc && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>}
                                      {project.skills.length > 0 && (
                                        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Skills">
                                          {project.skills.slice(0, 6).map((skill) => (
                                            <li key={skill} className="chip chip-mono max-w-[200px]"><span>{skill}</span></li>
                                          ))}
                                          {project.skills.length > 6 && <li className="chip chip-quiet chip-mono"><span>+{project.skills.length - 6}</span></li>}
                                        </ul>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Mentors */}
            {allMentors.length > 0 && (
              <section id="mentors" aria-labelledby="mentors-heading" className="scroll-mt-28">
                <SectionTitle icon={Users} count={allMentors.length}><span id="mentors-heading">Mentors</span></SectionTitle>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {allMentors.slice(0, 12).map((mentor) => (
                    <li key={mentor.github}>
                      <a href={`https://github.com/${mentor.github}`} target="_blank" rel="noopener noreferrer" className="card card-interactive flex items-center gap-3 p-3">
                        <Image src={`https://github.com/${mentor.github}.png?size=64`} alt="" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-full border border-[var(--border)]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{mentor.name}</span>
                          <span className="num block truncate text-xs text-[var(--text-muted)]">@{mentor.github}</span>
                        </span>
                        <ExternalLink size={12} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
                {allMentors.length > 12 && <p className="mt-3 text-xs text-[var(--text-muted)]">Showing 12 of {allMentors.length}. Each project card links to its own mentor.</p>}
              </section>
            )}

            {/* Related */}
            {relatedOrgs.length > 0 && (
              <section id="related" aria-labelledby="related-heading">
                <SectionTitle icon={Layers}><span id="related-heading">Organizations with similar skills</span></SectionTitle>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {relatedOrgs.map((related) => {
                    const shared = related.technologies.filter((t) => org.technologies.includes(t));
                    return (
                      <li key={related.id}>
                        <Link href={`/organization/${related.id}`} className="card card-interactive block p-4">
                          <span className="mb-2 flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-chip)] border border-[var(--border)] bg-white">
                              <Image src={related.logoUrl || "/placeholder.svg"} alt="" width={32} height={32} className="h-full w-full object-contain p-1" unoptimized />
                            </span>
                            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{related.name}</span>
                          </span>
                          <span className="flex flex-wrap gap-1.5">
                            {shared.slice(0, 3).map((t) => <span key={t} className="chip chip-active chip-mono"><span>{t}</span></span>)}
                            {shared.length > 3 && <span className="chip chip-quiet chip-mono"><span>+{shared.length - 3}</span></span>}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-28 lg:w-[340px] xl:w-[380px]">
            <div className="card p-5">
              <p className="eyebrow mb-3">Next term</p>
              {nextTerm ? (
                <>
                  <p className="num text-lg font-semibold text-[var(--text-primary)]">{nextTerm.label}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {nextTerm.season} term. Projects are announced on the portal before it opens.
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No upcoming term listed. Check the portal.</p>
              )}
              <p className="mt-2 text-xs text-[var(--text-muted)]">Dates checked {lfxCalendar.lastVerified}.</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={latestLfxUrl ?? lfxCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                  Open the LFX portal <ExternalLink size={14} aria-hidden="true" />
                </a>
                <a href={org.github || org.sources[0]} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
                  <GitHubIcon size={13} /> {org.github ? "View on GitHub" : "Source file on GitHub"}
                </a>
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow mb-3 flex items-center gap-2"><TrendingUp size={13} aria-hidden="true" /> Projects by year</p>
              <div className="h-[235px]">
                <OrgChartWrapper projects={org.projects} />
              </div>
            </div>

            <div id="participation" className="card scroll-mt-28 p-5">
              <p className="eyebrow mb-4 flex items-center gap-2"><Calendar size={13} aria-hidden="true" /> Participation</p>
              <table className="num w-full border-separate border-spacing-1 text-xs" aria-label="Participation by year and term">
                <thead>
                  <tr className="text-[var(--text-muted)]">
                    <th scope="col" className="pr-2 text-left font-medium">Year</th>
                    {[1, 2, 3].map((t) => <th key={t} scope="col" className="w-8 text-center font-medium">T{t}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {allYears.map((year) => (
                    <tr key={year}>
                      <th scope="row" className="pr-3 text-left font-medium text-[var(--text-secondary)]">{year}</th>
                      {[1, 2, 3].map((termNum) => {
                        const participated = org.terms.some((t) => { const p = parseTerm(t); return p.year === year && p.termNum === termNum; });
                        const isLatest = latestParsed?.year === year && latestParsed?.termNum === termNum;
                        return (
                          <td key={termNum} className="text-center">
                            <span
                              className={cn(
                                "mx-auto block h-[18px] w-[18px] rounded-[4px] border",
                                participated
                                  ? isLatest ? "border-[var(--accent)] bg-[var(--accent)]" : "border-transparent bg-[var(--accent)] opacity-40"
                                  : "border-[var(--border)] bg-[var(--bg-base)]"
                              )}
                              role="img"
                              aria-label={participated ? `Took part in ${year} Term ${termNum}` : `No project in ${year} Term ${termNum}`}
                              title={participated ? `Took part in ${year} Term ${termNum}` : `No project in ${year} Term ${termNum}`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--accent)]" aria-hidden="true" /> Latest</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-[var(--accent)] opacity-40" aria-hidden="true" /> Past</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-[3px] border border-[var(--border)]" aria-hidden="true" /> None</span>
              </p>
            </div>

            <p className="px-1 text-xs text-[var(--text-muted)]">
              Data from{" "}
              <a href="https://github.com/cncf/mentoring" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">cncf/mentoring on GitHub</a>.
              Mentor emails are never shown.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
