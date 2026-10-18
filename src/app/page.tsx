import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getHomeData } from "@/lib/home-data";
import { PROGRAMS, livePrograms } from "@/data/programs";

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

export default function HomePage() {
  const data = getHomeData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }} />
      <HomePageClient data={data} />
    </>
  );
}
