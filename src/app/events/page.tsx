import type { Metadata } from "next";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import EventCard from "@/components/events/EventCard";
import { getAllEvents } from "@/lib/events-data";
import { safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Events and hackathons",
  description:
    "OSS Grid community events and hackathons, including the Eagle Buildathon.",
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
            <dl className="grid grid-cols-1 gap-4 text-sm sm:min-w-[120px]">
              <div>
                <dt className="text-[var(--cine-fg-3)]">Listed</dt>
                <dd className="display mt-1 text-2xl text-[var(--cine-fg)]">{all.length}</dd>
              </div>
            </dl>
          }
        />
        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <section aria-labelledby="events-all">
            <h2 id="events-all" className="display text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
              Events
            </h2>
            {all.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--text-secondary)]">No events listed yet.</p>
            ) : (
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {all.map((event) => (
                  <li key={event.slug}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
