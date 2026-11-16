import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import EventDetail from "@/components/events/EventDetail";
import { getAllEvents, getEventAnnouncements, getEventBySlug, formatEventDateRange } from "@/lib/events-data";
import { safeJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const announcements = getEventAnnouncements(event);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
      { "@type": "ListItem", position: 2, name: "Events", item: "https://www.ossgrid.tech/events" },
      {
        "@type": "ListItem",
        position: 3,
        name: event.shortTitle,
        item: `https://www.ossgrid.tech/events/${event.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <PageMasthead
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/events" },
            { label: event.shortTitle },
          ]}
          label="Event"
          title={event.title}
          lede={<p>{event.summary}</p>}
          aside={
            <dl className="space-y-3 text-sm sm:min-w-[220px]">
              <div>
                <dt className="text-[var(--cine-fg-3)]">Dates</dt>
                <dd className="mt-1 text-[var(--cine-fg-2)]">
                  {formatEventDateRange(event.startDate, event.endDate)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--cine-fg-3)]">Format</dt>
                <dd className="mt-1 capitalize text-[var(--cine-fg-2)]">{event.format}</dd>
              </div>
            </dl>
          }
        >
          <div className="flex flex-wrap gap-3">
            <a href="#register" className="btn btn-primary">
              Registration
            </a>
            {event.buildOn && (
              <a
                href={event.buildOn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                EAGLE-4 on GitHub
              </a>
            )}
          </div>
        </PageMasthead>
        <EventDetail event={event} announcements={announcements} />
      </main>
    </>
  );
}
