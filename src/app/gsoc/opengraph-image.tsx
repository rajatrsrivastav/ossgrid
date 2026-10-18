import { ogCard, OG_SIZE } from "@/lib/og";
import { getGsocOrganizations } from "@/lib/gsoc-data";

export const alt = "Google Summer of Code organizations, 2016 to today, on OSSGrid";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const orgs = getGsocOrganizations();
  const perYear = new Map<number, number>();
  for (const o of orgs) for (const y of o.years) perYear.set(y, (perYear.get(y) || 0) + 1);
  const bars = [...perYear.entries()].sort((a, b) => a[0] - b[0]).map(([y, n]) => ({ label: String(y), value: n }));
  return ogCard({
    eyebrow: "Google Summer of Code",
    title: "Every GSoC organization, year by year",
    stats: [
      { value: orgs.length.toLocaleString("en-US"), label: "organizations" },
      { value: orgs.reduce((s, o) => s + o.projectCount, 0).toLocaleString("en-US"), label: "projects" },
    ],
    bars,
    accent: "#f59e0b",
  });
}
