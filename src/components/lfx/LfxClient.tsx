"use client";

import { useState, useEffect, useMemo } from "react";
import { ExternalLink, Info } from "lucide-react";
import type { LfxOrganizationDto } from "@/lib/types";
import { lfxConfig, lfxToExplorerOrg } from "@/lib/explorer/lfx";
import { lfxCalendar } from "@/data/programs";
import { cn } from "@/lib/utils";
import ExplorerShell from "@/components/explorer/ExplorerShell";
import PageMasthead from "@/components/PageMasthead";
import AboutModal from "@/components/AboutModal";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

interface LfxClientProps {
  initialOrganizations?: LfxOrganizationDto[];
}

export default function LfxClient({ initialOrganizations = [] }: LfxClientProps) {
  const [dtos, setDtos] = useState<LfxOrganizationDto[]>(initialOrganizations);
  const [loading, setLoading] = useState(initialOrganizations.length === 0);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (initialOrganizations.length > 0) return;
    fetch(lfxConfig.dataUrl)
      .then((r) => r.json())
      .then((data: LfxOrganizationDto[]) => { setDtos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [initialOrganizations]);

  const organizations = useMemo(() => dtos.map(lfxToExplorerOrg), [dtos]);
  const totalProjects = useMemo(() => dtos.reduce((a, o) => a + o.projectCount, 0), [dtos]);
  const yearMin = useMemo(() => dtos.reduce((m, o) => Math.min(m, ...o.years), 9999), [dtos]);
  const yearMax = useMemo(() => dtos.reduce((m, o) => Math.max(m, ...o.years), 0), [dtos]);

  return (
    <ExplorerShell
      config={lfxConfig}
      organizations={organizations}
      loading={loading}
      overlays={<AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />}
      masthead={() => (
        <PageMasthead
          art="lfx"
          crumbs={[{ label: "Home", href: "/" }, { label: "Programs", href: "/#programs" }, { label: "LFX Mentorship" }]}
          title="LFX Mentorship dashboard"
          lede={<p>Every organization that has offered an LFX Mentorship project{yearMin < 9999 ? ` since ${yearMin}` : ""}, with its projects, mentors and technologies. Filter by what you already know, then read the org page before you apply.</p>}
          aside={
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4 lg:min-w-[520px]">
              {[
                { label: "Organizations", value: loading ? "…" : String(dtos.length) },
                { label: "Projects", value: loading ? "…" : String(totalProjects) },
                { label: "Years of data", value: loading || yearMin > 9999 ? "…" : `${yearMin}–${String(yearMax).slice(2)}` },
                { label: "Stipend", value: `${usd(lfxCalendar.stipend.minUsd / 1000)}k–${(lfxCalendar.stipend.maxUsd / 1000).toFixed(1)}k` },
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
              <Info size={13} aria-hidden="true" /> How LFX works
            </button>
            <a href={lfxCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              Official LFX portal <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </PageMasthead>
      )}
      intro={() => (
        <>
          {/* Terms */}
          <section aria-labelledby="terms-heading" className="mb-10 mt-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="terms-heading" className="text-lg font-semibold text-[var(--text-primary)]">Term schedule</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Checked {lfxCalendar.lastVerified} ·{" "}
                <a href={lfxCalendar.docsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">LFX docs</a>
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {lfxCalendar.terms.map((t) => {
                const upcoming = t.status === "upcoming";
                return (
                  <li
                    key={t.id}
                    className={cn("card flex flex-col gap-2 p-5", upcoming && "card-selected")}
                    style={{ "--program-color": "var(--program-lfx)" } as React.CSSProperties}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="num text-sm font-semibold text-[var(--text-primary)]">{t.label}</span>
                      <span className={cn("pill", upcoming ? "pill-success" : "pill-muted")}>
                        {upcoming && <span className="pill-dot" aria-hidden="true" />}
                        {upcoming ? "Next" : "Concluded"}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{t.season} term</p>
                    <p className="num text-xs text-[var(--text-muted)]">{fmtDate(t.start)} to {fmtDate(t.end)}</p>
                    {upcoming && (
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        Projects are announced on the portal before the term starts. Pick orgs now and start contributing early.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    />
  );
}
