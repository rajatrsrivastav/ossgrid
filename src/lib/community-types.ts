/** Types for the static community and events layer (Phase A). */

export type PartnerRole = "organiser" | "co-organiser" | "community" | "sponsor";

export type EventStatus = "upcoming" | "live" | "past";

export interface Partner {
  id: string;
  name: string;
  role: PartnerRole;
  url?: string;
  logo?: string;
  blurb?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Announcement {
  id: string;
  /** `"community"` for hub-wide posts; otherwise an event slug. */
  scope: "community" | string;
  title: string;
  body: string;
  publishedAt: string;
  author: string;
}

export interface TimelineItem {
  id: string;
  label: string;
  start: string;
  end?: string;
  description?: string;
  /** When true, dates are not final. */
  tentative?: boolean;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  time?: string;
  host?: string;
  description?: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface Prize {
  id: string;
  place: string;
  reward: string;
  notes?: string;
}

export interface Event {
  slug: string;
  title: string;
  shortTitle: string;
  status: EventStatus;
  /** When false, the event stays in seed data but is hidden from public routes. */
  published: boolean;
  summary: string;
  overview: string;
  /** ISO date used for sorting and status display. */
  startDate: string;
  endDate: string;
  format: "online" | "hybrid" | "onsite";
  venueNotes?: string;
  registrationUrl?: string | null;
  buildOn?: {
    name: string;
    url: string;
    notes?: string;
  };
  bonuses?: { id: string; label: string; description: string }[];
  partners: Partner[];
  timeline: TimelineItem[];
  sessions: Session[];
  tracks: Track[];
  prizes: Prize[];
  rewardPoolNotes?: string;
  rules: string[];
  judging: string[];
  faq: FaqItem[];
  announcementIds: string[];
}

export interface CommunityMember {
  slug: string;
  name: string;
  avatarUrl?: string;
  github?: string;
  skills: string[];
  bio: string;
  projects: { name: string; url?: string }[];
  eventsJoined: string[];
}

export interface CommunityOverview {
  tagline: string;
  about: string[];
  memberCountLabel: string;
  activeMembersLabel: string;
  partnerIds: string[];
}
