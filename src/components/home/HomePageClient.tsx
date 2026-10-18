"use client";

import Header from "@/components/Header";
import CinematicHero from "@/components/home/CinematicHero";
import Mission from "@/components/home/story/Mission";
import Exhibits from "@/components/home/story/Exhibits";
import Showcase from "@/components/home/story/Showcase";
import ProgramsDirectory from "@/components/home/story/ProgramsDirectory";
import NetworkScene from "@/components/home/story/NetworkScene";
import Community from "@/components/home/story/Community";
import FinalCta from "@/components/home/story/FinalCta";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import type { HomeData } from "@/lib/home-data";

/**
 * Home story, in order: hero, mission, program exhibits, featured organizations, the practical
 * directory, the network scene, playbook, FAQ, community and a closing call to action.
 * Art-led sections are always dark (.cine); the directory, playbook and FAQ follow the theme.
 */
export default function HomePageClient({ data }: { data: HomeData }) {
  const span = Array.from({ length: data.combined.yearMax - data.combined.yearMin + 1 }, (_, i) => data.combined.yearMin + i);
  return (
    <>
      <Header variant="simple" overlay />
      <main className="-mt-16 flex w-full flex-1 flex-col bg-[var(--bg-base)]">
        <CinematicHero counts={data.hero.counts} staged={data.hero.staged} lqip={data.hero.lqip} />
        <Mission {...data.mission} />
        <Exhibits exhibits={data.exhibits} />
        <Showcase orgs={data.showcase} span={span} />
        <ProgramsDirectory programStats={data.programStats} />
        <NetworkScene {...data.network} />
        <FirstTimerGuide latestYear={data.combined.yearMax} />
        <FirstTimerFAQ />
        <Community {...data.community} />
        <FinalCta />
      </main>
    </>
  );
}
