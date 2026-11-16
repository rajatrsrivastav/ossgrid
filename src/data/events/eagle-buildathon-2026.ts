import type { Event } from "@/lib/community-types";
import { PARTNERS } from "@/data/community/partners";

const partnerById = (id: string) => {
  const p = PARTNERS.find((x) => x.id === id);
  if (!p) throw new Error(`Missing partner: ${id}`);
  return p;
};

/** First seeded event: OSS Grid × Eagle Buildathon. */
export const EAGLE_BUILDATHON_2026: Event = {
  slug: "eagle-buildathon-2026",
  title: "OSS Grid × Eagle Buildathon",
  shortTitle: "Eagle Buildathon",
  status: "upcoming",
  summary:
    "Learning week with the Eagle team, then a build weekend on EAGLE-4. Online, with a proposed onsite component at NST.",
  overview:
    "OSS Grid and partners host a buildathon centred on EAGLE-4. The week of 30 November to 4 December 2026 is online learning sessions led by the Eagle team. The build weekend is 5–6 December 2026 (tentative). Every team builds on EAGLE-4. An optional bonus is available for deploying a Hugging Face Space. An onsite component at NST, Rishihood University campus is proposed but not confirmed.",
  startDate: "2026-11-30",
  endDate: "2026-12-06",
  format: "hybrid",
  venueNotes:
    "Primary format is online. Onsite component at NST, Rishihood University campus is proposed and not confirmed.",
  registrationUrl: null,
  buildOn: {
    name: "EAGLE-4",
    url: "https://github.com/eagle-hq/EAGLE-4",
    notes: "Every team builds on this repository.",
  },
  bonuses: [
    {
      id: "hf-space",
      label: "Hugging Face Space",
      description: "Optional bonus for deploying a Hugging Face Space alongside your submission.",
    },
  ],
  partners: [
    partnerById("oss-grid"),
    partnerById("devclub-nst"),
    partnerById("oss-connect"),
    partnerById("eagle"),
  ],
  timeline: [
    {
      id: "learning-week",
      label: "Learning week",
      start: "2026-11-30",
      end: "2026-12-04",
      description: "Online sessions by the Eagle team.",
    },
    {
      id: "build-weekend",
      label: "Build weekend",
      start: "2026-12-05",
      end: "2026-12-06",
      description: "Teams build and submit on EAGLE-4.",
      tentative: true,
    },
  ],
  sessions: [
    {
      id: "lw-overview",
      title: "EAGLE-4 overview",
      date: "2026-11-30",
      host: "Eagle team",
      description: "Orientation and how the buildathon uses EAGLE-4. Exact time to be announced.",
    },
    {
      id: "lw-build",
      title: "Building with EAGLE-4",
      date: "2026-12-01",
      host: "Eagle team",
      description: "Hands-on session. Exact time to be announced.",
    },
    {
      id: "lw-deploy",
      title: "Deployment and Hugging Face Spaces",
      date: "2026-12-02",
      host: "Eagle team",
      description: "Optional path for the Hugging Face Space bonus. Exact time to be announced.",
    },
    {
      id: "lw-office-hours",
      title: "Office hours",
      date: "2026-12-03",
      host: "Eagle team",
      description: "Q&A before the build weekend. Exact time to be announced.",
    },
    {
      id: "lw-kickoff",
      title: "Build weekend kickoff briefing",
      date: "2026-12-04",
      host: "OSS Grid + Eagle",
      description: "Rules recap, submission checklist, and logistics. Exact time to be announced.",
    },
  ],
  tracks: [
    {
      id: "eagle-4",
      name: "EAGLE-4",
      description: "Single track for this edition: every team builds on EAGLE-4.",
    },
  ],
  prizes: [
    {
      id: "tbd",
      place: "To be announced",
      reward: "Prize and reward pool details will be posted in official announcements.",
    },
  ],
  rewardPoolNotes: "Prize amounts and the full reward pool will be published before registration opens.",
  rules: [
    "Teams must build on EAGLE-4 (https://github.com/eagle-hq/EAGLE-4).",
    "Participation may be individual or as a team once registration opens.",
    "Submissions will require a repository link, a demo link, a short description, and an optional Hugging Face Space link.",
    "Official information (rules, FAQ, announcements) is only what appears on this event page and in the announcements feed.",
    "Follow the code of conduct of OSS Grid and partner communities.",
  ],
  judging: [
    "Judging criteria will be published before the build weekend.",
    "Expect evaluation of technical use of EAGLE-4, clarity of the demo, and documentation quality.",
    "The optional Hugging Face Space bonus is scored separately from the core submission when announced.",
  ],
  faq: [
    {
      question: "When is the event?",
      answer:
        "Learning week is 30 November to 4 December 2026 (online). Build weekend is 5–6 December 2026 and is marked tentative until confirmed.",
    },
    {
      question: "Is it online or onsite?",
      answer:
        "It is online. An onsite component at NST, Rishihood University campus is proposed but not confirmed.",
    },
    {
      question: "What do we build on?",
      answer: "Every team builds on EAGLE-4: https://github.com/eagle-hq/EAGLE-4.",
    },
    {
      question: "How do I register?",
      answer:
        "Registration is not open yet on this site. Watch the announcements on this page. Interactive sign-up, teams, and submissions are planned for a later phase.",
    },
    {
      question: "Is there a Hugging Face bonus?",
      answer: "Yes. Deploying a Hugging Face Space is an optional bonus when submissions open.",
    },
  ],
  announcementIds: ["eagle-2026-build-target", "eagle-2026-venue"],
};
