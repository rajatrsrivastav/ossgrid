import Link from "next/link";
import type { Event } from "@/lib/community-types";
import { formatEventDateRange } from "@/lib/events-data";
import EventStatusPill from "./EventStatusPill";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group flex flex-col p-5 transition-colors duration-200 hover:bg-[var(--bg-card-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        {(event.status === "live" || event.status === "past") && (
          <EventStatusPill status={event.status} />
        )}
        <span className="num text-xs text-[var(--text-muted)]">
          {formatEventDateRange(event.startDate, event.endDate)}
        </span>
      </div>
      <h2 className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{event.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
        {event.summary}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="chip">{event.format}</span>
        {event.partners.slice(0, 2).map((p) => (
          <span key={p.id} className="chip">
            {p.name}
          </span>
        ))}
        {event.partners.length > 2 && <span className="chip">+{event.partners.length - 2}</span>}
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--text-primary)] group-hover:underline group-hover:underline-offset-4">
        View details
      </p>
    </Link>
  );
}
