import type { CommunityMember } from "@/lib/community-types";

/**
 * Curated community profiles for Phase A.
 * Replace or extend with real people as they opt in; do not invent private details.
 */
export const MEMBERS: CommunityMember[] = [
  {
    slug: "rajat-srivastav",
    name: "Rajat Srivastav",
    avatarUrl: "https://github.com/rajatrsrivastav.png?size=128",
    github: "rajatrsrivastav",
    skills: ["open source", "mentorship programs", "Next.js"],
    bio: "Builds OSS Grid and organises community events.",
    projects: [{ name: "OSS Grid", url: "https://github.com/rajatrsrivastav/ossgrid" }],
    eventsJoined: ["eagle-buildathon-2026"],
  },
];
