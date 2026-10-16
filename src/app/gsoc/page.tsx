import type { Metadata } from "next";
import Link from "next/link";
import GsocClient from "@/components/gsoc/GsocClient";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { getGsocStats } from "@/lib/stats";
import { getGsocOrganizations } from "@/lib/gsoc-data";

const stats = getGsocStats();
const title = `Google Summer of Code organizations — ${stats.orgLabel} orgs, ${stats.yearMin} to ${stats.yearMax}`;
const description = `Browse ${stats.orgLabel} Google Summer of Code organizations and ${stats.projectLabel} projects from ${stats.yearMin} to ${stats.yearMax}. Filter by year, technology, topic and category; open an org to see what it ran each year.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://www.ossgrid.tech/gsoc" },
  openGraph: {
    type: "website",
    siteName: "OSSGrid",
    title,
    description,
    url: "https://www.ossgrid.tech/gsoc",
    images: [{ ...DEFAULT_OG_IMAGE, alt: "OSSGrid Google Summer of Code organizations" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
    { "@type": "ListItem", position: 2, name: "Google Summer of Code organizations", item: "https://www.ossgrid.tech/gsoc" },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://www.ossgrid.tech/gsoc#collection",
  url: "https://www.ossgrid.tech/gsoc",
  name: "Google Summer of Code organizations",
  description,
  isPartOf: { "@type": "WebSite", "@id": "https://www.ossgrid.tech/#website", name: "OSSGrid", url: "https://www.ossgrid.tech" },
};

export default function GsocPage() {
  const organizations = getGsocOrganizations();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />
      <GsocClient stats={{ orgCount: stats.orgCount, projectCount: stats.projectCount, yearMin: stats.yearMin, yearMax: stats.yearMax }} />

      {/* Static crawler index for search engines without JavaScript */}
      <noscript>
        <div className="sr-only p-4">
          <h2>All Google Summer of Code organizations</h2>
          <ul>
            {organizations.map((org) => (
              <li key={org.slug}>
                <Link href={`/gsoc/${org.slug}`}>
                  {org.name} ({org.projectCount} projects, {org.firstYear} to {org.latestYear})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
