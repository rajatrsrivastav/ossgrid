import fs from "fs";
import path from "path";
import type { GsocOrganization, GsocYearFile, Organization } from "./types";
import { getProgramStats, getCombinedStats } from "./stats";
import { getProposalStats } from "./proposals-data";
import { mergeContributors } from "./contributors";
import snapshot from "@/data/contributors-history.json";
import { getProgram, PROGRAMS, livePrograms, factRows } from "@/data/programs";

/** Everything the home story needs, derived at build time from the data files. Server-only. */

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", rel), "utf8"));
}
function readText(rel: string): string {
  try { return fs.readFileSync(path.join(process.cwd(), "public", rel), "utf8").trim(); } catch { return ""; }
}

export interface StagedOrg {
  id: string;
  name: string;
  href: string;
  logoUrl: string;
  program: "gsoc" | "lfx";
  projectCount: number;
  years: number;
}

export interface ShowcaseOrg extends StagedOrg {
  category: string;
  description: string;
  activeYears: number[];
  technologies: string[];
  recentProjects: { title: string; year: number }[];
  note: string;
}

export interface Exhibit {
  id: "gsoc" | "lfx";
  name: string;
  runBy: string;
  oneLiner: string;
  href: string;
  officialUrl: string;
  art: string;
  facts: { label: string; value: string; sourceUrl?: string }[];
  numbers: { label: string; value: number }[];
  ctaLabel: string;
}

export interface NetworkLabel { name: string; href: string; x: number; y: number; program: "gsoc" | "lfx" }

const nf = new Intl.NumberFormat("en-US");

