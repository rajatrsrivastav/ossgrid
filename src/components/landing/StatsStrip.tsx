"use client";

import AnimatedCounter from "../AnimatedCounter";
import type { ProgramStats } from "@/lib/stats";
import { getProgram } from "@/data/programs";

interface Column { value: number; label: string }
interface Group { id: string; title: string; columns: Column[] }

/** One column group per live program (plus tools such as proposals when they ship). */
export function StatsStrip({ programStats, buildDate, extraGroups = [] }: { programStats: ProgramStats[]; buildDate: string; extraGroups?: Group[] }) {
  const groups: Group[] = [
    ...programStats.map((s) => {
      const p = getProgram(s.id)!;
      const columns: Column[] = [
        { value: s.orgCount, label: "Organizations" },
        { value: s.projectCount, label: "Projects" },
        s.termCount !== undefined ? { value: s.termCount, label: "Terms indexed" } : { value: s.yearMax - s.yearMin + 1, label: "Years indexed" },
      ];
      return { id: s.id, title: p.name, columns };
    }),
    ...extraGroups,
  ];

  return (
    <div className="w-full bg-[var(--bg-base)] py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:px-8" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))` }}>
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`stats-${g.id}`}>
            <h3 id={`stats-${g.id}`} className="eyebrow mb-4">{g.title}</h3>
            <dl className="grid grid-cols-3 gap-4">
              {g.columns.map((c) => (
                <div key={c.label} className="border-l border-[var(--border)] pl-4">
                  <dd className="num text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
                    <AnimatedCounter value={c.value} />
                  </dd>
                  <dt className="mt-1 text-xs text-[var(--text-muted)]">{c.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="mx-auto mt-6 w-full max-w-[1440px] px-4 text-xs text-[var(--text-muted)] sm:px-6 lg:px-8">
        Counts come from the current data files, updated {buildDate}.
      </p>
    </div>
  );
}
