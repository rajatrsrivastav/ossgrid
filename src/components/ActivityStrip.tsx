"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ActivityStripProps {
  /** Years plotted, oldest first. */
  years: number[];
  /** Count per plotted year. */
  counts: Record<number, number>;
  /** All-time total and years active, for the share and the summary line. */
  total: number;
  activeYears: number;
  unit: string;
}

/**
 * Projects per year as bars. Hovering a bar, or focusing the strip and using the arrow keys,
 * shows that year's count, its share of the organization's total and how it compares to the
 * busiest year. The strip sits above the card's stretched link so it can take the pointer.
 */
export default function ActivityStrip({ years, counts, total, activeYears, unit }: ActivityStripProps) {
  const [active, setActive] = useState<number | null>(null);
  const plural = `${unit}s`;
  const label = (n: number) => `${n} ${n === 1 ? unit : plural}`;
  const max = Math.max(...years.map((y) => counts[y] || 0), 1);
  const busiest = years.find((y) => (counts[y] || 0) === max && max > 0);
  const year = active === null ? null : years[active];
  const count = year === null ? 0 : counts[year] || 0;
  const summary = `${plural[0].toUpperCase()}${plural.slice(1)} per year: ${years.map((y) => `${y} ${counts[y] || 0}`).join(", ")}. ${label(total)} over ${activeYears} ${activeYears === 1 ? "year" : "years"} in total.`;

  return (
    <div
      className="activity relative z-10 mt-4 rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
      role="img"
      aria-label={summary}
      tabIndex={0}
      onPointerLeave={() => setActive(null)}
      onBlur={() => setActive(null)}
      onFocus={() => setActive((a) => a ?? years.length - 1)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const d = e.key === "ArrowRight" ? 1 : -1;
          setActive((a) => Math.min(years.length - 1, Math.max(0, (a ?? years.length - 1) + d)));
        }
        if (e.key === "Escape") setActive(null);
      }}
    >
      <div className="flex h-10 items-end gap-1">
        {years.map((y, i) => {
          const n = counts[y] || 0;
          const pct = n > 0 ? Math.max(Math.round((n / max) * 100), 20) : 0;
          const on = active === i;
          return (
            <div
              key={y}
              className="flex h-full flex-1 cursor-default flex-col justify-end"
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
            >
              <div
                className={cn(
                  "activity__bar w-full origin-bottom rounded-[2px] transition-[opacity,transform,background-color] duration-200",
                  n > 0 ? "bg-[var(--program-color)]" : "bg-[var(--border-strong)]",
                  active !== null && !on && "opacity-35",
                  on && n > 0 && "scale-y-[1.08]"
                )}
                style={{ height: n > 0 ? `${pct}%` : "2px", opacity: active === null ? (n > 0 ? 0.9 : 1) : undefined }}
              />
            </div>
          );
        })}
      </div>

      {/* Tooltip above the hovered bar. */}
      {year !== null && (
        <div
          className="activity__tip"
          style={{ left: `${((active! + 0.5) / years.length) * 100}%` }}
          aria-hidden="true"
        >
          <p className="num text-xs text-[var(--text-muted)]">{year}{year === busiest && count > 0 ? " · busiest year" : ""}</p>
          <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{count > 0 ? label(count) : `No ${plural}`}</p>
          {count > 0 && total > 0 && <p className="text-xs text-[var(--text-secondary)]">{Math.round((count / total) * 100)}% of all {label(total)}</p>}
        </div>
      )}

      <div className="num mt-1 flex justify-between text-xs text-[var(--text-muted)]" aria-hidden="true">
        <span>{String(years[0]).slice(2).padStart(3, "'")}</span>
        {year !== null ? <span className="text-[var(--text-secondary)]">{year}: {label(count)}</span> : <span className="activity__hint">Hover for counts</span>}
        <span>{String(years[years.length - 1]).slice(2).padStart(3, "'")}</span>
      </div>
    </div>
  );
}
