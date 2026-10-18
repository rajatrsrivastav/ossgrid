"use client";

import Header from "@/components/Header";
import CinematicHero from "@/components/home/CinematicHero";
import Programs from "@/components/home/story/Programs";
import Explore from "@/components/home/story/Explore";
import Ecosystem from "@/components/home/story/Ecosystem";
import Playbook from "@/components/home/story/Playbook";
import FinalCta from "@/components/home/story/FinalCta";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import type { HomeData } from "@/lib/home-data";

/**
 * Home story, in order: hero (with the mission rising over it on scroll), the two programs as scroll chapters, explore
 * organizations, the ecosystem network, the playbook, common questions and a closing call to
 * action. Every section uses the .cine tokens, which follow the light or dark theme.
 */
export default function HomePageClient({ data }: { data: HomeData }) {
  const span = Array.from({ length: data.combined.yearMax - data.combined.yearMin + 1 }, (_, i) => data.combined.yearMin + i);
  return (
    <>
      <Header variant="simple" overlay />
      <main id="main" className="-mt-16 flex w-full flex-1 flex-col bg-[var(--bg-base)]">
        <CinematicHero counts={data.hero.counts} staged={data.hero.staged} lqip={data.hero.lqip} mission={data.mission} />
        <Programs exhibits={data.exhibits} chapters={data.chapters} />
        <Explore insights={data.explore.insights} topTech={data.explore.topTech} showcase={data.showcase} span={span} />
        <Ecosystem {...data.ecosystem} orgCount={data.combined.orgCount} />
        <Playbook />
        <FirstTimerFAQ />
        <FinalCta community={data.community} />
      </main>
    </>
  );
}
