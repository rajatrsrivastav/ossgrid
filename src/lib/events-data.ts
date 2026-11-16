import { EVENTS } from "@/data/events";
import { ANNOUNCEMENTS } from "@/data/community/announcements";
import type { Announcement, Event, EventStatus } from "@/lib/community-types";

/** Public catalog only. Unpublished seeds stay in `src/data/events` until approved. */
export function getAllEvents(): Event[] {
  return EVENTS.filter((e) => e.published).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getEventBySlug(slug: string): Event | undefined {
  const event = EVENTS.find((e) => e.slug === slug);
  if (!event?.published) return undefined;
  return event;
}

export function getEventsByStatus(status: EventStatus): Event[] {
  return getAllEvents().filter((e) => e.status === status);
}

export function getEventAnnouncements(event: Event): Announcement[] {
  const byId = new Map(ANNOUNCEMENTS.map((a) => [a.id, a]));
  const fromIds = event.announcementIds
    .map((id) => byId.get(id))
    .filter((a): a is Announcement => Boolean(a));
  const scoped = ANNOUNCEMENTS.filter((a) => a.scope === event.slug);
  const seen = new Set<string>();
  const merged: Announcement[] = [];
  for (const a of [...fromIds, ...scoped]) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    merged.push(a);
  }
  return merged.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function formatEventDateRange(start: string, end?: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };
  const s = new Date(`${start}T00:00:00Z`).toLocaleDateString("en-US", opts);
  if (!end || end === start) return s;
  const e = new Date(`${end}T00:00:00Z`).toLocaleDateString("en-US", opts);
  return `${s} – ${e}`;
}

export function eventStatusLabel(status: EventStatus): string {
  if (status === "live") return "Live";
  if (status === "past") return "Past";
  return "Open";
}
