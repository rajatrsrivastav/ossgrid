"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PROGRAMS, factRows, livePrograms, type Program } from "@/data/programs";
import type { ProgramStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");
const NEW_PROGRAM_ISSUE = "https://github.com/rajatrsrivastav/ossgrid/issues/new?template=new_program.yml";

function Facts({ program }: { program: Program }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm lg:grid-cols-4">
      {factRows(program).map((f) => (
        <div key={f.id}>
          <dt className="text-[var(--text-muted)]">
            {f.label}{" "}
            <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]" title={`Checked ${f.lastVerified}`} aria-label={`Source for ${program.name} ${f.label.toLowerCase()}, checked ${f.lastVerified}`}>source</a>
          </dt>
          <dd className="mt-0.5 font-medium text-[var(--text-primary)]">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Practical layer of the home story: search straight into a dashboard, then every program in the
 * registry as an editorial list with sourced facts. Follows the site theme.
 */
export default function ProgramsDirectory({ programStats }: { programStats: ProgramStats[] }) {
  const router = useRouter();
  const live = livePrograms();
  const soon = PROGRAMS.filter((p) => p.status !== "live");
  const [target, setTarget] = useState(live[0]?.dashboardPath ?? "/gsoc");
  const [q, setQ] = useState("");

  return (
    <section id="programs" aria-labelledby="programs-title" className="font-ui w-full bg-[var(--bg-base)] py-[clamp(88px,13vh,180px)]">
      <div className="cine-wrap">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 id="programs-title" className="font-display text-[clamp(2.4rem,5.6vw,5.75rem)] font-bold leading-[0.98] tracking-[-0.024em] text-[var(--text-primary)]">
            every program, one place to prepare.
          </h2>
          <p className="max-w-[36rem] text-[1.05rem] leading-relaxed text-[var(--text-secondary)]">
            {live.map((p) => p.shortName).join(" and ")} are indexed in full. {soon.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} have their facts here and dashboards on the way.
          </p>
        </div>

        {/* Search goes straight to the chosen dashboard with the query in its URL. */}
        <form
          role="search"
          aria-label="Search organizations"
          className="mt-12 flex flex-col gap-3 border-y border-[var(--border)] py-5 md:flex-row md:items-center"
          onSubmit={(e) => { e.preventDefault(); router.push(q.trim() ? `${target}?q=${encodeURIComponent(q.trim())}` : target); }}
        >
          <label className="flex flex-1 items-center gap-3">
            <Search size={20} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <span className="sr-only">Organization, technology or topic</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search an organization, language or topic"
              className="w-full bg-transparent py-2 text-lg text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] md:text-xl"
            />
          </label>
          <fieldset className="flex items-center gap-1 rounded-[3px] border border-[var(--border)] p-1">
            <legend className="sr-only">Program</legend>
            {live.map((p) => (
              <label key={p.id} className={cn("cursor-pointer rounded-[2px] px-3 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)]", target === p.dashboardPath ? "bg-[var(--text-primary)] text-[var(--bg-base)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
                <input type="radio" name="program" value={p.dashboardPath} checked={target === p.dashboardPath} onChange={() => setTarget(p.dashboardPath!)} className="sr-only" />
                {p.shortName}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="btn btn-primary h-11 rounded-[3px] px-6">Search</button>
        </form>

        {/* Live programs: wide rows with numbers, facts and routes. */}
        <ul className="mt-4" aria-label="Indexed programs">
          {live.map((p) => {
            const s = programStats.find((x) => x.id === p.id);
            return (
              <li key={p.id} className="grid gap-6 border-b border-[var(--border)] py-10 lg:grid-cols-[1fr_2fr_auto] lg:items-start" style={{ "--program-color": `var(${p.accentVar})` } as React.CSSProperties}>
                <div>
                  <p className="flex items-center gap-2 text-sm text-[var(--text-muted)]"><span className="h-2 w-2 rounded-full bg-[var(--program-color)]" aria-hidden="true" />Indexed · run by {p.runBy}</p>
                  <h3 className="font-display mt-2 text-[2rem] font-bold leading-none tracking-[-0.02em] text-[var(--text-primary)]">{p.name}</h3>
                  {s && <p className="mt-3 text-sm text-[var(--text-secondary)]">{nf.format(s.orgCount)} organizations and {nf.format(s.projectCount)} projects, {s.yearMin} to {s.yearMax}</p>}
                </div>
                <Facts program={p} />
                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  <Link href={p.dashboardPath!} className="btn btn-primary rounded-[3px]">Browse {p.shortName} orgs</Link>
                  <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary rounded-[3px]">Official site</a>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Coming soon: compact rows, same facts, links to the preview page and the tracking issue. */}
        <h3 className="mt-16 text-sm font-semibold text-[var(--text-primary)]">Dashboards on the way</h3>
        <ul className="mt-2" aria-label="Programs coming soon">
          {soon.map((p) => (
            <li key={p.id} className="grid gap-4 border-b border-[var(--border)] py-6 lg:grid-cols-[1fr_2fr_auto] lg:items-start" style={{ "--program-color": `var(${p.accentVar})` } as React.CSSProperties}>
              <div>
                <h4 className="font-display text-xl font-bold leading-tight text-[var(--text-primary)]">
                  <Link href={`/programs/${p.id}`} className="hover:underline">{p.name}</Link>
                </h4>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{p.oneLiner}</p>
              </div>
              <Facts program={p} />
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm lg:flex-col">
                <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--text-primary)] underline underline-offset-4">Official site</a>
                <a href={p.trackingIssueUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]">Follow progress</a>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <Link href="/proposals" className="font-medium text-[var(--text-primary)] underline underline-offset-4">Read public GSoC proposals</Link>
          <Link href="/guide" className="font-medium text-[var(--text-primary)] underline underline-offset-4">Open the contributor playbook</Link>
          <a href={NEW_PROGRAM_ISSUE} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]">Suggest a program</a>
        </div>
      </div>
    </section>
  );
}
