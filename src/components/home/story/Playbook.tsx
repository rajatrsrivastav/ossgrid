"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { PLAYBOOK } from "@/data/playbook";
import { cn } from "@/lib/utils";

interface Stage {
  n: string;
  title: string;
  body: string;
  steps: string[];
  note: string;
  links: { label: string; href: string; external?: boolean }[];
}

const gsoc = PLAYBOOK.find((p) => p.id === "gsoc")!;
const lfx = PLAYBOOK.find((p) => p.id === "lfx")!;

const STAGES: Stage[] = [
  {
    n: "01",
    title: "Choose your community",
    body: "Join the chat before you touch code. Watch how fast maintainers review, whether past mentors still show up, and how many projects the organization has run.",
    steps: ["Shortlist two or three organizations whose stack you can already read", "Join their Slack, Discord or mailing list and read for a week", "Read the last 20 merged pull requests to see how review works"],
    note: "A steady organization beats a famous one. Its page here shows every year it took part.",
    links: [{ label: "Pick a community first", href: "/guide#community" }, { label: "Browse GSoC organizations", href: gsoc.browseHref }],
  },
  {
    n: "02",
    title: "Make meaningful contributions",
    body: "Selection is mostly decided before applications open. Reproduce a real bug, fix it, test it and open a pull request. Then take the review seriously.",
    steps: ["Set the project up locally and run its tests", "Fix one real issue, not a typo, and explain how you tested it", "Answer every review comment within a day"],
    note: "Many strong organizations never label good first issues. Ask in chat which ones are wanted.",
    links: [{ label: "The contribution loop", href: "/guide#loop" }, { label: "Finding issues", href: "/guide#issues" }],
  },
  {
    n: "03",
    title: "Prepare your proposal",
    body: "Write a clear problem statement, a week-by-week plan with deliverables a mentor can check, and links to the work you already merged in their repository.",
    steps: [...gsoc.phase3.checklist.slice(0, 2), lfx.phase3.checklist[2]],
    note: gsoc.phase3.tip,
    links: [{ label: "Read public proposals", href: "/proposals" }, { label: "Checklist per program", href: "/guide#programs" }],
  },
];

/** The contributor playbook in three stages. Each stage opens to concrete steps and links into the guide. */
export default function Playbook() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="playbook" aria-labelledby="playbook-title" className="cine cine-section">
      <div className="cine-wrap font-ui">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 id="playbook-title" className="font-display cine-h2">how people actually get selected.</h2>
          <p className="cine-lede">Not a lottery. Three stages, in order, based on what mentors say they look for.</p>
        </div>

        <ol className="mt-[clamp(48px,8vh,96px)] grid border-t border-[var(--cine-line-strong)] lg:grid-cols-3" aria-label="Three stages">
          {STAGES.map((s, i) => {
            const isOpen = open === i;
            const panel = `playbook-stage-${s.n}`;
            return (
              <li key={s.n} className={cn("flex flex-col border-b border-[var(--cine-line)] py-10 lg:border-b-0 lg:px-10 lg:py-14", i > 0 && "lg:border-l", i === 0 && "lg:pl-0", i === 2 && "lg:pr-0")}>
                <span className="font-display text-[clamp(3.5rem,6vw,6rem)] font-bold leading-none tracking-[-0.04em] text-[var(--cine-fg-3)]" aria-hidden="true">{s.n}</span>
                <h3 className="font-display mt-6 text-[clamp(1.6rem,2.2vw,2.15rem)] font-bold leading-tight tracking-[-0.015em] text-[var(--cine-fg)]">{s.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-[var(--cine-fg-2)] md:text-[1.05rem]">{s.body}</p>

                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="mt-6 flex items-center gap-2 self-start text-sm font-semibold text-[var(--cine-fg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cine-accent)]"
                >
                  <Plus size={16} className={cn("transition-transform duration-300", isOpen && "rotate-45")} aria-hidden="true" />
                  {isOpen ? "Hide the steps" : "Show the steps"}
                </button>

                <div id={panel} className="disclose" data-open={isOpen} inert={!isOpen}>
                  <div>
                    <ul className="mt-5 flex flex-col gap-3 text-[0.95rem] leading-relaxed text-[var(--cine-fg)]">
                      {s.steps.map((step) => (
                        <li key={step} className="flex gap-3"><span className="mt-[0.6em] h-px w-4 shrink-0 bg-[var(--cine-fg-3)]" aria-hidden="true" />{step}</li>
                      ))}
                    </ul>
                    <p className="mt-5 border-l-2 border-[var(--cine-accent)] pl-4 text-[0.95rem] leading-relaxed text-[var(--cine-fg-2)]">{s.note}</p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-8 text-sm">
                  {s.links.map((l) => (
                    <Link key={l.href} href={l.href} className="cine-link">{l.label}</Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/guide" className="cine-btn cine-btn--line">Read the full playbook <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
