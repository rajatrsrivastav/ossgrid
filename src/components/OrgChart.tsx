"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Project } from "@/lib/types";

export const TERM_CONFIG = {
  "Term 1": { label: "Term 1", sublabel: "Spring", color: "var(--chart-1)" },
  "Term 2": { label: "Term 2", sublabel: "Summer", color: "var(--chart-2)" },
  "Term 3": { label: "Term 3", sublabel: "Fall", color: "var(--chart-3)" },
} as const;

export type TermCategory = keyof typeof TERM_CONFIG;

/**
 * Normalizes any legacy or modern LFX term string into a unified 3-term seasonal schedule.
 * Handles legacy formats (e.g. "2020 Q2", "2021 Spring (Mar-May)", "2020 Q3–Q4", "2019 Pilot")
 * and modern formats (e.g. "2026 Term 1 (Mar-May)").
 */
export function normalizeTermToCategory(term: string): TermCategory {
  const lower = term.toLowerCase();
  if (
    lower.includes("term 1") ||
    lower.includes("spring") ||
    lower.includes("q1") ||
    lower.includes("q2") ||
    lower.includes("pilot")
  ) {
    return "Term 1";
  }
  if (lower.includes("term 2") || lower.includes("summer")) {
    return "Term 2";
  }
  if (
    lower.includes("term 3") ||
    lower.includes("fall") ||
    lower.includes("q3") ||
    lower.includes("q4")
  ) {
    return "Term 3";
  }
  return "Term 1";
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

  // Filter out terms with 0 count
  const activeItems = payload.filter((item) => {
    const val = typeof item.value === "number" ? item.value : Number(item.value);
    return !isNaN(val) && val > 0;
  });

  if (activeItems.length === 0) return null;

  const total = activeItems.reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  return (
    <div className="card pointer-events-none min-w-[160px] select-none px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between border-b border-[var(--border)] pb-1.5">
        <span className="num text-xs font-semibold text-[var(--text-primary)]">{label}</span>
        <span className="num text-xs text-[var(--text-muted)]">
          {total} {total === 1 ? "project" : "projects"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {activeItems.map((item) => {
          const termKey = String(item.name || item.dataKey || "") as TermCategory;
          const count = Number(item.value) || 0;
          const config = TERM_CONFIG[termKey];
          const dotColor = config?.color || item.fill || "var(--color-accent-raw)";
          const sublabel = config?.sublabel ? ` (${config.sublabel})` : "";

          return (
            <div
              key={termKey}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: dotColor }} aria-hidden="true" />
                <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
                  {termKey}
                  <span className="ml-1 text-[var(--text-muted)]">{sublabel}</span>
                </span>
              </div>
              <span className="num whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">{count}</span>
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
  const yearTermCounts: Record<
    number,
    Record<TermCategory, number>
  > = {};

  for (const p of projects) {
    const category = normalizeTermToCategory(p.term);
    if (!yearTermCounts[p.year]) {
      yearTermCounts[p.year] = { "Term 1": 0, "Term 2": 0, "Term 3": 0 };
    }
    yearTermCounts[p.year][category] =
      (yearTermCounts[p.year][category] || 0) + 1;
  }

  const sortedYears = Object.keys(yearTermCounts)
    .map(Number)
    .sort((a, b) => a - b);

  const chartData = sortedYears.map((year) => ({
    name: String(year),
    "Term 1": yearTermCounts[year]["Term 1"],
    "Term 2": yearTermCounts[year]["Term 2"],
    "Term 3": yearTermCounts[year]["Term 3"],
  }));

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chart Canvas */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -16, bottom: 2 }}
          >
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
              tick={{ fill: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--bg-input)", opacity: 0.3 }}
              wrapperStyle={{
                outline: "none",
                pointerEvents: "none",
                zIndex: 40,
              }}
              isAnimationActive={false}
            />
            <Bar
              dataKey="Term 1"
              name="Term 1"
              stackId="a"
              fill={TERM_CONFIG["Term 1"].color}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Term 2"
              name="Term 2"
              stackId="a"
              fill={TERM_CONFIG["Term 2"].color}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="Term 3"
              name="Term 3"
              stackId="a"
              fill={TERM_CONFIG["Term 3"].color}
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Unified Legend */}
      <div className="mt-1 flex select-none items-center justify-center gap-4 border-t border-[var(--border)] pt-2.5">
        {(["Term 1", "Term 2", "Term 3"] as const).map((termKey) => {
          const cfg = TERM_CONFIG[termKey];
          return (
            <div key={termKey} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]" style={{ backgroundColor: cfg.color }} aria-hidden="true" />
              <span className="num text-xs font-medium text-[var(--text-secondary)]">
                {termKey} <span className="text-[var(--text-muted)]">({cfg.sublabel})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
