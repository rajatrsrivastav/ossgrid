"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PROGRAMS, livePrograms, lfxCalendar, gsocCalendar } from "@/data/programs";
import { TOOL_PAGES } from "@/data/site";
import { cn } from "@/lib/utils";

const fmt = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

function Source({ href, date }: { href: string; date: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--cine-fg)]" title={`Checked ${date}`}>
      source
    </a>
  );
}

function useFaqs() {
  const live = livePrograms();
  const gsoc = PROGRAMS.find((p) => p.id === "gsoc")!;
  const lfx = PROGRAMS.find((p) => p.id === "lfx")!;
  const outreachy = PROGRAMS.find((p) => p.id === "outreachy")!;
  const nextTerm = lfxCalendar.terms.find((t) => t.status === "upcoming");
  const proposals = TOOL_PAGES.find((t) => t.id === "proposals");

  const items: { q: string; a: React.ReactNode }[] = [
    {
      q: "Which program should I start with?",
      a: (
        <>
          If you can give a summer and you are new to open source, start with {gsoc.name}: {gsoc.facts.eligibility.value.toLowerCase()} <Source href={gsoc.facts.eligibility.sourceUrl} date={gsoc.facts.eligibility.lastVerified} />.
          If you want a term at any time of year, {lfx.name} runs {lfx.facts.cadence.value.toLowerCase()} <Source href={lfx.facts.cadence.sourceUrl} date={lfx.facts.cadence.lastVerified} />.
          {" "}{outreachy.name} is for {outreachy.facts.eligibility.value.toLowerCase()} <Source href={outreachy.facts.eligibility.sourceUrl} date={outreachy.facts.eligibility.lastVerified} />. Compare all of them in the programs chapter above.
        </>
      ),
    },
    {
      q: "How is LFX different from GSoC?",
      a: (
        <>
          Both pay a stipend for a term of mentored open-source work. LFX is run by {lfx.runBy}, has {lfx.facts.cadence.value.toLowerCase()} <Source href={lfx.facts.cadence.sourceUrl} date={lfx.facts.cadence.lastVerified} />, and pays {lfx.facts.stipend.value} <Source href={lfx.facts.stipend.sourceUrl} date={lfx.facts.stipend.lastVerified} />.
          GSoC is run by {gsoc.runBy}, happens {gsoc.facts.cadence.value.toLowerCase()} <Source href={gsoc.facts.cadence.sourceUrl} date={gsoc.facts.cadence.lastVerified} />, targets {gsoc.facts.eligibility.value.toLowerCase()}, and pays {gsoc.facts.stipend.value} depending on project size and country <Source href={gsoc.facts.stipend.sourceUrl} date={gsoc.facts.stipend.lastVerified} />.
        </>
      ),
    },
    {
      q: "When do applications open?",
      a: (
        <>
          GSoC: {gsocCalendar.phases.map((p) => `${p.label.toLowerCase()} in ${p.when}`).join(", ")} <Source href={gsocCalendar.timelineUrl} date={gsocCalendar.lastVerified} />.
          LFX: projects are posted on the portal a few weeks before each term; the next term is {nextTerm ? `${nextTerm.label}, starting ${fmt(nextTerm.start)}` : "listed on the portal"} <Source href={lfxCalendar.docsUrl} date={lfxCalendar.lastVerified} />.
        </>
      ),
    },
    {
      q: "Do I need to be a student?",
      a: (
        <ul className="list-disc space-y-1 pl-5">
          {PROGRAMS.map((p) => (
            <li key={p.id}>
              <span className="font-medium text-[var(--cine-fg)]">{p.name}:</span> {p.facts.eligibility.value}. <Source href={p.facts.eligibility.sourceUrl} date={p.facts.eligibility.lastVerified} />
            </li>
          ))}
        </ul>
      ),
    },
    {
      q: "How many projects can I apply to?",
      a: (
        <>
          GSoC: up to three proposals, and only one can be accepted <Source href="https://developers.google.com/open-source/gsoc/faq" date="2026-10-17" />.
          LFX: up to {lfxCalendar.applicationsPerTerm} applications per term; if more than one accepts you, you can only join one <Source href={lfxCalendar.docsUrl} date={lfxCalendar.lastVerified} />.
        </>
      ),
    },
    ...(proposals?.enabled
      ? [{
          q: "Where can I read accepted proposals?",
          a: (
            <>
              On the <Link href={proposals.href} className="underline underline-offset-4 text-[var(--cine-fg)]">proposals page</Link>, which indexes public archives of GSoC proposals and links to the original files. Read them for structure; never copy them.
            </>
          ),
        }]
      : []),
    {
      q: "What matters most for getting accepted?",
      a: "Showing up in the project's chat weeks before the deadline and getting one or two real fixes merged. Mentors pick people they have already worked with.",
    },
    {
      q: "Is OSSGrid the official application site?",
      a: (
        <>
          No. OSSGrid is a community-built index. You apply on each program&rsquo;s official site:{" "}
          {PROGRAMS.map((p, i) => (
            <span key={p.id}>
              {i > 0 && (i === PROGRAMS.length - 1 ? " and " : ", ")}
              <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--cine-fg)]">{p.name}</a>
            </span>
          ))}
          . {live.length} of them are indexed here today.
        </>
      ),
    },
  ];
  return items;
}

/** Common questions: serif heading, wide rows with separators, every fact sourced. Escape closes the open answer. */
export default function FirstTimerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = useFaqs();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <section id="faq" aria-labelledby="faq-title" className="cine cine-section">
      <div className="cine-wrap font-ui grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="faq-title" className="font-display cine-h2">common questions.</h2>
          <p className="cine-lede mt-6">Short answers with a source on every fact. The official docs have the rest.</p>
        </div>

        <div
          className="border-t border-[var(--cine-line-strong)]"
          onKeyDown={(e) => {
            if (e.key === "Escape" && openIndex !== null) {
              buttons.current[openIndex]?.focus();
              setOpenIndex(null);
            }
          }}
        >
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;
            return (
              <div key={item.q} className="border-b border-[var(--cine-line)]">
                <h3>
                  <button
                    ref={(el) => { buttons.current[idx] = el; }}
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cine-accent)] md:py-7"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span className={cn("text-[1.125rem] font-semibold leading-snug transition-colors md:text-[1.3rem]", isOpen ? "text-[var(--cine-fg)]" : "text-[var(--cine-fg-2)] group-hover:text-[var(--cine-fg)]")}>{item.q}</span>
                    <Plus size={20} className={cn("shrink-0 text-[var(--cine-fg-2)] transition-transform duration-300", isOpen && "rotate-45 text-[var(--cine-fg)]")} aria-hidden="true" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId} className="disclose" data-open={isOpen} inert={!isOpen}>
                  <div>
                    <div className="faq-answer max-w-[44rem] pb-7 text-base leading-relaxed text-[var(--cine-fg-2)] md:text-[1.05rem]">{item.a}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
