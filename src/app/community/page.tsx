import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import AnnouncementsFeed from "@/components/community/AnnouncementsFeed";
import MemberCard from "@/components/community/MemberCard";
import EventCard from "@/components/events/EventCard";
import {
  getAllMembers,
  getCommunityAnnouncements,
  getCommunityOverview,
  getPartnersByIds,
  getUpcomingEventsForCommunity,
  partnerRoleLabel,
} from "@/lib/community-data";
import { safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Community",
  description:
    "OSS Grid community hub: what we are, partner communities, member profiles, announcements, and events.",
  alternates: { canonical: "/community" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
    { "@type": "ListItem", position: 2, name: "Community", item: "https://www.ossgrid.tech/community" },
  ],
};

export default function CommunityPage() {
  const overview = getCommunityOverview();
  const members = getAllMembers();
  const partners = getPartnersByIds(overview.partnerIds);
  const announcements = getCommunityAnnouncements();
  const upcoming = getUpcomingEventsForCommunity();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <PageMasthead
          crumbs={[{ label: "Home", href: "/" }, { label: "Community" }]}
          label="Community"
          title="OSS Grid community"
          lede={<p>{overview.tagline}</p>}
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="btn btn-primary">
              Browse events
            </Link>
            <Link href="/contribute" className="btn btn-secondary">
              Start contributing
            </Link>
          </div>
        </PageMasthead>

        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <section aria-labelledby="about" className="space-y-4">
            <h2 id="about" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              What OSS Grid is
            </h2>
            {overview.about.map((para) => (
              <p key={para} className="prose-measure text-base leading-relaxed text-[var(--text-secondary)]">
                {para}
              </p>
            ))}
          </section>

          <section aria-labelledby="partners" className="mt-14 space-y-4">
            <h2 id="partners" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Partner communities
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {partners.map((partner) => (
                <li key={partner.id} className="card p-5">
                  <p className="eyebrow mb-1">{partnerRoleLabel(partner.role)}</p>
                  {partner.url ? (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-primary)] underline-offset-4 hover:underline"
                    >
                      {partner.name}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <p className="font-semibold text-[var(--text-primary)]">{partner.name}</p>
                  )}
                  {partner.blurb && (
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{partner.blurb}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="events" className="mt-14 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="events" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
                Events
              </h2>
              <Link href="/events" className="text-sm font-medium text-[var(--text-primary)] underline-offset-4 hover:underline">
                All events
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No events listed yet.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {upcoming.map((event) => (
                  <li key={event.slug}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="members" className="mt-14 space-y-4">
            <h2 id="members" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Members
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <li key={member.slug}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="announcements" className="mt-14 space-y-4">
            <h2 id="announcements" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Announcements
            </h2>
            <AnnouncementsFeed items={announcements} />
          </section>
        </div>
      </main>
    </>
  );
}
