"use client";

import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import { LogoMarquee, type MarqueeOrg } from "@/components/landing/LogoMarquee";
import { Programs } from "@/components/landing/ProgramsFeatures";
import { DashboardsStrip } from "@/components/landing/DashboardsStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsStrip } from "@/components/landing/StatsStrip";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import type { ProgramStats } from "@/lib/stats";
import type { ProgramId } from "@/data/programs";

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
  /** Featured orgs per live program, in hero CTA order. */
  featured: Record<string, FeaturedOrg[]>;
  marquee: MarqueeOrg[];
  /** Program ids in CTA order (nearest application window first). */
  ctaOrder: ProgramId[];
  buildDate: string;
}

export default function HomePageClient({ programStats, combined, featured, marquee, ctaOrder, buildDate }: HomePageClientProps) {
  return (
    <>
      <Header variant="simple" />
      <main className="flex w-full flex-1 flex-col bg-[var(--bg-base)]">
        <LandingHero combined={combined} featured={featured} ctaOrder={ctaOrder} />
        <LogoMarquee orgs={marquee} />
        <Programs programStats={programStats} />
        <DashboardsStrip programStats={programStats} />
        <HowItWorks combined={combined} />
        <StatsStrip programStats={programStats} buildDate={buildDate} />
        <FirstTimerGuide latestYear={combined.yearMax} />
        <FirstTimerFAQ />
      </main>
    </>
  );
}
