"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Plus } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { PROGRAMS, factRows, type Program } from "@/data/programs";
import type { ProgramStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

const NEW_PROGRAM_ISSUE = "https://github.com/rajatrsrivastav/ossgrid/issues/new?template=new_program.yml";

function FactsTable({ program, compact }: { program: Program; compact?: boolean }) {
  return (
    <dl className={cn("mt-5 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)]", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
      {factRows(program).map((f) => (
        <div key={f.id} className="bg-[var(--bg-raised)] px-3 py-2.5">
          <dt className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            {f.label}
            <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]" aria-label={`Source for ${f.label.toLowerCase()}, checked ${f.lastVerified}`} title={`Checked ${f.lastVerified}`}>
              source
            </a>
          </dt>
          <dd className={cn("mt-0.5 font-semibold text-[var(--text-primary)]", compact ? "text-xs" : "text-sm")}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LiveCard({ program, stats }: { program: Program; stats?: ProgramStats }) {
  const nf = new Intl.NumberFormat("en-US");
  return (
    <li className="card card-selected flex flex-col p-5 md:p-6" style={{ "--program-color": `var(${program.accentVar})` } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">{program.runBy}</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{program.name}</h3>
        </div>
        <span className="pill pill-success"><span className="pill-dot" aria-hidden="true" />Live</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{program.oneLiner}</p>
      <FactsTable program={program} />
      {stats && (
        <p className="num mt-4 text-xs text-[var(--text-secondary)]">
          <strong className="font-semibold text-[var(--text-primary)]">{nf.format(stats.orgCount)}</strong> orgs · <strong className="font-semibold text-[var(--text-primary)]">{nf.format(stats.projectCount)}</strong> projects · {stats.yearMin}–{stats.yearMax}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={program.dashboardPath!} className="btn btn-primary">
          Browse {program.shortName} orgs <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <a href={program.officialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          Official site <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
    </li>
  );
}

function ComingSoonCard({ program }: { program: Program }) {
  return (
    <li className="card flex flex-col p-5" style={{ "--program-color": `var(${program.accentVar})` } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">{program.runBy}</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            <Link href={`/programs/${program.id}`} className="hover:underline">{program.name}</Link>
          </h3>
        </div>
        <span className="pill pill-muted">Coming soon</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{program.oneLiner}</p>
      <FactsTable program={program} compact />
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a href={program.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)] underline underline-offset-4">
          Official site <ExternalLink size={12} aria-hidden="true" />
        </a>
        <a href={program.trackingIssueUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]">
          Follow progress <ArrowRight size={12} aria-hidden="true" />
        </a>
      </div>
    </li>
  );
}

export function Programs({ programStats }: { programStats: ProgramStats[] }) {
  const live = PROGRAMS.filter((p) => p.status === "live");
  const soon = PROGRAMS.filter((p) => p.status !== "live");
  return (
    <Section id="programs">
      <SectionHeading
        eyebrow="Programs"
        title="Every major mentorship, one place to prepare."
        description={`${live.map((p) => p.shortName).join(" and ")} are fully indexed. ${soon.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} are next.`}
      />

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Live programs">
        {live.map((p) => (
          <LiveCard key={p.id} program={p} stats={programStats.find((s) => s.id === p.id)} />
        ))}
      </ul>

      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Programs coming soon">
        {soon.map((p) => (
          <ComingSoonCard key={p.id} program={p} />
        ))}
      </ul>

      <a href={NEW_PROGRAM_ISSUE} target="_blank" rel="noopener noreferrer" className="card card-interactive mt-4 flex items-center justify-between gap-3 px-5 py-4 text-sm">
        <span className="flex items-center gap-2 text-[var(--text-primary)]">
          <Plus size={15} className="text-[var(--text-muted)]" aria-hidden="true" /> Suggest a program
        </span>
        <span className="text-xs text-[var(--text-muted)]">Opens the new-program issue form on GitHub</span>
      </a>
    </Section>
  );
}
