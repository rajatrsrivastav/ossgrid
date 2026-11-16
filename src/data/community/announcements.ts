import type { Announcement } from "@/lib/community-types";

/** Official announcements. One source of truth for community and per-event posts. */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "eagle-2026-announced",
    scope: "community",
    title: "OSS Grid × Eagle Buildathon is open for interest",
    body: "Learning week runs 30 November to 4 December 2026 online with the Eagle team. Build weekend is 5–6 December 2026 (tentative). Every team builds on EAGLE-4. Registration details will be posted in official announcements.",
    publishedAt: "2026-11-16",
    author: "OSS Grid organisers",
  },
  {
    id: "eagle-2026-build-target",
    scope: "eagle-buildathon-2026",
    title: "Build target: EAGLE-4",
    body: "All teams build on EAGLE-4 (https://github.com/eagle-hq/EAGLE-4). An optional bonus is available for deploying a Hugging Face Space. Full rules and judging criteria are on the event page.",
    publishedAt: "2026-11-16",
    author: "OSS Grid organisers",
  },
  {
    id: "eagle-2026-venue",
    scope: "eagle-buildathon-2026",
    title: "Format: online, with a proposed onsite component",
    body: "The event is online. An onsite component at NST, Rishihood University campus is proposed but not confirmed. We will update this announcement when the venue decision is final.",
    publishedAt: "2026-11-16",
    author: "OSS Grid organisers",
  },
];
