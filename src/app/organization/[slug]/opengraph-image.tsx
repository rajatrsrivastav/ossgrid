import { ogCard, OG_SIZE } from "@/lib/og";
import { getLfxOrganizations } from "@/lib/og-data";

export const alt = "LFX Mentorship organization on OSSGrid";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return getLfxOrganizations().map((org) => ({ slug: org.id }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getLfxOrganizations().find((o) => o.id === slug);
  if (!org) return ogCard({ eyebrow: "LFX Mentorship", title: "Organization not found", stats: [] });
  const perYear = new Map<number, number>();
  for (const p of org.projects) perYear.set(p.year, (perYear.get(p.year) || 0) + 1);
  const ys = [...perYear.keys()].sort((a, b) => a - b);
  const span = ys.length ? Array.from({ length: ys[ys.length - 1] - ys[0] + 1 }, (_, i) => ys[0] + i) : [];
  return ogCard({
    eyebrow: "LFX Mentorship",
    title: org.name,
    stats: [
      { value: String(org.projectCount), label: org.projectCount === 1 ? "project" : "projects" },
      { value: String(org.years.length), label: org.years.length === 1 ? "year" : "years" },
    ],
    bars: span.map((y) => ({ label: String(y), value: perYear.get(y) || 0 })),
  });
}
