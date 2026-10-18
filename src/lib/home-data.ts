import fs from "fs";
import path from "path";
import type { GsocOrganization, GsocYearFile, Organization } from "./types";
import { getProgramStats, getCombinedStats } from "./stats";
import { getProposalStats } from "./proposals-data";
import { mergeContributors } from "./contributors";
import snapshot from "@/data/contributors-history.json";
import { getProgram, PROGRAMS, livePrograms, factRows } from "@/data/programs";
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY, type SimulationNodeDatum } from "d3-force";

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


/** One step of a program chapter's scroll sequence (a GSoC year or an LFX term). */
export interface ChapterStep { key: string; label: string; value: number; unit: string }

export interface EcoNode {
  id: string; name: string; href: string; program: "gsoc" | "lfx";
  projects: number; years: number; tech: string[]; x: number; y: number; r: number;
}
export interface EcoLink { source: string; target: string; shared: string[] }

/** A deterministic layout of the largest organizations, linked where they list 4+ of the same technologies. */
function buildEcosystem(gsoc: GsocOrganization[], lfx: Organization[]) {
  const norm = (t: string) => t.trim().toLowerCase();
  const pick = [
    ...[...gsoc].sort((a, b) => b.projectCount - a.projectCount).slice(0, 40).map((o) => ({ id: `gsoc:${o.slug}`, name: o.name, href: `/gsoc/${o.slug}`, program: "gsoc" as const, projects: o.projectCount, years: o.years.length, techRaw: o.technologies })),
    ...[...lfx].sort((a, b) => b.projectCount - a.projectCount).slice(0, 16).map((o) => ({ id: `lfx:${o.id}`, name: o.name, href: `/organization/${o.id}`, program: "lfx" as const, projects: o.projectCount, years: o.years.length, techRaw: o.technologies })),
  ];
  const techSets = pick.map((n) => new Map(n.techRaw.map((t) => [norm(t), t])));
  const links: EcoLink[] = [];
  for (let i = 0; i < pick.length; i++) for (let j = i + 1; j < pick.length; j++) {
    const shared = [...techSets[i].keys()].filter((t) => techSets[j].has(t));
    if (shared.length >= 4) links.push({ source: pick[i].id, target: pick[j].id, shared: shared.map((t) => techSets[i].get(t)!).slice(0, 6) });
  }
  links.sort((a, b) => b.shared.length - a.shared.length);
  const kept = links.slice(0, 120);
  const W = 1000, H = 560;
  type SimNode = SimulationNodeDatum & { id: string; r: number };
  const maxP = Math.max(...pick.map((n) => n.projects));
  const simNodes: SimNode[] = pick.map((n, i) => ({ id: n.id, r: 7 + Math.sqrt(n.projects / maxP) * 26, x: W / 2 + Math.cos(i * 2.4) * 200, y: H / 2 + Math.sin(i * 2.4) * 140 }));
  const sim = forceSimulation(simNodes)
    .force("link", forceLink<SimNode, { source: string; target: string }>(kept.map((l) => ({ source: l.source, target: l.target }))).id((d) => d.id).distance(110).strength(0.07))
    .force("charge", forceManyBody().strength(-230))
    .force("collide", forceCollide<SimNode>().radius((d) => d.r + 6))
    .force("x", forceX(W / 2).strength(0.06))
    .force("y", forceY(H / 2).strength(0.12))
    .force("center", forceCenter(W / 2, H / 2))
    .stop();
  for (let i = 0; i < 500; i++) sim.tick();
  // Fit into the frame with a margin.
  const xs = simNodes.map((n) => n.x!), ys = simNodes.map((n) => n.y!);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const sx = (W - 120) / (maxX - minX || 1), sy = (H - 100) / (maxY - minY || 1), sc = Math.min(sx, sy);
  const nodes: EcoNode[] = pick.map((n, i) => ({
    id: n.id, name: n.name, href: n.href, program: n.program, projects: n.projects, years: n.years,
    tech: n.techRaw,
    x: +(W / 2 + (simNodes[i].x! - (minX + maxX) / 2) * sc).toFixed(1),
    y: +(H / 2 + (simNodes[i].y! - (minY + maxY) / 2) * sc).toFixed(1),
    r: +simNodes[i].r.toFixed(1),
  }));
  // Filter chips: the technologies most common among these organizations.
  const freq = new Map<string, { label: string; n: number }>();
  for (const set of techSets) for (const [k, label] of set) freq.set(k, { label: freq.get(k)?.label ?? label, n: (freq.get(k)?.n ?? 0) + 1 });
  const filters = [...freq.values()].sort((a, b) => b.n - a.n).slice(0, 8).map((f) => f.label);
  return { width: W, height: H, nodes, links: kept, filters };
}

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

  const ecosystem = buildEcosystem(gsoc, lfx);

  // Program chapter steps: one per GSoC year (accepted orgs) and one per LFX term (projects).
  const perYear = new Map<number, number>();
  for (const o of gsoc) for (const y of o.years) perYear.set(y, (perYear.get(y) || 0) + 1);
  const gsocSteps: ChapterStep[] = [...perYear.entries()].sort((a, b) => a[0] - b[0]).map(([y, n]) => ({ key: String(y), label: String(y), value: n, unit: "organizations accepted" }));
  const perTerm = new Map<string, number>();
  for (const o of lfx) for (const p of o.projects) { const k = `${p.year}-${p.termIndex}`; perTerm.set(k, (perTerm.get(k) || 0) + 1); }
  const termName = (k: string) => { const [y, t] = k.split("-"); return t === "0" ? `${y} pilot` : `${y} term ${t}`; };
  const lfxSteps: ChapterStep[] = [...perTerm.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => ({ key: k, label: termName(k), value: n, unit: "projects" }));

  // Explore insights, all derived from the data.
  const veterans = gsoc.filter((o) => o.years.length >= 5).length;
  const newcomers = gsoc.filter((o) => o.firstYear === latestGsocYear).length;
  const techCount = new Map<string, number>();
  for (const o of gsoc) for (const t of o.technologies) techCount.set(t, (techCount.get(t) || 0) + 1);
  const topTech = [...techCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t, n]) => ({ label: t, count: n }));
  const insights = [
    { value: veterans, label: "GSoC organizations have taken part five or more years", href: "/gsoc?quick=veteran" },
    { value: newcomers, label: `organizations joined GSoC for the first time in ${latestGsocYear}`, href: "/gsoc?quick=new" },
    { value: proposals.count, label: `public GSoC proposals from ${proposals.orgCount} organizations, ready to read before you write yours`, href: "/proposals" },
  ];

  const contributors = mergeContributors(snapshot.contributors);
  const community = { count: contributors.length, faces: contributors.slice(0, 10).map((c) => ({ login: c.login, name: c.name, avatarUrl: c.avatarUrl, profileUrl: c.profileUrl })) };

  return {
    programStats,
    combined,
    proposals,
    hero: {
      counts: { gsocOrgs: gsocStats.orgCount, gsocSince: gsocStats.yearMin, lfxOrgs: lfxStats.orgCount, lfxSince: lfxStats.yearMin, projects: combined.projectCount },
      staged,
      lqip: { desktop: readText("art/hero-grid-desktop-lqip.txt"), mobile: readText("art/hero-grid-mobile-lqip.txt"), lightDesktop: readText("art/hero-grid-light-desktop-lqip.txt"), lightMobile: readText("art/hero-grid-light-mobile-lqip.txt") },
    },
    mission: { orgs: nf.format(combined.orgCount), projects: nf.format(combined.projectCount), since: combined.yearMin },
    exhibits,
    showcase,
    ecosystem,
    chapters: { gsoc: gsocSteps, lfx: lfxSteps },
    explore: { insights, topTech },
    community,
    programCount: PROGRAMS.length,
    liveCount: livePrograms().length,
    buildDate: new Date().toISOString().slice(0, 10),
  };
}

export type HomeData = ReturnType<typeof getHomeData>;
