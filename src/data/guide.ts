/**
 * Content for /guide. Adapted, in our own words, from Ashutosh's post
 * "You Are Not Ready for Open Source Just Because You Want to Start"
 * (https://www.ashutoshx7.me/blogs/ready-for-open-source), with his permission to link and credit.
 */
import { PROGRAMS, type ProgramId } from "./programs";
import calendar from "./program-calendar.json";

export const GUIDE_SOURCE = {
  author: "Ashutosh",
  title: "You Are Not Ready for Open Source Just Because You Want to Start",
  url: "https://www.ashutoshx7.me/blogs/ready-for-open-source",
};

export const READINESS = [
  {
    title: "Fundamentals take months, not days",
    body: "Before any repo, know how a real application hangs together: how data moves between frontend and backend, how a project is laid out, how APIs, databases, auth, state and deployment fit. Once that is solid, a codebase reads as a system instead of a pile of files.",
  },
  {
    title: "Build one real project",
    body: "Something with real parts: a typed frontend, auth, a database, deployment, actual user flows. Complex enough that a reviewer would not dismiss it as tutorial code. One is enough; ten toy apps are not.",
  },
  {
    title: "Do a shadow build",
    body: "Clone a good tutorial project, understand each design decision, then build a different product next to it using what you learned. Clone, understand, translate, build your own. The goal is to be able to transfer decisions to new problems.",
  },
  {
    title: "AI makes code cheap, not judgment",
    body: "Generated code does not know what should exist, how a system should be designed, or when not to build something. Fundamentals are the base; tools amplify what you already understand.",
  },
];

export const COMMUNITY_FIRST = [
  "Find the project's channel before you look for an issue: Discord, Slack, Element, a mailing list or GitHub Discussions.",
  "Watch which mentors are active, which projects get discussion, whether pull requests get reviewed and whether maintainers reply.",
  "Pick an active project with present people over a quiet repo that merely looks easy.",
  "Get the project running locally. Broken dependencies, stale docs and OS differences are normal friction, not a sign you are unfit.",
  "Trace one feature end to end and write yourself a map of the architecture. Verify it against the code; treat it as a map, not as truth.",
];

/** The contribution loop, as a checklist. */
export const LOOP_STEPS = [
  "Join the community",
  "Observe the project for a while",
  "Find active mentors",
  "Pick an active repo",
  "Clone it locally",
  "Set it up and get it running",
  "Map the architecture and one feature end to end",
  "Find a real issue",
  "Reproduce it before you trust it",
  "Study only what the issue demands",
  "Fix it",
  "Test it on every platform the project targets",
  "Open the pull request with a clear description",
  "Discuss the review without ego",
  "Make mistakes",
  "Learn from them",
  "Improve the change",
  "Repeat",
];

export const ISSUE_ADVICE = [
  "Many strong projects never label good-first-issues. That is not a signal to leave.",
  "Issues opened by mentors or maintainers are usually worth attention.",
  "Verify every issue before you work on it. Some no longer exist, some were fixed indirectly, some were misunderstood, some are too vague to act on.",
  "Learn only what the issue requires: one API, one component, one data flow. Read docs, old pull requests and similar code; ask mentors after you have done your own research. The understanding compounds.",
];

export const PR_CONVERSATIONS = [
  {
    repo: "laurent22/joplin",
    number: 15013,
    url: "https://github.com/laurent22/joplin/pull/15013",
    title: "Add a global shortcut to show and hide Joplin",
    lesson: "A feature that worked on Windows, macOS and X11 failed on Wayland. The thread walks through Electron, desktop portals and GNOME versions, a mentor's suggestion to scope the feature, and a maintainer's push to understand the platform properly. Admitting a gap, testing again and reporting back earned more trust than confidence would have.",
  },
  {
    repo: "laurent22/joplin",
    number: 14582,
    url: "https://github.com/laurent22/joplin/pull/14582",
    title: "Include notebook icons in frontmatter export",
    lesson: "A feature request with tradeoffs. Reviewers asked to keep unrelated code untouched, to explain a design choice and to support custom icons; the author moved the data into a per-folder file and it merged.",
  },
  {
    repo: "laurent22/joplin",
    number: 14443,
    url: "https://github.com/laurent22/joplin/pull/14443",
    title: "Add editor and sync target to the about dialog",
    lesson: "Check your diff before asking for review. Format-on-save added unrelated changes to a test file and the maintainer asked for them to go.",
  },
  {
    repo: "sugarlabs/musicblocks",
    number: 6062,
    url: "https://github.com/sugarlabs/musicblocks/pull/6062",
    title: "Enforce pull request categories with auto-labelling",
    lesson: "Tested in a fork across several trial pull requests before review, with the results written up. Clear testing is what made it quick to merge.",
  },
];

