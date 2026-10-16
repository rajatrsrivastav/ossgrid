import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomePageClient, { FeaturedOrg } from "@/components/home/HomePageClient";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getSiteStats } from "@/lib/stats";
import type { Organization } from "@/lib/types";

const description =
  "A free index of open-source mentorship programs. Browse LFX Mentorship organizations and projects by technology, year and mentor, and learn how selection actually works.";

export const metadata: Metadata = {
  title: "OSSGrid — Find open-source mentorships (LFX, GSoC)",
  description,
  alternates: { canonical: "https://www.ossgrid.tech" },
  openGraph: {
    type: "website",
    siteName: "OSSGrid",
    title: "OSSGrid — Find open-source mentorships (LFX, GSoC)",
    description,
    url: "https://www.ossgrid.tech",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSSGrid — Find open-source mentorships (LFX, GSoC)",
    description,
    images: ["/og-image.jpg"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.ossgrid.tech/#webpage",
  url: "https://www.ossgrid.tech",
  name: "OSSGrid — Find open-source mentorships",
  description,
  isPartOf: { "@type": "WebSite", "@id": "https://www.ossgrid.tech/#website", name: "OSSGrid", url: "https://www.ossgrid.tech" },
  about: [
    { "@type": "Thing", name: "Open Source Software Mentorship" },
    { "@type": "Thing", name: "LFX Mentorship" },
    { "@type": "Thing", name: "Google Summer of Code" },
  ],
};

function getFeatured(): { featured: FeaturedOrg[]; names: string[] } {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const sorted = [...orgs].sort((a, b) => b.projectCount - a.projectCount);
  const featured = sorted.slice(0, 3).map((o) => ({
    id: o.id,
    name: o.name,
    logoUrl: o.logoUrl,
    category: o.category,
    projectCount: o.projectCount,
    technologies: o.technologies.slice(0, 3),
    years: o.years.length,
  }));
  const names = sorted.slice(0, 18).map((o) => o.name);
  return { featured, names };
}

export default function HomePage() {
  const stats = getSiteStats();
  const { featured, names } = getFeatured();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }} />
      <HomePageClient stats={stats} featured={featured} orgNames={names} />
    </>
  );
}
