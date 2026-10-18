import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROGRAMS } from "@/data/programs";
import type { ChapterStep, Exhibit } from "@/lib/home-data";
import ProgramChapter from "./ProgramChapter";

const NEW_PROGRAM_ISSUE = "https://github.com/rajatrsrivastav/ossgrid/issues/new?template=new_program.yml";

interface ProgramsProps {
  exhibits: Exhibit[];
  chapters: { gsoc: ChapterStep[]; lfx: ChapterStep[] };
}

/**
 * The two indexed programs as pinned chapters, then the programs whose dashboards are on the way.
 * This replaces the earlier exhibits plus directory pair, which said the same thing twice.
 */
export default function Programs({ exhibits, chapters }: ProgramsProps) {
  const soon = PROGRAMS.filter((p) => p.status !== "live");
  return (
    <section id="programs" aria-labelledby="programs-title" className="cine cine-section !px-0 !pb-0">
      <div className="cine-wrap mb-[clamp(40px,8vh,96px)] grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <h2 id="programs-title" className="font-display cine-h2">two programs, indexed in full.</h2>
        <p className="font-ui cine-lede">
          Every organization and project from Google Summer of Code and LFX Mentorship, read from the official archives. Scroll through each one to see how it grew.
        </p>
      </div>

      {exhibits.map((ex, i) => (
        <ProgramChapter key={ex.id} exhibit={ex} steps={chapters[ex.id]} flip={i % 2 === 1} />
      ))}

      <div className="cine-wrap font-ui py-[clamp(72px,12vh,140px)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div>
            <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.4rem)] font-bold leading-tight tracking-[-0.015em] text-[var(--cine-fg)]">dashboards on the way.</h3>
            <p className="mt-3 max-w-[26rem] text-base leading-relaxed text-[var(--cine-fg-2)]">
              The facts for these programs are checked and sourced. Their organization dashboards come next.
            </p>
            <a href={NEW_PROGRAM_ISSUE} target="_blank" rel="noopener noreferrer" className="cine-link mt-5 inline-block text-sm">Suggest a program</a>
          </div>
          <ul className="border-t border-[var(--cine-line)]" aria-label="Programs coming soon">
            {soon.map((p) => (
              <li key={p.id} className="border-b border-[var(--cine-line)]">
                <Link href={`/programs/${p.id}`} className="group grid gap-1 py-5 transition-colors sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6 xl:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,15rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cine-accent)]">
                  <span className="font-display text-xl font-bold text-[var(--cine-fg)] group-hover:underline group-hover:underline-offset-4">{p.name}</span>
                  <span className="text-[0.95rem] text-[var(--cine-fg-2)]">{p.oneLiner}</span>
                  <span className="hidden items-center justify-end gap-1 text-right text-sm text-[var(--cine-fg-2)] xl:flex">
                    {p.facts.cadence.value} <ArrowRight size={15} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
