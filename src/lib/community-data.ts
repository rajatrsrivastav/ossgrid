import { ANNOUNCEMENTS } from "@/data/community/announcements";
import { MEMBERS } from "@/data/community/members";
import { COMMUNITY_OVERVIEW } from "@/data/community/overview";
import { PARTNERS } from "@/data/community/partners";
import { getAllEvents } from "@/lib/events-data";
import type { Announcement, CommunityMember, CommunityOverview, Partner } from "@/lib/community-types";

export function getCommunityOverview(): CommunityOverview {
  return COMMUNITY_OVERVIEW;
}

export function getAllMembers(): CommunityMember[] {
  return [...MEMBERS].sort((a, b) => a.name.localeCompare(b.name));
}

export function getMemberBySlug(slug: string): CommunityMember | undefined {
  return MEMBERS.find((m) => m.slug === slug);
}

export function getPartnersByIds(ids: string[]): Partner[] {
  const byId = new Map(PARTNERS.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Partner => Boolean(p));
}

export function getAllPartners(): Partner[] {
  return [...PARTNERS];
}

export function getCommunityAnnouncements(): Announcement[] {
  return ANNOUNCEMENTS.filter((a) => a.scope === "community").sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getUpcomingEventsForCommunity() {
  return getAllEvents().filter((e) => e.status === "upcoming" || e.status === "live");
}

export function partnerRoleLabel(role: Partner["role"]): string {
  if (role === "organiser") return "Organiser";
  if (role === "co-organiser") return "Co-organiser";
  if (role === "community") return "Community partner";
  return "Sponsor";
}
