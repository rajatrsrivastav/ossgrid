"use client";

import Header from "@/components/Header";
import LandingHero from "@/components/LandingHero";
import { LogoMarquee } from "@/components/landing/LogoMarquee";
import { Programs } from "@/components/landing/ProgramsFeatures";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsStrip } from "@/components/landing/StatsStrip";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import type { SiteStats } from "@/lib/stats";

export interface FeaturedOrg {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  projectCount: number;
  technologies: string[];
  years: number;
}

interface HomePageClientProps {
  stats: SiteStats;
  featured: FeaturedOrg[];
  orgNames: string[];
}

export default function HomePageClient({ stats, featured, orgNames }: HomePageClientProps) {
  return (
    <>
      <Header variant="simple" />
      <main className="flex w-full flex-1 flex-col bg-[var(--bg-base)]">
        <LandingHero stats={stats} featured={featured} />
        <LogoMarquee names={orgNames} />
        <Programs />
        <HowItWorks stats={stats} />
        <StatsStrip stats={stats} />
        <FirstTimerGuide />
        <FirstTimerFAQ />
      </main>
    </>
  );
}
