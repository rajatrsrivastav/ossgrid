import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Organization, LfxOrganizationDto } from "@/lib/types";
import LfxClient from "@/components/lfx/LfxClient";
import { safeJsonLd, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
  description:
    "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
  alternates: {
    canonical: "https://www.ossgrid.tech/lfx",
  },
  openGraph: {
    type: "website",
    siteName: "OSSGrid",
    title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
    description:
      "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
    url: "https://www.ossgrid.tech/lfx",
    images: [
      {
        ...DEFAULT_OG_IMAGE,
        alt: "OSSGrid LFX Mentorship Explorer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
    description:
      "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
    images: ["/og-image.jpg"],
  },
};

function getOrganizations(): LfxOrganizationDto[] {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Failed to load organizations: ${filePath} does not exist.`);
  }
  const raw: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return raw.map((org) => ({
    id: org.id,
    name: org.name,
    logoUrl: org.logoUrl,
    description: org.description,
    foundation: org.foundation,
    website: org.website,
    github: org.github,
    category: org.category,
    terms: org.terms,
    years: org.years,
    technologies: org.technologies,
    projectCount: org.projectCount,
    projects: org.projects.map((p) => ({
      title: p.title,
      year: p.year,
      mentors: p.mentors?.map((m) => ({ name: m.name })),
    })),
  }));
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.ossgrid.tech",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "LFX Mentorship Explorer",
      item: "https://www.ossgrid.tech/lfx",
    },
  ],
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://www.ossgrid.tech/lfx#collection",
  url: "https://www.ossgrid.tech/lfx",
  name: "LFX Mentorship Explorer",
  description:
    "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://www.ossgrid.tech/#website",
    name: "OSSGrid",
    url: "https://www.ossgrid.tech",
  },
};

export default function LfxPage() {
  const organizations = getOrganizations();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <LfxClient initialOrganizations={organizations} />

      {/* Static crawler index for search engines without JavaScript */}
      <noscript>
        <div className="sr-only p-4">
          <h2>All Linux Foundation & CNCF Mentorship Organizations</h2>
          <ul>
            {organizations.map((org) => (
              <li key={org.id}>
                <Link href={`/organization/${org.id}`}>
                  {org.name} ({org.projectCount} projects) - {org.description}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
