"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, GitPullRequest, FileText, CheckCircle2, ArrowRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Section } from "./landing/Section";
import { SectionHeading } from "./landing/SectionHeading";
import { cn } from "@/lib/utils";
import { lfxCalendar } from "@/data/programs";

const phases = [
  {
    id: "01",
    title: "Pick a community, not an issue",
    icon: Users,
    body: "Join the chat before you touch code. Watch how fast maintainers review pull requests, whether mentors from past terms still show up, and how many projects the org has run. The org pages here show years active and projects per year so you can tell a steady org from a one-off.",
    tip: "Shortlist two or three orgs whose stack you can already read, not the one with the biggest name.",
    checklist: ["Join the org's Slack or Discord", "Read the last 20 merged pull requests", "Check mentor activity on GitHub"],
    cta: { label: "Browse LFX orgs", href: "/lfx" },
  },
  {
    id: "02",
    title: "Contribute before you apply",
    icon: GitPullRequest,
    body: "Selection is mostly decided before applications open. Reproduce a real bug, fix it, test it on every platform the project targets, and open a pull request. Then take the review seriously. One merged fix with a good review thread is worth more than ten drive-by typo patches.",
    tip: "Many strong orgs never label good-first-issues. Read open issues and ask in chat which ones are wanted.",
    checklist: ["Set the project up locally", "Fix and test one real issue", "Respond to every review comment within a day"],
    cta: { label: "See which orgs are active this year", href: "/lfx?years=2026" },
  },
  {
    id: "03",
    title: "Write a proposal with a schedule",
    icon: FileText,
    body: `Apply on the official LFX portal. Mentors look for a clear problem statement, a week-by-week plan with deliverables they can check, links to your merged work in their repo, and how you will communicate. You can submit up to ${lfxCalendar.applicationsPerTerm} applications per term.`,
    tip: "Reviewers notice communication, testing and reliability over months. Pull request count on its own is not a signal.",
    checklist: ["Weekly milestones for 12 weeks", "Links to your merged pull requests", "Your availability and timezone"],
    cta: { label: "Open the LFX portal", href: lfxCalendar.portalUrl, external: true },
  },
];

export default function FirstTimerGuide() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const phase = phases[active];
  const Icon = phase.icon;

  return (
    <Section id="playbook" className="border-t border-[var(--border)] bg-[var(--bg-raised)]">
      <SectionHeading
        eyebrow="Contributor playbook"
        title="How people actually get selected."
        description="Not a lottery. Three phases, in order. Based on what mentors say they look for."
        align="center"
      />

      <div className="mx-auto max-w-4xl">
        {/* Phase tabs */}
        <div role="tablist" aria-label="Playbook phases" className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          {phases.map((p, i) => {
            const isActive = i === active;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`phase-${p.id}`}
                id={`tab-${p.id}`}
                onClick={() => setActive(i)}
                className={cn(
                  "card flex items-center gap-3 px-4 py-3 text-left transition-colors",
                  isActive ? "card-selected" : "card-interactive"
                )}
              >
                <span className={cn("num text-xs font-semibold", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}>{p.id}</span>
                <span className={cn("text-sm font-semibold", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>{p.title}</span>
              </button>
            );
          })}
        </div>

        <div className="panel overflow-hidden p-6 md:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={phase.id}
              id={`phase-${phase.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${phase.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid gap-8 md:grid-cols-[1.6fr_1fr]"
            >
              <div className="flex flex-col">
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{phase.title}</h3>
                <p className="prose-measure mt-3 text-base leading-relaxed text-[var(--text-secondary)]">{phase.body}</p>
                <p className="mt-5 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-base)] p-4 text-sm text-[var(--text-primary)]">
                  {phase.tip}
                </p>
                <div className="mt-6">
                  {phase.cta.external ? (
                    <a href={phase.cta.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      {phase.cta.label} <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link href={phase.cta.href} className="btn btn-primary">
                      {phase.cta.label} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <p className="eyebrow mb-4">Checklist</p>
                <ul className="space-y-3">
                  {phase.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
