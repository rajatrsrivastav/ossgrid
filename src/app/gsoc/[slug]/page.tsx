import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Layers, Lightbulb, Calendar, MessageSquare, BookOpen, ListChecks } from "lucide-react";
import type { GsocProject } from "@/lib/types";
import Header from "@/components/Header";
import GitHubRepoActions from "@/components/GitHubRepoActions";
import { cn } from "@/lib/utils";
import { safeJsonLd } from "@/lib/seo";
import { gsocCalendar } from "@/data/programs";
import { getGsocOrganizations, getGsocOrgProjects } from "@/lib/gsoc-data";
import { getProposals } from "@/lib/proposals-data";

// ─── SSG ─────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getGsocOrganizations().map((org) => ({ slug: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = getGsocOrganizations().find((o) => o.slug === slug);
  if (!org) return { title: "Organization not found" };
  const years = org.years.length;
  const desc = `${org.name} took part in Google Summer of Code ${years} ${years === 1 ? "time" : "times"} (${org.firstYear} to ${org.latestYear}) and ran ${org.projectCount} ${org.projectCount === 1 ? "project" : "projects"}. Projects by year, technologies (${org.technologies.slice(0, 5).join(", ")}) and links to the ideas list.`;
  const canonicalUrl = `https://www.ossgrid.tech/gsoc/${slug}`;
  const title = `${org.name} — Google Summer of Code projects by year`;
  return {
    title,
    description: desc,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description: desc, url: canonicalUrl, type: "website", siteName: "OSSGrid", images: [{ url: org.logoUrl || "/og-image.jpg", alt: `${org.name} logo` }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [org.logoUrl || "/og-image.jpg"] },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function GitHubIcon({ size = 13 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/** One-line row used for older years so pages of long-running orgs stay small. */
function ProjectRow({ project }: { project: GsocProject }) {
  const href = project.projectUrl || project.codeUrl || project.sources[0]?.url;
  const idea = project.origin === "cncf";
  return (
    <li className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] py-2 last:border-b-0">
      <span className="min-w-0 text-sm text-[var(--text-primary)]">
        {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">{project.title}</a> : project.title}
        {idea && project.subProject && <span className="text-xs text-[var(--text-muted)]"> · {project.subProject}</span>}
      </span>
      <span className="num shrink-0 text-xs text-[var(--text-muted)]">{idea ? "idea" : project.contributor || "accepted"}</span>
    </li>
  );
}

function ProjectCard({ project }: { project: GsocProject }) {
  const idea = project.origin === "cncf";
  return (
    <li className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold leading-snug text-[var(--text-primary)]">{project.title}</h4>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {idea ? (
              <>Idea from the CNCF list{project.subProject ? <> for <span className="font-medium text-[var(--text-secondary)]">{project.subProject}</span></> : null}{project.size ? <> · {project.size} project</> : null}</>
            ) : (
              <>Accepted project{project.contributor ? <> · by <span className="font-medium text-[var(--text-secondary)]">{project.contributor}</span></> : null}</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {project.mentors.slice(0, 2).map((m) => m.github && (
            <a key={m.github} href={`https://github.com/${m.github}`} target="_blank" rel="noopener noreferrer" className="chip h-7 gap-1.5 pl-1 hover:border-[var(--border-strong)]" title={`Mentor: ${m.name}`}>
              <Image src={`https://github.com/${m.github}.png?size=40`} alt="" width={20} height={20} unoptimized className="h-5 w-5 rounded-full" />
              <span className="num">@{m.github}</span>
            </a>
          ))}
          {project.projectUrl && (
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`${project.title} on ${idea ? "GitHub" : "the GSoC archive"}`}>
              {idea ? <><GitHubIcon size={11} /> Issue</> : <>Archive <ExternalLink size={11} aria-hidden="true" /></>}
            </a>
          )}
          {project.codeUrl && (
            <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`Code for ${project.title}`}>
              Code <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
          {project.sources[0] && (
            <a href={project.sources[0].url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm h-7" aria-label={`Source file for ${project.title} on GitHub`}>
              Source <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
      {project.summary && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{project.summary}</p>}
      {project.codeUrl && <div className="mt-3"><GitHubRepoActions url={project.codeUrl} compact /></div>}
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
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GsocOrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allOrgs = getGsocOrganizations();
  const org = allOrgs.find((o) => o.slug === slug);
  if (!org) notFound();

  const byYear = getGsocOrgProjects(org.slug);
  const proposals = getProposals().filter((p) => p.orgId === org.slug);
  const currentYear = allOrgs.reduce((m, o) => Math.max(m, o.latestYear), 0);
  const activeThisYear = org.latestYear === currentYear;
  const allYears: number[] = [];
  for (let y = currentYear; y >= Math.min(org.firstYear, 2016); y--) allYears.push(y);
  const ideaCount = byYear.reduce((n, y) => n + y.projects.filter((p) => p.origin === "cncf").length, 0);

  const mine = new Set(org.technologies);
  const related = allOrgs
    .filter((o) => o.slug !== org.slug)
    .map((o) => ({ org: o, score: o.technologies.filter((t) => mine.has(t)).length + (o.category === org.category ? 1 : 0) }))
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score || b.org.projectCount - a.org.projectCount)
    .slice(0, 4)
    .map((x) => x.org);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
      { "@type": "ListItem", position: 2, name: "Google Summer of Code organizations", item: "https://www.ossgrid.tech/gsoc" },
      { "@type": "ListItem", position: 3, name: org.name, item: `https://www.ossgrid.tech/gsoc/${org.slug}` },
    ],
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    url: org.website || `https://www.ossgrid.tech/gsoc/${org.slug}`,
    logo: org.logoUrl || "https://www.ossgrid.tech/placeholder.svg",
    description: org.description,
    sameAs: [org.website, org.links.blog, org.links.twitter].filter(Boolean),
    knowsAbout: [...org.technologies, ...org.topics],
  };

  const linkButtons = [
    { href: org.links.ideas, label: "Ideas list", icon: Lightbulb },
    { href: org.links.guide, label: "Contributor guide", icon: BookOpen },
    { href: org.links.chat, label: "Chat", icon: MessageSquare },
  ].filter((l) => l.href);

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
              <li><Link href="/gsoc" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"><ArrowLeft size={12} aria-hidden="true" /> GSoC organizations</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="truncate text-[var(--text-secondary)]">{org.name}</li>
            </ol>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:gap-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-white lg:h-24 lg:w-24" style={org.logoBackground ? { background: org.logoBackground } : undefined}>
              <Image src={org.logoUrl || "/placeholder.svg"} alt={`${org.name} logo`} width={96} height={96} className="h-full w-full object-contain p-2.5" unoptimized />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="chip chip-active" style={{ "--accent": "var(--program-gsoc)" } as React.CSSProperties}><span>GSoC</span></span>
                <span className="chip"><span>{org.category}</span></span>
                <span className={cn("pill", activeThisYear ? "pill-success" : "pill-muted")}>
                  {activeThisYear && <span className="pill-dot" aria-hidden="true" />}
                  {activeThisYear ? "Accepted in" : "Last accepted"} <span className="num">{org.latestYear}</span>
                </span>
              </div>
              <h1 className="display text-3xl font-semibold text-[var(--text-primary)] md:text-4xl lg:text-5xl">{org.name}</h1>
              <p className="prose-measure mt-3 text-sm leading-relaxed text-[var(--text-secondary)] lg:text-base">{org.description || `${org.name} is a Google Summer of Code mentoring organization.`}</p>
            </div>

            <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] lg:w-[360px]">
              {[
                { label: "Projects", value: org.projectCount },
                { label: "Years accepted", value: org.years.length },
                { label: `In ${org.latestYear}`, value: org.projectsByYear[String(org.latestYear)] ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--bg-card)] px-4 py-3 text-right">
                  <dd className="num text-2xl font-semibold text-[var(--text-primary)]">{s.value}</dd>
                  <dt className="mt-0.5 text-xs text-[var(--text-muted)]">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {org.links.archive && (
              <a href={org.links.archive} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                View on the GSoC site <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
            {linkButtons.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <l.icon size={14} aria-hidden="true" /> {l.label}
              </a>
            ))}
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Website <ExternalLink size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-8 lg:flex-row">
          <main className="min-w-0 flex-1 space-y-14">
            <section id="projects" aria-labelledby="projects-heading" className="scroll-mt-28">
              <SectionTitle icon={Layers} count={org.projectCount}><span id="projects-heading">Projects by year</span></SectionTitle>
              {byYear.length === 0 ? (
                <p className="card p-5 text-sm text-[var(--text-secondary)]">The GSoC archive lists no project titles for this organization yet. Check the ideas list and the archive page above.</p>
              ) : (
                <div className="space-y-6">
                  {byYear.map(({ year, projects }, i) => {
                    const accepted = projects.filter((p) => p.origin === "gsoc");
                    const ideas = projects.filter((p) => p.origin === "cncf");
                    const open = i < 2;
                    const Item = open ? ProjectCard : ProjectRow;
                    return (
                      <details key={year} open={open} className="group">
                        <summary className="flex cursor-pointer list-none items-baseline gap-3 border-b border-[var(--border)] pb-2 [&::-webkit-details-marker]:hidden">
                          <h3 className="num text-lg font-semibold text-[var(--text-primary)]">{year}</h3>
                          <span className="num text-xs text-[var(--text-muted)]">
                            {accepted.length} accepted{ideas.length ? ` · ${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"}` : ""}
                          </span>
                          <span className="ml-auto text-xs text-[var(--text-muted)] group-open:hidden">Show</span>
                          <span className="ml-auto hidden text-xs text-[var(--text-muted)] group-open:inline">Hide</span>
                        </summary>
                        <div className="mt-4 space-y-6">
                          {accepted.length > 0 && <ul className={open ? "space-y-3" : "card px-4 py-1"}>{accepted.map((p) => <Item key={p.id} project={p} />)}</ul>}
                          {ideas.length > 0 && (
                            <div>
                              <p className="num mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                <Lightbulb size={12} aria-hidden="true" /> Ideas list for {year}, as published in cncf/mentoring
                              </p>
                              <ul className={open ? "space-y-3" : "card px-4 py-1"}>{ideas.map((p) => <Item key={p.id} project={p} />)}</ul>
                            </div>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              )}
            </section>

            {proposals.length > 0 && (
              <section id="proposals" aria-labelledby="proposals-heading" className="scroll-mt-28">
                <SectionTitle icon={Lightbulb} count={proposals.length}><span id="proposals-heading">Public proposals</span></SectionTitle>
                <ul className="space-y-2">
                  {proposals.slice(0, 12).map((p) => (
                    <li key={p.id}>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="card card-interactive flex items-center justify-between gap-3 px-4 py-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{p.title}</span>
                          <span className="num block text-xs text-[var(--text-muted)]">{p.year ?? "Year not recorded"}{p.author ? ` · ${p.author}` : ""} · {p.status === "accepted" ? "Accepted" : p.status === "rejected" ? "Rejected" : "Status not recorded"} · from {p.sourceRepo}</span>
                        </span>
                        <ExternalLink size={13} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--text-muted)]">
                  {proposals.length > 12 ? `Showing 12 of ${proposals.length}. ` : ""}Read them for structure, not to copy. <Link href={`/proposals?orgs=${org.slug}`} className="underline underline-offset-4 hover:text-[var(--text-primary)]">All proposals for {org.name}</Link>.
                </p>
              </section>
            )}

            {related.length > 0 && (
              <section id="related" aria-labelledby="related-heading">
                <SectionTitle icon={Layers}><span id="related-heading">Organizations with similar technologies</span></SectionTitle>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {related.map((r) => {
                    const shared = r.technologies.filter((t) => mine.has(t));
                    return (
                      <li key={r.slug}>
                        <Link href={`/gsoc/${r.slug}`} className="card card-interactive block p-4">
                          <span className="mb-2 flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-chip)] border border-[var(--border)] bg-white">
                              <Image src={r.logoUrl || "/placeholder.svg"} alt="" width={32} height={32} className="h-full w-full object-contain p-1" unoptimized />
                            </span>
                            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{r.name}</span>
                            <span className="num ml-auto shrink-0 text-xs text-[var(--text-muted)]">{r.years.length} {r.years.length === 1 ? "year" : "years"}</span>
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

          <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-28 lg:w-[340px] xl:w-[380px]">
            <div className="card p-5">
              <p className="eyebrow mb-3">Before you apply</p>
              <ol className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex gap-2"><ListChecks size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" /> Read the last two years of projects below. Themes repeat.</li>
                <li className="flex gap-2"><ListChecks size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" /> Open the ideas list and pick one idea, not three.</li>
                <li className="flex gap-2"><ListChecks size={14} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" /> Land one small fix in their repo before you write a proposal.</li>
              </ol>
              <p className="mt-3 text-xs text-[var(--text-muted)]">Timeline checked {gsocCalendar.lastVerified}.</p>
              <div className="mt-4 flex flex-col gap-2">
                <a href={org.links.ideas || org.links.archive || gsocCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
                  {org.links.ideas ? "Open the ideas list" : "Open the GSoC site"} <ExternalLink size={14} aria-hidden="true" />
                </a>
                <a href={gsocCalendar.timelineUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
                  Official timeline <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="card p-5">
              <p className="eyebrow mb-3 flex items-center gap-2"><Calendar size={13} aria-hidden="true" /> Participation</p>
              <ul className="grid grid-cols-6 gap-1.5" aria-label="Years accepted">
                {allYears.map((year) => {
                  const count = org.projectsByYear[String(year)];
                  const took = count !== undefined;
                  return (
                    <li key={year} className="flex flex-col items-center gap-1">
                      <span
                        className={cn("block h-5 w-full rounded-[4px] border", took ? (year === org.latestYear ? "border-[var(--program-gsoc)] bg-[var(--program-gsoc)]" : "border-transparent bg-[var(--program-gsoc)] opacity-40") : "border-[var(--border)] bg-[var(--bg-base)]")}
                        role="img"
                        aria-label={took ? `${year}: ${count} ${count === 1 ? "project" : "projects"}` : `${year}: not accepted`}
                        title={took ? `${year}: ${count} ${count === 1 ? "project" : "projects"}` : `${year}: not accepted`}
                      />
                      <span className="num text-[11px] text-[var(--text-muted)]" aria-hidden="true">&rsquo;{String(year).slice(2)}</span>
                    </li>
                  );
                })}
              </ul>
              {ideaCount > 0 && <p className="mt-3 text-xs text-[var(--text-muted)]">Ideas lists count as proposals, not accepted projects.</p>}
            </div>

            {(org.technologies.length > 0 || org.topics.length > 0) && (
              <div className="card p-5">
                <p className="eyebrow mb-3">Technologies and topics</p>
                <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                  {org.technologies.slice(0, 14).map((t) => <li key={t} className="chip chip-mono"><span>{t}</span></li>)}
                  {org.technologies.length > 14 && <li className="chip chip-quiet chip-mono"><span>+{org.technologies.length - 14}</span></li>}
                </ul>
                {org.topics.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Topics">
                    {org.topics.slice(0, 8).map((t) => <li key={t} className="chip chip-quiet"><span>{t}</span></li>)}
                  </ul>
                )}
              </div>
            )}

            <p className="px-1 text-xs text-[var(--text-muted)]">
              Data from{" "}
              <a href="https://www.gsocorganizations.dev" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">gsocorganizations.dev</a>
              {ideaCount > 0 && <> and <a href="https://github.com/cncf/mentoring" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">cncf/mentoring on GitHub</a></>}.
              Mentor emails are never shown.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
