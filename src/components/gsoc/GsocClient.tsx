"use client";

import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Info } from "lucide-react";
import type Fuse from "fuse.js";
import type { GsocOrganization } from "@/lib/types";
import type { ExplorerOrg } from "@/lib/explorer/types";
import { makeGsocConfig, gsocToExplorerOrg, gsocCurrentYear } from "@/lib/explorer/gsoc";
import { createExplorerIndex, createExplorerIndexFromPrebuilt } from "@/lib/explorer/filter";
import { gsocCalendar } from "@/data/programs";
import ExplorerShell from "@/components/explorer/ExplorerShell";
import PageMasthead from "@/components/PageMasthead";
import GsocAboutModal from "@/components/gsoc/GsocAboutModal";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

interface GsocClientProps {
  /** Counts rendered on the server so the intro never shows placeholders. */
  stats: { orgCount: number; projectCount: number; yearMin: number; yearMax: number };
}

/**
 * /gsoc explorer. The org DTO (~150 kB gzipped) and the prebuilt search index are fetched on the
 * client so the HTML stays small; per-year project files are only read by the org detail pages.
 */
export default function GsocClient({ stats }: GsocClientProps) {
  const [dtos, setDtos] = useState<GsocOrganization[]>([]);
  const [prebuilt, setPrebuilt] = useState<unknown>(undefined);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/gsoc/organizations.json").then((r) => r.json()),
      fetch("/data/gsoc/search-index.json").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/data/proposals/by-org.json").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
    ])
      .then(([orgs, index, counts]: [GsocOrganization[], unknown, Record<string, number>]) => {
        if (cancelled) return;
        setDtos(orgs);
        setPrebuilt(index);
        setProposalCounts(counts || {});
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const currentYear = useMemo(() => (dtos.length ? gsocCurrentYear(dtos) : stats.yearMax), [dtos, stats.yearMax]);
  const config = useMemo(() => makeGsocConfig(currentYear), [currentYear]);
  const organizations = useMemo(() => dtos.map((o) => gsocToExplorerOrg(o, currentYear, proposalCounts[o.slug] ?? 0)), [dtos, currentYear, proposalCounts]);
  const searchIndex = useMemo<Fuse<ExplorerOrg> | null>(() => {
    if (!organizations.length) return null;
    return prebuilt ? createExplorerIndexFromPrebuilt(organizations, config.searchKeys, prebuilt) : createExplorerIndex(organizations, config.searchKeys);
  }, [organizations, prebuilt, config.searchKeys]);

  const thisYearOrgs = useMemo(() => dtos.filter((o) => o.latestYear === currentYear).length, [dtos, currentYear]);
  const newThisYear = useMemo(() => dtos.filter((o) => o.firstYear === currentYear).length, [dtos, currentYear]);

  return (
    <ExplorerShell
      config={config}
      organizations={organizations}
      loading={loading}
      searchIndex={searchIndex}
      overlays={<GsocAboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />}
      masthead={() => (
        <PageMasthead
          art="gsoc"
          crumbs={[{ label: "Home", href: "/" }, { label: "Programs", href: "/#programs" }, { label: "Google Summer of Code" }]}
          title="Google Summer of Code organizations"
          lede={<p>Every organization accepted into GSoC from {stats.yearMin} to {stats.yearMax}, with the projects it ran each year, its technologies and its ideas list. Pick orgs that keep coming back, read their past projects, then start contributing before applications open.</p>}
          aside={
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4 lg:min-w-[520px]">
              {[
                { label: "Organizations", value: String(stats.orgCount) },
                { label: "Projects", value: stats.projectCount.toLocaleString("en-US") },
                { label: newThisYear ? `In ${currentYear}, ${newThisYear} new` : `Orgs in ${currentYear}`, value: loading ? "…" : String(thisYearOrgs) },
                { label: "Stipend", value: `${usd(gsocCalendar.stipend.minUsd)}–${(gsocCalendar.stipend.maxUsd / 1000).toFixed(1)}k` },
              ].map((s) => (
                <div key={s.label} className="bg-[var(--bg-card)] px-4 py-3">
                  <dt className="text-sm text-[var(--text-secondary)]">{s.label}</dt>
                  <dd className="font-display mt-1 whitespace-nowrap text-2xl font-bold leading-none tracking-[-0.01em] text-[var(--text-primary)]">{s.value}</dd>
                </div>
              ))}
            </dl>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setAboutOpen(true)} className="btn btn-secondary btn-sm">
              <Info size={13} aria-hidden="true" /> How GSoC works
            </button>
            <a href={gsocCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Official GSoC site <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </PageMasthead>
      )}
      intro={() => (
        <>
          {/* Yearly cycle */}
          <section aria-labelledby="cycle-heading" className="mb-10 mt-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="cycle-heading" className="text-lg font-semibold text-[var(--text-primary)]">The yearly cycle</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Checked {gsocCalendar.lastVerified} ·{" "}
                <a href={gsocCalendar.timelineUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">Official timeline</a>
              </p>
            </div>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gsocCalendar.phases.map((phase, i) => (
                <li key={phase.id} className="card flex flex-col gap-2 p-5" style={{ "--program-color": "var(--program-gsoc)" } as React.CSSProperties}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-xs text-[var(--text-muted)]">Step {i + 1}</span>
                    <span className="num text-xs font-medium text-[var(--program-color)]">{phase.when}</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{phase.label}</p>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{phase.note}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    />
  );
}
