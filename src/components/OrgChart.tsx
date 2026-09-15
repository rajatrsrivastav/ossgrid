"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Project } from "@/lib/types";

// Concrete hex values from --chart-term* tokens
// (Recharts `fill` doesn't accept CSS var() — values must match globals.css)
const TERM_COLORS: Record<string, string> = {
  "Term 1": "#4f8eff",  // --chart-term1
  "Term 2": "#34d399",  // --chart-term2
  "Term 3": "#a78bfa",  // --chart-term3
  "Term 4": "#fb923c",  // --chart-term4
};

function shortTermLabel(term: string): string {
  const match = term.match(/Term\s*\d+/i);
  return match ? match[0] : term;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  fill?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  // Filter out any term with project count <= 0
  const activeItems = payload.filter((item) => {
    const val = typeof item.value === "number" ? item.value : Number(item.value);
    return !isNaN(val) && val > 0;
  });

  if (activeItems.length === 0) return null;

  return (
    <div
      className="pointer-events-none select-none rounded-xl"
      style={{
        width: 164,
        padding: "8px 10px",
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-card)",
        boxShadow: "var(--shadow-card)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex items-center justify-between pb-1.5 mb-1.5"
        style={{ borderBottom: "1px solid var(--border-card)" }}
      >
        <span
          className="text-xs font-bold font-mono tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {activeItems.map((item) => {
          const termName = String(item.name || item.dataKey || "");
          const count = Number(item.value) || 0;
          const dotColor = item.fill || TERM_COLORS[termName] || "var(--color-accent-raw)";

          return (
            <div
              key={termName}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden="true"
                />
                <span
                  className="text-[11px] font-medium truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {termName}
                </span>
              </div>
              <span
                className="text-[11px] font-mono whitespace-nowrap"
                style={{ color: "var(--text-primary)" }}
              >
                {count} {count === 1 ? "project" : "projects"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface OrgChartProps {
  projects: Project[];
}

export default function OrgChart({ projects }: OrgChartProps) {
  const yearTermCounts: Record<number, Record<string, number>> = {};
  const allTermLabels = new Set<string>();

  for (const p of projects) {
    const label = shortTermLabel(p.term);
    allTermLabels.add(label);
    if (!yearTermCounts[p.year]) yearTermCounts[p.year] = {};
    yearTermCounts[p.year][label] = (yearTermCounts[p.year][label] || 0) + 1;
  }

  const sortedYears = Object.keys(yearTermCounts).map(Number).sort((a, b) => a - b);
  const sortedTermLabels = Array.from(allTermLabels).sort();

  const chartData = sortedYears.map((year) => {
    const entry: Record<string, string | number> = { name: String(year) };
    for (const term of sortedTermLabels) {
      entry[term] = yearTermCounts[year][term] || 0;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-card)"
          opacity={0.4}
        />
        <XAxis
          dataKey="name"
          tick={{
            fill: "var(--text-secondary)",
            fontSize: 11,
            fontFamily: "var(--font-mono, monospace)",
          }}
          axisLine={{ stroke: "var(--border-card)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--bg-input)", opacity: 0.3 }}
          wrapperStyle={{ outline: "none", pointerEvents: "none", zIndex: 40 }}
          isAnimationActive={false}
        />
        <Legend
          wrapperStyle={{
            fontSize: "11px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono, monospace)",
          }}
        />
        {sortedTermLabels.map((term) => (
          <Bar
            key={term}
            dataKey={term}
            stackId="a"
            fill={TERM_COLORS[term] ?? "#4f8eff"}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
