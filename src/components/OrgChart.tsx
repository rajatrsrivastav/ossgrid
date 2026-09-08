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

// Distinct colors per term index
const TERM_COLORS: Record<string, string> = {
  "Term 1": "#6366f1", // indigo
  "Term 2": "#22c55e", // green
  "Term 3": "#a855f7", // purple
  "Term 4": "#f97316", // orange
};

// Short label from full term string like "2026 Term 1 (Mar-May)" → "Term 1"
function shortTermLabel(term: string): string {
  const match = term.match(/Term\s*\d+/i);
  return match ? match[0] : term;
}

interface OrgChartProps {
  projects: Project[];
}

export default function OrgChart({ projects }: OrgChartProps) {
  // Build { year → { "Term 1": count, "Term 2": count, ... } }
  const yearTermCounts: Record<number, Record<string, number>> = {};
  const allTermLabels = new Set<string>();

  for (const p of projects) {
    const label = shortTermLabel(p.term);
    allTermLabels.add(label);

    if (!yearTermCounts[p.year]) yearTermCounts[p.year] = {};
    yearTermCounts[p.year][label] = (yearTermCounts[p.year][label] || 0) + 1;
  }

  // Sort years ascending for the chart X-axis
  const sortedYears = Object.keys(yearTermCounts)
    .map(Number)
    .sort((a, b) => a - b);

  // Sorted term labels: Term 1, Term 2, Term 3, Term 4
  const sortedTermLabels = Array.from(allTermLabels).sort();

  // Build Recharts data array
  const chartData = sortedYears.map((year) => {
    const entry: Record<string, string | number> = { name: String(year) };
    for (const term of sortedTermLabels) {
      entry[term] = yearTermCounts[year][term] || 0;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border-card)"
          opacity={0.4}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--text-secondary)", fontSize: 12, fontFamily: "var(--font-jetbrains, monospace)" }}
          axisLine={{ stroke: "var(--border-card)" }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-card)",
            borderRadius: "12px",
            fontSize: "13px",
            color: "var(--text-primary)",
          }}
          cursor={{ fill: "var(--bg-input)", opacity: 0.3 }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)" }}
        />
        {sortedTermLabels.map((term) => (
          <Bar
            key={term}
            dataKey={term}
            stackId="a"
            fill={TERM_COLORS[term] || "#94a3b8"}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
