import Link from "next/link";
import Image from "next/image";
import type { StagedOrg } from "@/lib/home-data";
import { getProgram } from "@/data/programs";

export interface HeroCounts {
  gsocOrgs: number;
  gsocSince: number;
  lfxOrgs: number;
  lfxSince: number;
  projects: number;
}

interface CinematicHeroProps {
  counts: HeroCounts;
  /** Real organizations staged in the scene, already ordered. */
  staged: StagedOrg[];
  /** Blurred inline placeholders shown until the artwork loads. */
  lqip: { desktop: string; mobile: string };
}

const nf = new Intl.NumberFormat("en-US");

/**
 * Home hero. Always dark: the artwork is a pre-rendered contribution graph built as
 * architecture (scripts/art/render-hero.mjs). Text and actions are live HTML.
 */
export default function CinematicHero({ counts, staged, lqip }: CinematicHeroProps) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="cine cine-hero flex flex-col">
      <picture className="cine-hero__art" style={{ backgroundImage: `url(${lqip.desktop})` }}>
        <source media="(max-width: 640px)" type="image/avif" srcSet="/art/hero-grid-mobile-780.avif 780w, /art/hero-grid-mobile-1170.avif 1170w" sizes="100vw" />
        <source media="(max-width: 640px)" type="image/webp" srcSet="/art/hero-grid-mobile-780.webp 780w, /art/hero-grid-mobile-1170.webp 1170w" sizes="100vw" />
        <source type="image/avif" srcSet="/art/hero-grid-1080.avif 1080w, /art/hero-grid-1600.avif 1600w, /art/hero-grid-2560.avif 2560w" sizes="100vw" />
        <source type="image/webp" srcSet="/art/hero-grid-1080.webp 1080w, /art/hero-grid-1600.webp 1600w, /art/hero-grid-2560.webp 2560w" sizes="100vw" />
        {/* Plain <img> inside an art-directed <picture> with AVIF/WebP sources. */}
        <img
          src="/art/hero-grid-1600.webp"
          alt=""
          width={2560}
          height={1440}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <style>{`@media (max-width: 640px){#hero .cine-hero__art{background-image:url(${lqip.mobile})!important}}`}</style>

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center px-5 pt-28 text-center sm:px-8 md:pt-40 lg:pt-[24vh]">
        <div className="cine-scrim flex flex-col items-center">
          <p className="font-ui cine-in-1 mb-6 text-sm text-[var(--cine-fg-2)] md:text-[0.95rem]">Open-source mentorships, indexed</p>

          <h1 id="hero-title" className="font-display cine-title">
            <span className="line">find your place</span>
            <span className="line">in open source.</span>
          </h1>

          <p className="font-ui cine-in-1 mt-7 max-w-[31rem] text-base leading-relaxed text-[var(--cine-fg)] md:text-[1.15rem] md:leading-[1.65]">
            {nf.format(counts.gsocOrgs + counts.lfxOrgs)} organizations and {nf.format(counts.projects)} projects from Google Summer of Code and LFX Mentorship, since {Math.min(counts.gsocSince, counts.lfxSince)}.
          </p>
        </div>

        <div className="cine-in-2 mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/#programs" className="cine-btn cine-btn--solid">Explore programs</Link>
          <Link href="/gsoc" className="cine-btn cine-btn--line">Discover organizations</Link>
        </div>

        {/* Staged explorer: three real organizations from the index, sitting in the scene. */}
        <div className="cine-stage cine-in-3 mt-auto w-full max-w-[880px] pb-6 pt-14 md:pb-10">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5" aria-label="Organizations in the index">
            {staged.map((org, i) => {
              const program = getProgram(org.program)!;
              return (
                <li key={org.id} className={i > 0 ? "hidden sm:block" : undefined}>
                  <Link href={org.href} className="cine-panel font-ui text-left">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white">
                        <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={36} height={36} unoptimized className="h-full w-full object-contain p-1" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.95rem] font-semibold text-[var(--cine-fg)]">{org.name}</span>
                        <span className="block truncate text-xs text-[var(--cine-fg-3)]">{program.name}</span>
                      </span>
                    </span>
                    <span className="flex items-baseline justify-between text-xs text-[var(--cine-fg-2)]">
                      <span><strong className="font-display text-xl font-semibold text-[var(--cine-fg)]">{org.projectCount}</strong> projects</span>
                      <span>{org.years} {org.years === 1 ? "year" : "years"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
