import calendar from "./program-calendar.json";

/**
 * Program registry: the single source of truth for every mentorship program OSSGrid covers.
 * Header, landing, footer, sitemap, search scope and JSON-LD all read from here. Flip `status`
 * to "live" (with a dashboardPath and a non-empty dataFile) and the site picks it up.
 *
 * Every fact carries the official page it was read from and the date it was checked.
 * `npm run audit:data` runs scripts/audit-programs.ts against this file.
 */

export type ProgramStatus = "live" | "coming-soon";

export interface ProgramFact {
  /** "$1,000 to $6,600". "See official site" when the value could not be verified. */
  value: string;
  /** Official page the value came from. */
  sourceUrl: string;
  /** YYYY-MM-DD */
  lastVerified: string;
}

export type ProgramId = "lfx" | "gsoc" | "outreachy" | "gssoc" | "mlh-fellowship" | "summer-of-bitcoin";

export interface Program {
  id: ProgramId;
  name: string;
  shortName: string;
  runBy: string;
  status: ProgramStatus;
  /** One plain sentence, no hype. */
  oneLiner: string;
  /** CSS variable with the program colour, e.g. "--program-gsoc". */
  accentVar: string;
  officialUrl: string;
  /** "/gsoc" when live. */
  dashboardPath?: string;
  /** Where to follow a coming-soon dashboard. */
  trackingIssueUrl?: string;
  facts: {
    stipend: ProgramFact;
    length: ProgramFact;
    eligibility: ProgramFact;
    cadence: ProgramFact;
  };
  /** Shown as attribution wherever this program's data appears. */
  dataSources: { label: string; url: string }[];
  /** "/data/gsoc/organizations.json" */
  dataFile?: string;
}

const REPO = "https://github.com/rajatrsrivastav/ossgrid";
const newProgramIssue = (name: string) => `${REPO}/issues/new?template=new_program.yml&title=${encodeURIComponent(`program: ${name} dashboard`)}`;
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const lfxCalendar = calendar.lfx;
export const gsocCalendar = calendar.gsoc;

