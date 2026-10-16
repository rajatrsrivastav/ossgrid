"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Section } from "./landing/Section";
import { SectionHeading } from "./landing/SectionHeading";
import { PROGRAMS, livePrograms, lfxCalendar, gsocCalendar } from "@/data/programs";
import { TOOL_PAGES } from "@/data/site";
import { cn } from "@/lib/utils";

const fmt = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

function Source({ href, date }: { href: string; date: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]" title={`Checked ${date}`}>
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
          {" "}{outreachy.name} is for {outreachy.facts.eligibility.value.toLowerCase()} <Source href={outreachy.facts.eligibility.sourceUrl} date={outreachy.facts.eligibility.lastVerified} />. Compare all of them in the Programs section above.
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
              <span className="font-medium text-[var(--text-primary)]">{p.name}:</span> {p.facts.eligibility.value}. <Source href={p.facts.eligibility.sourceUrl} date={p.facts.eligibility.lastVerified} />
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
              On the <Link href={proposals.href} className="underline underline-offset-4 text-[var(--text-primary)]">proposals page</Link>, which indexes public archives of GSoC proposals and links to the original files. Read them for structure; never copy them.
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
              <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">{p.name}</a>
            </span>
          ))}
          . {live.length} of them are indexed here today.
        </>
      ),
    },
  ];
  return items;
}

export default function FirstTimerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();
  const faqs = useFaqs();

  return (
    <Section id="faq">
      <SectionHeading eyebrow="FAQ" title="Common questions" align="center" description="Short answers with a source on every fact. The official docs have the rest." />

      <div className="mx-auto w-full max-w-3xl divide-y divide-[var(--border)] rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-card)]">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-6 px-5 py-4 text-left md:px-6"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className={cn("text-base font-medium", isOpen ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{item.q}</span>
                  <span className="icon-btn icon-btn-bordered h-8 w-8 shrink-0" aria-hidden="true">
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={panelId}
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="prose-measure px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)] md:px-6">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
