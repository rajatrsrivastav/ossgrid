"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { livePrograms } from "@/data/programs";
import { enabledTools } from "@/data/site";
import type { ProgramStats } from "@/lib/stats";

interface Tile {
  href: string;
  title: string;
  count: string;
  verb: string;
}

/** Compact row linking every dashboard and tool, with a derived count each. */
export function DashboardsStrip({ programStats, extraTiles = [] }: { programStats: ProgramStats[]; extraTiles?: Tile[] }) {
  const tiles: Tile[] = [
    ...livePrograms().map((p) => {
      const s = programStats.find((x) => x.id === p.id);
      return { href: p.dashboardPath!, title: `${p.shortName} organizations`, count: s ? `${s.orgLabel} orgs · ${s.projectLabel} projects` : "", verb: `Browse ${p.shortName} orgs` };
    }),
    ...extraTiles,
    ...enabledTools().filter((t) => !extraTiles.some((e) => e.href === t.href)).map((t) => ({ href: t.href, title: t.label, count: "", verb: t.verb })),
  ];
  return (
    <div className="w-full border-y border-[var(--border)] bg-[var(--bg-raised)]">
      <ul className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8" aria-label="Dashboards and tools">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="card card-interactive flex h-full flex-col gap-1 px-4 py-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{t.title}</span>
              {t.count && <span className="num text-xs text-[var(--text-muted)]">{t.count}</span>}
              <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-[var(--accent)]">
                {t.verb} <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