export const PROGRAMS: Program[] = [
  {
    id: "gsoc",
    name: "Google Summer of Code",
    shortName: "GSoC",
    runBy: "Google",
    status: "live",
    oneLiner: "Google's yearly program that pays new contributors to work on an open-source project over the summer.",
    accentVar: "--program-gsoc",
    officialUrl: gsocCalendar.portalUrl,
    dashboardPath: "/gsoc",
    facts: {
      stipend: { value: `${usd(750)} to ${usd(6600)}`, sourceUrl: "https://developers.google.com/open-source/gsoc/help/student-stipends", lastVerified: "2026-10-17" },
      length: { value: "8 to 22 weeks", sourceUrl: "https://developers.google.com/open-source/gsoc/faq", lastVerified: "2026-10-17" },
      eligibility: { value: "18 or older; students or beginners to open source", sourceUrl: "https://developers.google.com/open-source/gsoc/faq", lastVerified: "2026-10-17" },
      cadence: { value: "Once a year; apply in March, code May to August", sourceUrl: "https://developers.google.com/open-source/gsoc/timeline", lastVerified: "2026-10-17" },
    },
    dataSources: [
      { label: "gsocorganizations.dev", url: "https://www.gsocorganizations.dev" },
      { label: "the GSoC archive", url: "https://summerofcode.withgoogle.com/archive" },
      { label: "cncf/mentoring", url: "https://github.com/cncf/mentoring/tree/main/programs/summerofcode" },
    ],
    dataFile: "/data/gsoc/organizations.json",
  },
  {
    id: "lfx",
    name: "LFX Mentorship",
    shortName: "LFX",
    runBy: "The Linux Foundation",
    status: "live",
    oneLiner: "Paid, remote mentorships on Linux Foundation and CNCF projects, three terms a year.",
    accentVar: "--program-lfx",
    officialUrl: lfxCalendar.portalUrl,
    dashboardPath: "/lfx",
    facts: {
      stipend: { value: `${usd(lfxCalendar.stipend.minUsd)} to ${usd(lfxCalendar.stipend.maxUsd)}`, sourceUrl: "https://docs.linuxfoundation.org/lfx/mentorship/mentee-stipends", lastVerified: "2026-10-17" },
      length: { value: `${lfxCalendar.durationWeeks.fullTime} or ${lfxCalendar.durationWeeks.partTime} weeks`, sourceUrl: lfxCalendar.docsUrl, lastVerified: lfxCalendar.lastVerified },
      eligibility: { value: "18 or older; not a past Linux Foundation mentee", sourceUrl: "https://docs.linuxfoundation.org/lfx/mentorship/mentee-guide/am-i-eligible", lastVerified: "2026-10-17" },
      cadence: { value: "Three terms a year: spring, summer and fall", sourceUrl: lfxCalendar.docsUrl, lastVerified: lfxCalendar.lastVerified },
    },
    dataSources: [{ label: "cncf/mentoring", url: "https://github.com/cncf/mentoring" }],
    dataFile: "/data/organizations.json",
  },
  {
    id: "outreachy",
    name: "Outreachy",
    shortName: "Outreachy",
    runBy: "Software Freedom Conservancy",
    status: "coming-soon",
    oneLiner: "Paid, remote internships for people underrepresented in their country's tech industry.",
    accentVar: "--program-outreachy",
    officialUrl: "https://www.outreachy.org",
    trackingIssueUrl: newProgramIssue("Outreachy"),
    facts: {
      stipend: { value: usd(7000), sourceUrl: "https://www.outreachy.org/docs/applicant/", lastVerified: "2026-10-17" },
      length: { value: "13 weeks, 30 hours a week", sourceUrl: "https://www.outreachy.org/docs/applicant/", lastVerified: "2026-10-17" },
      eligibility: { value: "18 or older; underrepresented in tech where you live", sourceUrl: "https://www.outreachy.org/docs/applicant/", lastVerified: "2026-10-17" },
      cadence: { value: "Two cohorts a year: May to August, December to March", sourceUrl: "https://www.outreachy.org/docs/applicant/", lastVerified: "2026-10-17" },
    },
    dataSources: [{ label: "outreachy.org", url: "https://www.outreachy.org/apply/project-selection/" }],
  },
  {
    id: "gssoc",
    name: "GirlScript Summer of Code",
    shortName: "GSSoC",
    runBy: "GirlScript Foundation",
    status: "coming-soon",
    oneLiner: "A three-month open-source program with a points leaderboard, run every year since 2018.",
    accentVar: "--program-gssoc",
    officialUrl: "https://gssoc.girlscript.org",
    trackingIssueUrl: newProgramIssue("GirlScript Summer of Code"),
    facts: {
      stipend: { value: "No stipend; certificates and swag for top contributors", sourceUrl: "https://gssoc.girlscript.org", lastVerified: "2026-10-17" },
      length: { value: "About three months, with contributions in May and June", sourceUrl: "https://gssoc.girlscript.org", lastVerified: "2026-10-17" },
      eligibility: { value: "Open to everyone; free to apply", sourceUrl: "https://gssoc.girlscript.org/apply", lastVerified: "2026-10-17" },
      cadence: { value: "Once a year, launching in March", sourceUrl: "https://gssoc.girlscript.org", lastVerified: "2026-10-17" },
    },
    dataSources: [{ label: "gssoc.girlscript.org", url: "https://gssoc.girlscript.org" }],
  },
  {
    id: "mlh-fellowship",
    name: "MLH Fellowship",
    shortName: "MLH",
    runBy: "Major League Hacking",
    status: "coming-soon",
    oneLiner: "A remote 12-week internship alternative where small pods work on real open-source projects.",
    accentVar: "--program-mlh",
    officialUrl: "https://fellowship.mlh.com",
    trackingIssueUrl: newProgramIssue("MLH Fellowship"),
    facts: {
      stipend: { value: "Educational stipend; amount not published", sourceUrl: "https://fellowship.mlh.com", lastVerified: "2026-10-17" },
      length: { value: "12 weeks", sourceUrl: "https://fellowship.mlh.com", lastVerified: "2026-10-17" },
      eligibility: { value: "See official site", sourceUrl: "https://hackp.ac/fellowship-faq", lastVerified: "2026-10-17" },
      cadence: { value: "See official site", sourceUrl: "https://fellowship.mlh.com", lastVerified: "2026-10-17" },
    },
    dataSources: [{ label: "fellowship.mlh.com", url: "https://fellowship.mlh.com" }],
  },
  {
    id: "summer-of-bitcoin",
    name: "Summer of Bitcoin",
    shortName: "SoB",
    runBy: "Summer of Bitcoin",
    status: "coming-soon",
    oneLiner: "A summer program that introduces university students to Bitcoin open-source development and design.",
    accentVar: "--program-sob",
    officialUrl: "https://www.summerofbitcoin.org",
    trackingIssueUrl: newProgramIssue("Summer of Bitcoin"),
    facts: {
      stipend: { value: "See official site", sourceUrl: "https://www.summerofbitcoin.org", lastVerified: "2026-10-17" },
      length: { value: "See official site", sourceUrl: "https://guide.summerofbitcoin.org", lastVerified: "2026-10-17" },
      eligibility: { value: "University students", sourceUrl: "https://www.summerofbitcoin.org", lastVerified: "2026-10-17" },
      cadence: { value: "See official site", sourceUrl: "https://www.summerofbitcoin.org", lastVerified: "2026-10-17" },
    },
    dataSources: [{ label: "summerofbitcoin.org", url: "https://www.summerofbitcoin.org" }],
  },
];

export const livePrograms = () => PROGRAMS.filter((p) => p.status === "live");
export const comingSoonPrograms = () => PROGRAMS.filter((p) => p.status === "coming-soon");
export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);

/** Facts as label/value rows for cards and tables. */
export const factRows = (p: Program) =>
  [
    { id: "stipend", label: "Stipend", ...p.facts.stipend },
    { id: "length", label: "Length", ...p.facts.length },
    { id: "eligibility", label: "Who can apply", ...p.facts.eligibility },
    { id: "cadence", label: "Cadence", ...p.facts.cadence },
  ] as const;
