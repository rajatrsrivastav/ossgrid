import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AnnouncementsFeed from "@/components/community/AnnouncementsFeed";
import DiscloseFaq from "@/components/community/DiscloseFaq";
import EventSectionReveal from "@/components/events/EventSectionReveal";
import EventStatusPill from "@/components/events/EventStatusPill";
import { partnerRoleLabel } from "@/lib/community-data";
import type { Announcement, Event } from "@/lib/community-types";
import { formatEventDateRange } from "@/lib/events-data";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "sessions", label: "Learning week" },
  { id: "tracks", label: "Tracks" },
  { id: "prizes", label: "Prizes" },
  { id: "rules", label: "Rules" },
  { id: "judging", label: "Judging" },
  { id: "partners", label: "Partners" },
  { id: "announcements", label: "Announcements" },
  { id: "faq", label: "FAQ" },
  { id: "register", label: "Registration" },
] as const;

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="display scroll-mt-24 text-2xl font-semibold text-[var(--text-primary)] md:text-3xl">
      {children}
    </h2>
  );
}

interface EventDetailProps {
  event: Event;
  announcements: Announcement[];
}

export default function EventDetail({ event, announcements }: EventDetailProps) {
  return (
    <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <nav aria-label="On this page" className="mb-10 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="chip text-xs hover:bg-[var(--bg-card-hover)]">
            {s.label}
          </a>
        ))}
      </nav>

      <EventSectionReveal>
        <section aria-labelledby="overview" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {(event.status === "live" || event.status === "past") && (
              <EventStatusPill status={event.status} />
            )}
            <span className="num text-sm text-[var(--text-muted)]">
              {formatEventDateRange(event.startDate, event.endDate)}
            </span>
            <span className="chip text-xs">{event.format}</span>
          </div>
          <SectionTitle id="overview">Overview</SectionTitle>
          <p className="prose-measure text-base leading-relaxed text-[var(--text-secondary)]">{event.overview}</p>
          {event.venueNotes && (
            <p className="text-sm text-[var(--text-muted)]">{event.venueNotes}</p>
          )}
          {event.buildOn && (
            <div className="card p-5">
              <p className="eyebrow mb-2">Build on</p>
              <a
                href={event.buildOn.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-base font-semibold text-[var(--text-primary)] underline-offset-4 hover:underline"
              >
                {event.buildOn.name}
                <ExternalLink className="h-4 w-4" aria-hidden />
                <span className="sr-only">(opens on GitHub)</span>
              </a>
              {event.buildOn.notes && (
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{event.buildOn.notes}</p>
              )}
            </div>
          )}
          {event.bonuses && event.bonuses.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {event.bonuses.map((b) => (
                <li key={b.id} className="card p-5">
                  <p className="font-semibold text-[var(--text-primary)]">{b.label}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{b.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14" delay={0.05}>
        <section aria-labelledby="schedule" className="space-y-4">
          <SectionTitle id="schedule">Schedule</SectionTitle>
          <ol className="space-y-3">
            {event.timeline.map((item) => (
              <li key={item.id} className="card p-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-semibold text-[var(--text-primary)]">{item.label}</p>
                  {item.tentative && <span className="pill text-xs text-[var(--warning)]">Tentative</span>}
                </div>
                <p className="num mt-1 text-xs text-[var(--text-muted)]">
                  {formatEventDateRange(item.start, item.end)}
                </p>
                {item.description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.description}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14" delay={0.05}>
        <section aria-labelledby="sessions" className="space-y-4">
          <SectionTitle id="sessions">Learning week sessions</SectionTitle>
          <ol className="grid gap-3 md:grid-cols-2">
            {event.sessions.map((session) => (
              <li key={session.id} className="card p-5">
                <p className="num text-xs text-[var(--text-muted)]">
                  {formatEventDateRange(session.date)}
                  {session.time ? ` · ${session.time}` : ""}
                </p>
                <p className="mt-2 font-semibold text-[var(--text-primary)]">{session.title}</p>
                {session.host && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{session.host}</p>
                )}
                {session.description && (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{session.description}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="tracks" className="space-y-4">
          <SectionTitle id="tracks">Tracks</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {event.tracks.map((track) => (
              <li key={track.id} className="card p-5">
                <p className="font-semibold text-[var(--text-primary)]">{track.name}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{track.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="prizes" className="space-y-4">
          <SectionTitle id="prizes">Prizes and reward pool</SectionTitle>
          {event.rewardPoolNotes && (
            <p className="text-sm text-[var(--text-secondary)]">{event.rewardPoolNotes}</p>
          )}
          <ul className="space-y-3">
            {event.prizes.map((prize) => (
              <li key={prize.id} className="card p-5">
                <p className="font-semibold text-[var(--text-primary)]">{prize.place}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{prize.reward}</p>
                {prize.notes && <p className="mt-2 text-xs text-[var(--text-muted)]">{prize.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="rules" className="space-y-4">
          <SectionTitle id="rules">Rules</SectionTitle>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
            {event.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="judging" className="space-y-4">
          <SectionTitle id="judging">Judging criteria</SectionTitle>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
            {event.judging.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="partners" className="space-y-4">
          <SectionTitle id="partners">Partners</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {event.partners.map((partner) => (
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
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="announcements" className="space-y-4">
          <SectionTitle id="announcements">Announcements</SectionTitle>
          <AnnouncementsFeed items={announcements} />
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section aria-labelledby="faq" className="space-y-4">
          <SectionTitle id="faq">FAQ</SectionTitle>
          <DiscloseFaq items={event.faq} idPrefix={`event-${event.slug}-faq`} />
        </section>
      </EventSectionReveal>

      <EventSectionReveal className="mt-14">
        <section id="register" aria-labelledby="register-title" className="panel space-y-4 p-5 sm:p-6">
          <h2 id="register-title" className="text-xl font-semibold text-[var(--text-primary)]">
            Registration
          </h2>
          {event.registrationUrl ? (
            <a href={event.registrationUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Register for {event.shortTitle}
            </a>
          ) : (
            <div className="flex flex-wrap gap-3">
              <a href="#announcements" className="btn btn-secondary">
                Read announcements
              </a>
              <Link href="/community" className="btn btn-ghost">
                Community hub
              </Link>
            </div>
          )}
        </section>
      </EventSectionReveal>
    </div>
  );
}
