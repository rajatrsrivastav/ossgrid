import type { Metadata } from "next";
import ProposalsClient from "@/components/proposals/ProposalsClient";
import { safeJsonLd } from "@/lib/seo";
import { getProposals, getProposalStats } from "@/lib/proposals-data";
import { getGsocOrganizations } from "@/lib/gsoc-data";
import { roundedPlus } from "@/lib/stats";

const stats = getProposalStats();
const title = `GSoC proposals library — ${roundedPlus(stats.count)} public proposals from ${stats.orgCount} organizations`;
const description = `Read ${roundedPlus(stats.count)} publicly shared Google Summer of Code proposals, accepted and otherwise, indexed from ${stats.repos} community archives and linked to the original files. Filter by year, organization and status. Learn the structure; never copy.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://www.ossgrid.tech/proposals" },
  openGraph: { type: "website", siteName: "OSSGrid", title, description, url: "https://www.ossgrid.tech/proposals" },
  twitter: { card: "summary_large_image", title, description },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
    { "@type": "ListItem", position: 2, name: "GSoC proposals library", item: "https://www.ossgrid.tech/proposals" },
  ],
};

export default function ProposalsPage() {
  const proposals = getProposals();
  const orgNames = Object.fromEntries(getGsocOrganizations().map((o) => [o.slug, o.name]));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <ProposalsClient proposals={proposals} orgNames={orgNames} />
      <noscript>
        <div className="sr-only p-4">
          <h2>All indexed proposals</h2>
          <ul>
            {proposals.map((p) => (
              <li key={p.id}><a href={p.url}>{p.title} ({p.orgName || "unknown org"}, {p.year ?? "year unknown"}, {p.status})</a></li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
