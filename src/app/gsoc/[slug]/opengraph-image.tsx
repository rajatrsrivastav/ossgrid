import { ogCard, OG_SIZE } from "@/lib/og";
import { getGsocOrganizations } from "@/lib/gsoc-data";

export const alt = "Google Summer of Code organization on OSSGrid";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  return getGsocOrganizations().map((org) => ({ slug: org.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getGsocOrganizations().find((o) => o.slug === slug);
  if (!org) return ogCard({ eyebrow: "Google Summer of Code", title: "Organization not found", stats: [] });
  const years = Object.keys(org.projectsByYear).map(Number).sort((a, b) => a - b);
  const span = years.length ? Array.from({ length: years[years.length - 1] - years[0] + 1 }, (_, i) => years[0] + i) : [];
  return ogCard({
    eyebrow: `Google Summer of Code · ${org.category}`,
    title: org.name,
    stats: [
      { value: String(org.projectCount), label: org.projectCount === 1 ? "project" : "projects" },
      { value: String(org.years.length), label: org.years.length === 1 ? "year" : "years" },
      { value: `${org.firstYear}–${org.latestYear}`, label: "active" },
    ],
    bars: span.map((y) => ({ label: String(y), value: org.projectsByYear[y] || 0 })),
    accent: "#f59e0b",
  });
}
