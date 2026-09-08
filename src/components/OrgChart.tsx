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
          contentStyle={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-lg)",
            fontSize: "13px",
            color: "var(--text-primary)",
          }}
          cursor={{ fill: "var(--bg-input)", opacity: 0.3 }}
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
