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
  "Term 1": { label: "Term 1", sublabel: "Spring", color: "#3b82f6" },
  "Term 2": { label: "Term 2", sublabel: "Summer", color: "#10b981" },
  "Term 3": { label: "Term 3", sublabel: "Fall", color: "#a855f7" },
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
    <div
      className="pointer-events-none select-none rounded-xl"
      style={{
        minWidth: 160,
        padding: "8px 12px",
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
        <span
          className="text-[11px] font-mono font-semibold"
          style={{ color: "var(--text-muted)" }}
        >
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
                  {termKey}
                  <span
                    className="text-[10px] ml-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {sublabel}
                  </span>
                </span>
              </div>
              <span
                className="text-[11px] font-mono font-semibold whitespace-nowrap"
                style={{ color: "var(--text-primary)" }}
              >
                {count}
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
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
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
      <div
        className="flex items-center justify-center gap-4 pt-2.5 mt-1 select-none"
        style={{ borderTop: "1px solid var(--border-card)" }}
      >
        {(["Term 1", "Term 2", "Term 3"] as const).map((termKey) => {
          const cfg = TERM_CONFIG[termKey];
          return (
            <div key={termKey} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              <span
                className="text-[11px] font-mono font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {termKey}{" "}
                <span
                  style={{ color: "var(--text-muted)", fontSize: "10px" }}
                >
                  ({cfg.sublabel})
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
