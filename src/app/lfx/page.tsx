import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Organization } from "@/lib/types";
import LfxClient from "@/components/lfx/LfxClient";

export const metadata: Metadata = {
  title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
  description:
    "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
  alternates: {
    canonical: "https://www.ossgrid.tech/lfx",
  },
  openGraph: {
    title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
    description:
      "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
    url: "https://www.ossgrid.tech/lfx",
  },
  twitter: {
    card: "summary_large_image",
    title: "LFX Mentorship Explorer — 100+ Linux Foundation & CNCF Organizations",
    description:
      "Explore 950+ open-source mentorship projects, skills, mentors, and stipend details across 100+ organizations in the Linux Foundation (LFX) Mentorship program.",
  },
};

function getOrganizations(): Organization[] {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (err) {
    console.error("Error reading organizations.json:", err);
  }
  return [];
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
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
