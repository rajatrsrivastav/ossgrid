import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomePageClient, { FeaturedOrg } from "@/components/home/HomePageClient";
import type { MarqueeOrg } from "@/components/landing/LogoMarquee";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getProgramStats, getCombinedStats } from "@/lib/stats";
import { orderByNextWindow } from "@/lib/program-windows";
import { getProposalStats } from "@/lib/proposals-data";
import { PROGRAMS, livePrograms } from "@/data/programs";
import type { GsocOrganization, Organization } from "@/lib/types";

const live = livePrograms();
const programList = live.map((p) => p.shortName).join(", ");
const title = "OSSGrid: GSoC, LFX and open-source mentorship orgs in one place";
const description = `A free index of open-source mentorship programs. Browse ${live.map((p) => p.name).join(" and ")} organizations, past projects and mentors by technology and year, and learn how selection actually works. ${PROGRAMS.length - live.length} more programs are on the way.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://www.ossgrid.tech" },
  openGraph: { type: "website", siteName: "OSSGrid", title, description, url: "https://www.ossgrid.tech", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.ossgrid.tech/#webpage",
  url: "https://www.ossgrid.tech",
  name: `OSSGrid: ${programList} and open-source mentorship orgs`,
  description,
  isPartOf: { "@type": "WebSite", "@id": "https://www.ossgrid.tech/#website", name: "OSSGrid", url: "https://www.ossgrid.tech" },
  about: [{ "@type": "Thing", name: "Open Source Software Mentorship" }, ...PROGRAMS.map((p) => ({ "@type": "Thing", name: p.name, url: p.officialUrl }))],
};

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", rel), "utf8"));
}

function getLandingData(): { featured: Record<string, FeaturedOrg[]>; marquee: MarqueeOrg[] } {
  const lfx = readJson<Organization[]>("data/organizations.json");
  const gsoc = readJson<GsocOrganization[]>("data/gsoc/organizations.json");
  const lfxSorted = [...lfx].sort((a, b) => b.projectCount - a.projectCount);
  const gsocSorted = [...gsoc].sort((a, b) => b.projectCount - a.projectCount);
  const featured: Record<string, FeaturedOrg[]> = {
    lfx: lfxSorted.slice(0, 3).map((o) => ({ id: o.id, name: o.name, href: `/organization/${o.id}`, logoUrl: o.logoUrl, category: o.category, projectCount: o.projectCount, technologies: o.technologies.slice(0, 3), years: o.years.length, program: "lfx" })),
    gsoc: gsocSorted.slice(0, 3).map((o) => ({ id: o.slug, name: o.name, href: `/gsoc/${o.slug}`, logoUrl: o.logoUrl, category: o.category, projectCount: o.projectCount, technologies: o.technologies.slice(0, 3), years: o.years.length, program: "gsoc" })),
  };
  // Mix the two programs so neither reads as the main one.
  const marquee: MarqueeOrg[] = [];
  for (let i = 0; i < 12; i++) {
    const g = gsocSorted[i], l = lfxSorted[i];
    if (g) marquee.push({ name: g.name, logoUrl: g.logoUrl, program: "gsoc" });
    if (l) marquee.push({ name: l.name, logoUrl: l.logoUrl.startsWith("data:") ? "" : l.logoUrl, program: "lfx" });
  }
  return { featured, marquee };
}

export default function HomePage() {
  const programStats = getProgramStats();
  const combined = getCombinedStats();
  const { featured, marquee } = getLandingData();
  const ctaOrder = orderByNextWindow(live).map((p) => p.id);
  const buildDate = new Date().toISOString().slice(0, 10);
  const proposals = getProposalStats();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }} />
      <HomePageClient programStats={programStats} combined={combined} featured={featured} marquee={marquee} ctaOrder={ctaOrder} buildDate={buildDate} proposals={proposals} />
    </>
  );
}
