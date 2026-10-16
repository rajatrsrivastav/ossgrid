"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Section } from "./landing/Section";
import { SectionHeading } from "./landing/SectionHeading";
import { lfxCalendar } from "@/data/programs";
import { cn } from "@/lib/utils";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

const FAQS = [
  {
    q: "How is LFX Mentorship different from Google Summer of Code?",
    a: "Both pay a stipend for a term of mentored open-source work. LFX is run by the Linux Foundation, has three terms a year, and is open to anyone 18 or older. GSoC is run by Google, happens once a year, and targets new contributors.",
  },
  {
    q: "How much is the LFX stipend?",
    a: `${usd(lfxCalendar.stipend.minUsd)} to ${usd(lfxCalendar.stipend.maxUsd)} per term. ${lfxCalendar.stipend.note} Full-time terms are ${lfxCalendar.durationWeeks.fullTime} weeks and part-time terms are ${lfxCalendar.durationWeeks.partTime} weeks. Checked ${lfxCalendar.lastVerified}.`,
  },
  {
    q: "Do I need to be a student?",
    a: `No. ${lfxCalendar.eligibility} Self-taught developers and career changers apply and get in every term.`,
  },
  {
    q: "How many projects can I apply to?",
    a: `Up to ${lfxCalendar.applicationsPerTerm} per term on the LFX portal. If more than one accepts you, you can only take one.`,
  },
  {
    q: "What matters most for getting accepted?",
    a: "Showing up in the project's chat weeks before the deadline and getting one or two real fixes merged. Mentors pick people they have already worked with.",
  },
  {
    q: "Is OSSGrid the official application site?",
    a: "No. OSSGrid is a community-built index of the public project files. You apply on the official LFX portal or the GSoC site.",
  },
];

export default function FirstTimerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <Section id="faq">
      <SectionHeading eyebrow="FAQ" title="Common questions" align="center" description="Short answers. The official docs have the rest." />

      <div className="mx-auto w-full max-w-3xl divide-y divide-[var(--border)] rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-card)]">
        {FAQS.map((item, idx) => {
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
                    <p className="prose-measure px-5 pb-5 text-sm leading-relaxed text-[var(--text-secondary)] md:px-6">{item.a}</p>
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
