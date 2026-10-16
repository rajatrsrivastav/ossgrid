import calendar from "./program-calendar.json";

export type ProgramStatus = "live" | "coming-soon";

export interface ProgramCard {
  id: "lfx" | "gsoc" | "outreachy" | "mlh" | "sob" | "gssoc";
  name: string;
  sponsor: string;
  description: string;
  href: string;
  external?: boolean;
  status: ProgramStatus;
  /** CSS variable holding the program colour */
  accentVar: string;
  facts: { label: string; value: string }[];
  sourceUrl: string;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const lfxCalendar = calendar.lfx;
export const gsocCalendar = calendar.gsoc;

export const programs: ProgramCard[] = [
  {
    id: "lfx",
    name: calendar.lfx.name,
    sponsor: calendar.lfx.sponsor,
    description: "Paid, remote mentorships on Linux Foundation and CNCF projects. Three terms a year.",
    href: "/lfx",
    status: "live",
    accentVar: "--program-lfx",
    facts: [
      { label: "Stipend", value: `${usd(calendar.lfx.stipend.minUsd)} to ${usd(calendar.lfx.stipend.maxUsd)}` },
      { label: "Length", value: `${calendar.lfx.durationWeeks.fullTime} or ${calendar.lfx.durationWeeks.partTime} weeks` },
      { label: "Who", value: "Anyone 18+" },
    ],
    sourceUrl: calendar.lfx.docsUrl,
  },
  {
    id: "gsoc",
    name: calendar.gsoc.name,
    sponsor: calendar.gsoc.sponsor,
    description: "Google's yearly program that pays new contributors to work on an open-source project for a summer.",
    href: "/gsoc",
    status: "live",
    accentVar: "--program-gsoc",
    facts: [
      { label: "Stipend", value: `${usd(calendar.gsoc.stipend.minUsd)} to ${usd(calendar.gsoc.stipend.maxUsd)}` },
      { label: "Length", value: `${calendar.gsoc.durationWeeks.standard} to ${calendar.gsoc.durationWeeks.extended} weeks` },
      { label: "Who", value: "Beginners, 18+" },
    ],
    sourceUrl: calendar.gsoc.sourceUrl,
  },
];

export const upcomingPrograms = [
  { id: "outreachy", name: "Outreachy", blurb: "Paid remote internships for people underrepresented in tech.", href: "https://www.outreachy.org" },
  { id: "mlh", name: "MLH Fellowship", blurb: "12-week remote fellowship working on real open-source projects.", href: "https://fellowship.mlh.io" },
  { id: "sob", name: "Summer of Bitcoin", blurb: "Summer internship for students contributing to Bitcoin open source.", href: "https://www.summerofbitcoin.org" },
  { id: "gssoc", name: "GirlScript Summer of Code", blurb: "Three-month open-source program run by the GirlScript Foundation.", href: "https://gssoc.girlscript.tech" },
];
