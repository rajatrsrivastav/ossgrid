import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import GitHubRepoActions from "@/components/GitHubRepoActions";
import ContributionLoop from "@/components/guide/ContributionLoop";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { GUIDE_SOURCE, READINESS, COMMUNITY_FIRST, ISSUE_ADVICE, PR_CONVERSATIONS, SELECTION_SIGNALS, PROGRAM_CHECKLISTS, RESOURCES } from "@/data/guide";
import { PROGRAMS, getProgram } from "@/data/programs";
import { TOOL_PAGES } from "@/data/site";

const title = "Contributor playbook: how people actually get into GSoC, LFX and other mentorships";
const description = "Readiness, picking a community before an issue, the contribution loop as a checklist, pull request threads worth reading, what selection looks at, and a checklist for every program OSSGrid tracks.";

export const metadata: Metadata = {
  title: { absolute: `${title} | OSSGrid` },
  description,
  alternates: { canonical: "https://www.ossgrid.tech/guide" },
  openGraph: { type: "article", siteName: "OSSGrid", title, description, url: "https://www.ossgrid.tech/guide", images: [{ ...DEFAULT_OG_IMAGE, alt: "OSSGrid contributor playbook" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
    { "@type": "ListItem", position: 2, name: "Contributor playbook", item: "https://www.ossgrid.tech/guide" },
  ],
};

const SECTIONS = [
  { id: "readiness", label: "Readiness" },
  { id: "community", label: "Community first" },
  { id: "loop", label: "The loop" },
  { id: "issues", label: "Finding issues" },
  { id: "threads", label: "Threads to read" },
  { id: "selection", label: "What selection looks at" },
  { id: "programs", label: "Per program" },
  { id: "resources", label: "Resources" },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="display scroll-mt-24 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">{children}</h2>;
}

export default function GuidePage() {
  const proposals = TOOL_PAGES.find((t) => t.id === "proposals");
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header variant="simple" />
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[var(--text-muted)]">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="inline-flex items-center gap-1 hover:text-[var(--text-primary)]"><ArrowLeft size={12} aria-hidden="true" /> Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[var(--text-secondary)]">Contributor playbook</li>
          </ol>
        </nav>

        <header className="max-w-3xl">
          <p className="eyebrow mb-2">Contributor playbook</p>
          <h1 className="display text-3xl font-semibold text-[var(--text-primary)] md:text-5xl">You are not ready just because you want to start. Here is how to get ready.</h1>
          <p className="prose-measure mt-4 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            Open source rewards preparation, not excitement. This page adapts, in our own words, {GUIDE_SOURCE.author}&rsquo;s post{" "}
            <a href={GUIDE_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 text-[var(--text-primary)]">&ldquo;{GUIDE_SOURCE.title}&rdquo;</a>, and adds a checklist for every program OSSGrid tracks. Read the original; it has the full story.
          </p>
        </header>

        <div className="mt-10 flex flex-col items-start gap-10 lg:flex-row">
          <nav aria-label="On this page" className="panel top-24 w-full shrink-0 p-3 lg:sticky lg:w-[240px]">
            <p className="eyebrow mb-2 px-2">On this page</p>
            <ol className="flex flex-wrap gap-1 lg:flex-col">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]">
                    <span className="num text-xs text-[var(--text-muted)]">{String(i + 1).padStart(2, "0")}</span> {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <main className="min-w-0 flex-1 space-y-16">
            <section aria-labelledby="readiness">
              <H2 id="readiness">Readiness comes first</H2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {READINESS.map((r) => (
                  <div key={r.title} className="card p-5">
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{r.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{r.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="community">
              <H2 id="community">Pick a community before an issue</H2>
              <ul className="mt-6 space-y-3">
                {COMMUNITY_FIRST.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                The org pages on OSSGrid show years active, projects per year and mentors&rsquo; GitHub handles, so you can tell a steady community from a one-off before you join its chat.
              </p>
            </section>

            <section aria-labelledby="loop">
              <H2 id="loop">The contribution loop</H2>
              <p className="prose-measure mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">Tick them off as you go. The loop never really ends; the point is to get through it once, honestly.</p>
              <div className="mt-6"><ContributionLoop /></div>
            </section>

            <section aria-labelledby="issues">
              <H2 id="issues">Do not wait for good-first-issue labels</H2>
              <ul className="mt-6 space-y-3">
                {ISSUE_ADVICE.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" /> {c}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="threads">
              <H2 id="threads">Read pull request conversations</H2>
              <p className="prose-measure mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">Feature work is tradeoffs and discussion. These four threads show what maintainers actually ask for.</p>
              <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                {PR_CONVERSATIONS.map((pr) => (
                  <li key={pr.url} className="card flex flex-col p-5">
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="num text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">{pr.repo}#{pr.number}</a>
                    <h3 className="mt-1 text-base font-semibold text-[var(--text-primary)]">{pr.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{pr.lesson}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="selection">
              <H2 id="selection">What selection looks at</H2>
              <p className="prose-measure mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">Mentors are choosing someone to work with for months. Pull request count on its own is not the signal.</p>
              <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {SELECTION_SIGNALS.map((s) => (
                  <li key={s} className="card px-4 py-3 text-sm text-[var(--text-primary)]">{s}</li>
                ))}
              </ul>
              {proposals?.enabled && (
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  When you get to the proposal, read a few accepted ones in the <Link href={proposals.href} className="underline underline-offset-4 text-[var(--text-primary)]">proposals library</Link> for structure. Never copy one.
                </p>
              )}
            </section>

            <section aria-labelledby="programs">
              <H2 id="programs">Checklist per program</H2>
              <div className="mt-6 space-y-4">
                {PROGRAM_CHECKLISTS.map((c) => {
                  const p = getProgram(c.id)!;
                  return (
                    <details key={c.id} open={p.status === "live"} className="card group p-5" style={{ "--program-color": `var(${p.accentVar})` } as React.CSSProperties}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--program-color)]" aria-hidden="true" />
                          <span className="text-base font-semibold text-[var(--text-primary)]">{p.name}</span>
                          <span className={p.status === "live" ? "pill pill-success" : "pill pill-muted"}>{p.status === "live" ? "Indexed" : "Coming soon"}</span>
                        </span>
                        <span className="text-xs text-[var(--text-muted)] group-open:hidden">Show</span>
                        <span className="hidden text-xs text-[var(--text-muted)] group-open:inline">Hide</span>
                      </summary>
                      <ol className="mt-4 space-y-2">
                        {c.items.map((item, i) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                            <span className="num mt-0.5 text-xs text-[var(--text-muted)]">{String(i + 1).padStart(2, "0")}</span> {item}
                          </li>
                        ))}
                      </ol>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {p.dashboardPath ? (
                          <Link href={p.dashboardPath} className="btn btn-secondary btn-sm">Browse {p.shortName} orgs</Link>
                        ) : (
                          <Link href={`/programs/${p.id}`} className="btn btn-secondary btn-sm">About {p.shortName}</Link>
                        )}
                        <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Official site <ExternalLink size={12} aria-hidden="true" /></a>
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">Facts source</a>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="resources">
              <H2 id="resources">Resources</H2>
              <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                {RESOURCES.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="card card-interactive block p-4">
                      <span className="flex items-center justify-between gap-2 text-sm font-semibold text-[var(--text-primary)]">{r.name} <ExternalLink size={12} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" /></span>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">{r.why}</span>
                    </a>
                    <div className="mt-2 px-1"><GitHubRepoActions url={r.url} compact /></div>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-[var(--text-muted)]">
                Adapted from {GUIDE_SOURCE.author}&rsquo;s <a href={GUIDE_SOURCE.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">original post</a>. Program facts come from each program&rsquo;s official pages; {PROGRAMS.length} programs are tracked in the registry.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
