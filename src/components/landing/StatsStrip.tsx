"use client";

import AnimatedCounter from "../AnimatedCounter";
import type { SiteStats } from "@/lib/stats";
import { lfxCalendar } from "@/data/programs";

export function StatsStrip({ stats }: { stats: SiteStats }) {
  const items = [
    { value: stats.orgCount, label: "Organizations" },
    { value: stats.projectCount, label: "Projects" },
    { value: stats.termCount, label: "Terms indexed" },
    { value: lfxCalendar.stipend.maxUsd, prefix: "$", label: "Max LFX stipend (USD)" },
  ];

  return (
    <div className="w-full bg-[var(--bg-base)] py-10 md:py-14">
      <dl className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map((s) => (
          <div key={s.label} className="border-l border-[var(--border)] pl-4">
            <dd className="num flex items-baseline text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
              {s.prefix && <span className="mr-0.5 text-xl text-[var(--text-muted)]">{s.prefix}</span>}
              <AnimatedCounter value={s.value} />
            </dd>
            <dt className="mt-1 text-sm text-[var(--text-muted)]">{s.label}</dt>
          </div>
        ))}
      </dl>
      <p className="mx-auto mt-6 w-full max-w-[1440px] px-4 text-xs text-[var(--text-muted)] sm:px-6 lg:px-8">
        Counts come from the current data files. Stipend from the LFX docs, checked {lfxCalendar.lastVerified}.
      </p>
    </div>
  );
}
