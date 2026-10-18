"use client";

import Header from "@/components/Header";
import CinematicHero, { type HeroCounts } from "@/components/home/CinematicHero";
import { LogoMarquee, type MarqueeOrg } from "@/components/landing/LogoMarquee";
import { Programs } from "@/components/landing/ProgramsFeatures";
import { DashboardsStrip } from "@/components/landing/DashboardsStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsStrip } from "@/components/landing/StatsStrip";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import type { ProgramStats } from "@/lib/stats";
import { PROGRAMS, type ProgramId } from "@/data/programs";

export interface FeaturedOrg {
  id: string;
  name: string;
  href: string;
  logoUrl: string;
  category: string;
  projectCount: number;
  technologies: string[];
  years: number;
  program: ProgramId;
}

export interface CombinedStats {
  orgCount: number;
  projectCount: number;
  orgLabel: string;
  projectLabel: string;
  liveCount: number;
  yearMin: number;
  yearMax: number;
}

interface HomePageClientProps {
  programStats: ProgramStats[];
  combined: CombinedStats;
  marquee: MarqueeOrg[];
  buildDate: string;
  hero: { counts: HeroCounts; staged: FeaturedOrg[]; lqip: { desktop: string; mobile: string } };
  proposals: { count: number; orgCount: number; repos: number };
}

export default function HomePageClient({ programStats, combined, marquee, buildDate, proposals, hero }: HomePageClientProps) {
  const nf = new Intl.NumberFormat("en-US");
  return (
    <>
      <Header variant="simple" overlay />
      <main className="-mt-16 flex w-full flex-1 flex-col bg-[var(--bg-base)]">
        <CinematicHero counts={hero.counts} staged={hero.staged} lqip={hero.lqip} />
        <LogoMarquee orgs={marquee} />
        <Programs programStats={programStats} />
        <DashboardsStrip programStats={programStats} extraTiles={[{ href: "/proposals", title: "Proposals library", count: `${nf.format(proposals.count)} proposals · ${proposals.orgCount} orgs`, verb: "Read proposals" }, { href: "/guide", title: "Contributor playbook", count: `${PROGRAMS.length} program checklists`, verb: "Read the playbook" }]} />
        <HowItWorks combined={combined} />
        <StatsStrip programStats={programStats} buildDate={buildDate} extraGroups={[{ id: "proposals", title: "Proposals library", columns: [{ value: proposals.count, label: "Proposals" }, { value: proposals.orgCount, label: "Organizations covered" }, { value: proposals.repos, label: "Archives" }] }]} />
        <FirstTimerGuide latestYear={combined.yearMax} />
        <FirstTimerFAQ />
      </main>
    </>
  );
}
