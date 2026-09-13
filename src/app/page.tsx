import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "OSSGrid — Discover Open Source Mentorships & Ecosystems (LFX, GSoC & More)",
  description:
    "A developer guide and explorer for open-source mentorships and fellowships. Compare stipends, eligibility, and timelines across programs like LFX, GSoC, and Outreachy.",
  alternates: {
    canonical: "https://www.ossgrid.tech",
  },
  openGraph: {
    type: "website",
    siteName: "OSSGrid",
    title: "OSSGrid — Discover Open Source Mentorships & Ecosystems (LFX, GSoC & More)",
    description:
      "A developer guide and explorer for open-source mentorships and fellowships. Compare stipends, eligibility, and timelines across programs like LFX, GSoC, and Outreachy.",
    url: "https://www.ossgrid.tech",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSSGrid — Discover Open Source Mentorships & Ecosystems (LFX, GSoC & More)",
    description:
      "A developer guide and explorer for open-source mentorships and fellowships. Compare stipends, eligibility, and timelines across programs like LFX, GSoC, and Outreachy.",
    images: ["/og-image.jpg"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.ossgrid.tech/#webpage",
  url: "https://www.ossgrid.tech",
  name: "OSSGrid — Discover Open Source Mentorships & Ecosystems",
  description:
    "A developer guide and explorer for open-source mentorships and fellowships. Compare stipends, eligibility, and timelines across programs like LFX, GSoC, and Outreachy.",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://www.ossgrid.tech/#website",
    name: "OSSGrid",
    url: "https://www.ossgrid.tech",
  },
  about: [
    {
      "@type": "Thing",
      name: "Open Source Software Mentorship",
    },
    {
      "@type": "Thing",
      name: "Linux Foundation Mentorship (LFX)",
    },
    {
      "@type": "Thing",
      name: "Google Summer of Code (GSoC)",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
