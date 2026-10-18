import { ogCard, OG_SIZE } from "@/lib/og";
import { getLfxOrganizations } from "@/lib/og-data";

export const alt = "LFX Mentorship organizations and projects on OSSGrid";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const orgs = getLfxOrganizations();
  const perYear = new Map<number, number>();
  for (const o of orgs) for (const p of o.projects) perYear.set(p.year, (perYear.get(p.year) || 0) + 1);
  const bars = [...perYear.entries()].sort((a, b) => a[0] - b[0]).map(([y, n]) => ({ label: String(y), value: n }));
  return ogCard({
    eyebrow: "LFX Mentorship",
    title: "Every LFX Mentorship organization and project",
    stats: [
      { value: orgs.length.toLocaleString("en-US"), label: "organizations" },
      { value: orgs.reduce((s, o) => s + o.projectCount, 0).toLocaleString("en-US"), label: "projects" },
    ],
    bars,
  });
}