export function getHomeData() {
  const programStats = getProgramStats();
  const combined = getCombinedStats();
  const proposals = getProposalStats();
  const gsoc = readJson<GsocOrganization[]>("data/gsoc/organizations.json");
  const lfx = readJson<Organization[]>("data/organizations.json");
  const gsocStats = programStats.find((p) => p.id === "gsoc")!;
  const lfxStats = programStats.find((p) => p.id === "lfx")!;
  const latestGsocYear = gsocStats.yearMax;
  const gsocYearFile = readJson<GsocYearFile>(`data/gsoc/projects-${latestGsocYear}.json`);

  const bySize = <T extends { projectCount: number }>(list: T[]) => [...list].sort((a, b) => b.projectCount - a.projectCount);
  const gsocTop = bySize(gsoc), lfxTop = bySize(lfx);

  const stageFromGsoc = (o: GsocOrganization): StagedOrg => ({ id: o.slug, name: o.name, href: `/gsoc/${o.slug}`, logoUrl: o.logoUrl, program: "gsoc", projectCount: o.projectCount, years: o.years.length });
  const stageFromLfx = (o: Organization): StagedOrg => ({ id: o.id, name: o.name, href: `/organization/${o.id}`, logoUrl: o.logoUrl, program: "lfx", projectCount: o.projectCount, years: o.years.length });

  // Hero: the largest org from each live program plus the next GSoC org.
  const staged = [stageFromGsoc(gsocTop[0]), stageFromLfx(lfxTop[0]), stageFromGsoc(gsocTop[1])];

  // Showcase: long-running orgs from both programs, plus the newest GSoC arrival with projects this year.
  const gsocRecent = (slug: string) => gsocYearFile.projects.filter((p) => p.orgSlug === slug && p.origin === "gsoc").slice(0, 3).map((p) => ({ title: p.title, year: p.year }));
  const lfxRecent = (o: Organization) => o.projects.slice(0, 3).map((p) => ({ title: p.title, year: p.year }));
  const veteran = gsocTop.find((o) => o.years.length === Math.max(...gsoc.map((g) => g.years.length)))!;
  const secondVeteran = gsocTop.find((o) => o !== veteran && o.years.length >= veteran.years.length - 1 && o.category !== veteran.category)!;
  const newcomer = bySize(gsoc.filter((o) => o.firstYear === latestGsocYear && gsocRecent(o.slug).length > 0))[0];
  const showcase: ShowcaseOrg[] = [
    { ...stageFromGsoc(veteran), category: veteran.category, description: veteran.description, activeYears: veteran.years, technologies: veteran.technologies.slice(0, 5), recentProjects: gsocRecent(veteran.slug), note: `Accepted every year from ${veteran.firstYear} to ${veteran.latestYear}.` },
    { ...stageFromLfx(lfxTop[0]), category: lfxTop[0].category, description: lfxTop[0].description, activeYears: lfxTop[0].years, technologies: lfxTop[0].technologies.slice(0, 5), recentProjects: lfxRecent(lfxTop[0]), note: `${lfxTop[0].terms.length} LFX terms since ${Math.min(...lfxTop[0].years)}.` },
    { ...stageFromGsoc(secondVeteran), category: secondVeteran.category, description: secondVeteran.description, activeYears: secondVeteran.years, technologies: secondVeteran.technologies.slice(0, 5), recentProjects: gsocRecent(secondVeteran.slug), note: `${secondVeteran.years.length} years in GSoC.` },
    ...(newcomer ? [{ ...stageFromGsoc(newcomer), category: newcomer.category, description: newcomer.description, activeYears: newcomer.years, technologies: newcomer.technologies.slice(0, 5), recentProjects: gsocRecent(newcomer.slug), note: `New in ${latestGsocYear}.` }] : []),
  ];

  const facts = (id: "gsoc" | "lfx") => factRows(getProgram(id)!).map((f) => ({ label: f.label, value: f.value, sourceUrl: f.sourceUrl }));
  const gsocThisYear = gsoc.filter((o) => o.years.includes(latestGsocYear)).length;
  const gsocNew = gsoc.filter((o) => o.firstYear === latestGsocYear).length;
  const exhibits: Exhibit[] = [
    {
      id: "gsoc", name: getProgram("gsoc")!.name, runBy: getProgram("gsoc")!.runBy, oneLiner: getProgram("gsoc")!.oneLiner, href: "/gsoc", officialUrl: getProgram("gsoc")!.officialUrl, art: "exhibit-gsoc",
      facts: facts("gsoc"),
      numbers: [
        { label: "organizations", value: gsocStats.orgCount },
        { label: "projects", value: gsocStats.projectCount },
        { label: `accepted in ${latestGsocYear}`, value: gsocThisYear },
        { label: `new in ${latestGsocYear}`, value: gsocNew },
      ],
      ctaLabel: "Browse GSoC organizations",
    },
    {
      id: "lfx", name: getProgram("lfx")!.name, runBy: getProgram("lfx")!.runBy, oneLiner: getProgram("lfx")!.oneLiner, href: "/lfx", officialUrl: getProgram("lfx")!.officialUrl, art: "exhibit-lfx",
      facts: facts("lfx"),
      numbers: [
        { label: "organizations", value: lfxStats.orgCount },
        { label: "projects", value: lfxStats.projectCount },
        { label: "terms indexed", value: lfxStats.termCount ?? 0 },
        { label: "first term", value: lfxStats.yearMin },
      ],
      ctaLabel: "Browse LFX organizations",
    },
  ];

  // Network labels: the largest visible nodes, positioned from the render's own camera projection.
  const pickLabels = (file: string, count: number, edge = 6): NetworkLabel[] => {
    const raw = readText(file);
    if (!raw) return [];
    const meta = JSON.parse(raw) as { nodes: { name: string; href: string; x: number; top: number; visible: boolean; projects: number; program: "gsoc" | "lfx" }[] };
    const chosen: NetworkLabel[] = [];
    for (const n of [...meta.nodes].filter((n) => n.visible && n.x > edge && n.x < 100 - edge).sort((a, b) => b.projects - a.projects)) {
      // Keep labels apart so they never overlap.
      if (chosen.some((c) => Math.abs(c.x - n.x) < 13 && Math.abs(c.y - n.top) < 7)) continue;
      chosen.push({ name: n.name, href: n.href, x: n.x, y: n.top, program: n.program });
      if (chosen.length === count) break;
    }
    return chosen;
  };
  const network = { desktop: pickLabels("art/network.json", 7), mobile: pickLabels("art/network-mobile.json", 4, 24), orgCount: combined.orgCount };

  const contributors = mergeContributors(snapshot.contributors);
  const community = { count: contributors.length, faces: contributors.slice(0, 10).map((c) => ({ login: c.login, name: c.name, avatarUrl: c.avatarUrl, profileUrl: c.profileUrl })) };

  return {
    programStats,
    combined,
    proposals,
    hero: {
      counts: { gsocOrgs: gsocStats.orgCount, gsocSince: gsocStats.yearMin, lfxOrgs: lfxStats.orgCount, lfxSince: lfxStats.yearMin, projects: combined.projectCount },
      staged,
      lqip: { desktop: readText("art/hero-grid-desktop-lqip.txt"), mobile: readText("art/hero-grid-mobile-lqip.txt") },
    },
    mission: { orgs: nf.format(combined.orgCount), projects: nf.format(combined.projectCount), since: combined.yearMin },
    exhibits,
    showcase,
    network,
    community,
    programCount: PROGRAMS.length,
    liveCount: livePrograms().length,
    buildDate: new Date().toISOString().slice(0, 10),
  };
}

export type HomeData = ReturnType<typeof getHomeData>;
