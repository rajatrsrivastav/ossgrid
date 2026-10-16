import calendar from "./program-calendar.json";
import type { ProgramId } from "./programs";

/** Per-program content for the landing playbook switcher. Every limit carries its source. */
export interface PlaybookProgram {
  id: ProgramId;
  label: string;
  browseHref: string;
  activeHref: (year: number) => string;
  phase3: {
    body: string;
    tip: string;
    checklist: string[];
    cta: { label: string; href: string };
  };
  limits: { text: string; sourceUrl: string }[];
}

export const PLAYBOOK: PlaybookProgram[] = [
  {
    id: "gsoc",
    label: "GSoC",
    browseHref: "/gsoc",
    activeHref: (year) => `/gsoc?years=${year}`,
    phase3: {
      body: "Apply on the official GSoC site during the contributor application window in March. Mentors look for a clear problem statement, a week-by-week plan with deliverables they can check, links to your merged work in their repo, and how you will communicate. You can submit up to three proposals, and only one can be accepted.",
      tip: "Pick one idea from the org's ideas list and discuss it in their chat before you write. Proposals that arrive cold rarely get in.",
      checklist: ["One idea from the ideas list, agreed with a mentor", "Weekly milestones for 12 weeks (or up to 22)", "Links to your merged pull requests"],
      cta: { label: "Open the GSoC site", href: calendar.gsoc.portalUrl },
    },
    limits: [
      { text: "Up to three proposals, only one accepted.", sourceUrl: "https://developers.google.com/open-source/gsoc/faq" },
      { text: "Projects run 8 to 22 weeks.", sourceUrl: "https://developers.google.com/open-source/gsoc/faq" },
    ],
  },
  {
    id: "lfx",
    label: "LFX",
    browseHref: "/lfx",
    activeHref: (year) => `/lfx?years=${year}`,
    phase3: {
      body: `Apply on the official LFX portal. Mentors look for a clear problem statement, a week-by-week plan with deliverables they can check, links to your merged work in their repo, and how you will communicate. You can submit up to ${calendar.lfx.applicationsPerTerm} applications per term.`,
      tip: "Reviewers notice communication, testing and reliability over months. Pull request count on its own is not a signal.",
      checklist: [`Weekly milestones for ${calendar.lfx.durationWeeks.fullTime} weeks`, "Links to your merged pull requests", "Your availability and timezone"],
      cta: { label: "Open the LFX portal", href: calendar.lfx.portalUrl },
    },
    limits: [
      { text: `Up to ${calendar.lfx.applicationsPerTerm} applications per term; you can only join one project.`, sourceUrl: calendar.lfx.docsUrl },
      { text: `Full-time terms are ${calendar.lfx.durationWeeks.fullTime} weeks, part-time ${calendar.lfx.durationWeeks.partTime}.`, sourceUrl: calendar.lfx.docsUrl },
    ],
  },
];