export const SELECTION_SIGNALS = [
  "Communication: do you reply, and do you say what you do not know?",
  "Showing up: meetings, chat, the review thread.",
  "Understanding the project, not just the file you touched.",
  "Testing properly, on the platforms the project cares about.",
  "Learning when stuck, and accepting review without ego.",
  "Reliability over months. A few well-communicated pull requests beat many isolated ones.",
];

export interface ProgramChecklist {
  id: ProgramId;
  items: string[];
  sourceUrl: string;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Per-program checklists. Live programs get the full list; coming-soon programs a short one plus the official link. */
export const PROGRAM_CHECKLISTS: ProgramChecklist[] = PROGRAMS.map((p) => {
  if (p.id === "gsoc") {
    return {
      id: p.id,
      items: [
        `Confirm eligibility: ${p.facts.eligibility.value}.`,
        `Shortlist orgs in ${calendar.gsoc.phases.find((x) => x.id === "announce")?.when ?? "February"}, when accepted organizations are announced. Prefer orgs that have come back for years.`,
        "Read the org's ideas list and the last two years of accepted projects on OSSGrid.",
        "Land at least one merged fix in the repo before applications open.",
        "Write one proposal per idea you have discussed with a mentor; up to three total, only one can be accepted.",
        `Pick a project size you can deliver: ${calendar.gsoc.projectSizes.map((s) => `${s.label.toLowerCase()} ~${s.hours} h`).join(", ")}. Stipends run ${usd(calendar.gsoc.stipend.minUsd)} to ${usd(calendar.gsoc.stipend.maxUsd)} by size and country.`,
        `Submit on the official site during the ${calendar.gsoc.phases.find((x) => x.id === "apply")?.when ?? "March"} window, then keep contributing while you wait.`,
      ],
      sourceUrl: "https://developers.google.com/open-source/gsoc/faq",
    };
  }
  if (p.id === "lfx") {
    return {
      id: p.id,
      items: [
        `Confirm eligibility: ${p.facts.eligibility.value}.`,
        `Pick a term: ${p.facts.cadence.value.toLowerCase()}. Projects appear on the portal a few weeks before each term starts.`,
        "Read the org's past terms on OSSGrid: mentors who keep showing up are a good sign.",
        "Join the project's Slack channel and reproduce one open issue before you apply.",
        `Apply to at most ${calendar.lfx.applicationsPerTerm} projects per term; you can only join one.`,
        `Plan for ${calendar.lfx.durationWeeks.fullTime} weeks full time or ${calendar.lfx.durationWeeks.partTime} part time. Stipends run ${usd(calendar.lfx.stipend.minUsd)} to ${usd(calendar.lfx.stipend.maxUsd)} by country.`,
        "Upload a resume and a cover letter that links your merged pull requests in that repo.",
      ],
      sourceUrl: calendar.lfx.docsUrl,
    };
  }
  return {
    id: p.id,
    items: [
      `Check eligibility on the official site: ${p.facts.eligibility.value}.`,
      `Note the cadence: ${p.facts.cadence.value}.`,
      "Join the project's community and land one merged change before the window opens.",
      "Follow the OSSGrid tracking issue for the dashboard.",
    ],
    sourceUrl: p.officialUrl,
  };
});

export const RESOURCES = [
  { name: "cncf/mentoring", url: "https://github.com/cncf/mentoring", why: "Source of truth for LFX and CNCF GSoC project lists." },
  { name: "nishantwrp/gsoc-organizations", url: "https://github.com/nishantwrp/gsoc-organizations", why: "The code behind gsocorganizations.dev, where the GSoC org data comes from." },
  { name: "numfocus/gsoc", url: "https://github.com/numfocus/gsoc", why: "How a large umbrella org runs its ideas lists and expectations." },
  { name: "sks444/awesome-gsoc-prepration", url: "https://github.com/sks444/awesome-gsoc-prepration", why: "A long list of past proposals and preparation notes." },
  { name: "deepanshu1422/List-Of-Open-Source-Internships-Programs", url: "https://github.com/deepanshu1422/List-Of-Open-Source-Internships-Programs", why: "Programs beyond the ones indexed here." },
  { name: "yashisrani/List-of-OpenSource-Programs", url: "https://github.com/yashisrani/List-of-OpenSource-Programs", why: "Another maintained list of programs with dates." },
];
