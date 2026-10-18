import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import { PROGRAMS, factRows, getProgram, livePrograms } from "@/data/programs";
import { safeJsonLd } from "@/lib/seo";

/**
 * Preview page for a coming-soon program: facts, official links, data-source plan and
 * "Follow progress". Live programs redirect to their dashboard.
 */
export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProgram(id);
  if (!p) return { title: "Program not found" };
  const title = `${p.name} on OSSGrid`;
  const description = `${p.oneLiner} Stipend: ${p.facts.stipend.value}. Length: ${p.facts.length.value}. ${p.status === "live" ? "Browse every organization on OSSGrid." : "A dashboard is on the way; follow progress on GitHub."}`;
  return { title, description, alternates: { canonical: `https://www.ossgrid.tech/programs/${p.id}` }, openGraph: { title, description, url: `https://www.ossgrid.tech/programs/${p.id}`, type: "website", siteName: "OSSGrid" } };
}

export default async function ProgramPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = getProgram(id);
  if (!program) notFound();
  if (program.status === "live" && program.dashboardPath) redirect(program.dashboardPath);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
      { "@type": "ListItem", position: 2, name: "Programs", item: "https://www.ossgrid.tech/#programs" },
      { "@type": "ListItem", position: 3, name: program.name, item: `https://www.ossgrid.tech/programs/${program.id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <Header variant="simple" />
      <main id="main" className="flex w-full flex-1 flex-col">
      <PageMasthead
        crumbs={[{ label: "Home", href: "/" }, { label: "Programs", href: "/#programs" }, { label: program.name }]}
        label={`Coming soon · run by ${program.runBy}`}
        title={program.name}
        lede={<p>{program.oneLiner}</p>}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {factRows(program).map((f) => (
            <div key={f.id} className="bg-[var(--bg-card)] px-4 py-3">
              <dt className="text-xs text-[var(--text-muted)]">{f.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{f.value}</dd>
              <dd className="mt-1 text-xs text-[var(--text-muted)]">
                <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">Source</a>, checked {f.lastVerified}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={program.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Official site <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a href={program.trackingIssueUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Follow progress <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>

        <section className="card mt-10 p-5" aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="text-lg font-semibold text-[var(--text-primary)]">What a dashboard needs</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Every OSSGrid dashboard is built from public data that a script can read on a schedule, with a source link on every record. For {program.name} the plan starts from:
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {program.dataSources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--text-primary)] underline underline-offset-4">
                  {s.label} <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Know a better source, or want to build it? Open the tracking issue above. The checklist in it is the same for every program: registry entry, pipeline with fixtures, scheduled sync, route on the shared explorer, flip to live.
          </p>
        </section>

        <section className="mt-10" aria-labelledby="live-heading">
          <h2 id="live-heading" className="eyebrow mb-3">Indexed today</h2>
          <ul className="flex flex-wrap gap-2">
            {livePrograms().map((p) => (
              <li key={p.id}>
                <Link href={p.dashboardPath!} className="btn btn-secondary btn-sm">
                  Browse {p.shortName} orgs <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      </main>
    </div>
  );
}
