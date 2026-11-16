import type { Metadata } from "next";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import EventCard from "@/components/events/EventCard";
import { getAllEvents, getEventsByStatus } from "@/lib/events-data";
import { safeJsonLd } from "@/lib/seo";
import type { EventStatus } from "@/lib/community-types";

export const metadata: Metadata = {
  title: "Events and hackathons",
  description:
    "Upcoming, live, and past OSS Grid community events and hackathons, including the Eagle Buildathon.",
  alternates: { canonical: "/events" },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
    { "@type": "ListItem", position: 2, name: "Events", item: "https://www.ossgrid.tech/events" },
  ],
};

const GROUPS: { status: EventStatus; title: string; empty: string }[] = [
  { status: "live", title: "Live now", empty: "No events are live right now." },
  { status: "upcoming", title: "Upcoming", empty: "No upcoming events yet." },
  { status: "past", title: "Past", empty: "No past events listed yet." },
];

export default function EventsPage() {
  const all = getAllEvents();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <PageMasthead
          crumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
          label="Events"
          title="Community events and hackathons"
          lede={
            <p>
              Official OSS Grid events. Listings and details come from curated data so every participant sees the same schedule, rules, and announcements.
            </p>
          }
          aside={
            <dl className="grid grid-cols-2 gap-4 text-sm sm:min-w-[200px]">
              <div>
                <dt className="text-[var(--cine-fg-3)]">Listed</dt>
                <dd className="display mt-1 text-2xl text-[var(--cine-fg)]">{all.length}</dd>
              </div>
              <div>
                <dt className="text-[var(--cine-fg-3)]">Upcoming</dt>
                <dd className="display mt-1 text-2xl text-[var(--cine-fg)]">
                  {getEventsByStatus("upcoming").length}
                </dd>
              </div>
            </dl>
          }
        />
        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
          {GROUPS.map((group) => {
            const events = getEventsByStatus(group.status);
            return (
              <section key={group.status} aria-labelledby={`events-${group.status}`} className="mb-12 last:mb-0">
                <h2
                  id={`events-${group.status}`}
                  className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl"
                >
                  {group.title}
                </h2>
                {events.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">{group.empty}</p>
                ) : (
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">
                    {events.map((event) => (
                      <li key={event.slug}>
                        <EventCard event={event} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
