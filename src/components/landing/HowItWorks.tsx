"use client";

import Link from "next/link";
import { Scale, SlidersHorizontal, FileSearch, Send, ArrowRight } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { ScrollReveal } from "./ScrollReveal";
import { livePrograms } from "@/data/programs";
import type { CombinedStats } from "@/components/home/HomePageClient";

export function HowItWorks({ combined }: { combined: CombinedStats }) {
  const live = livePrograms();
  const steps = [
    { icon: Scale, title: "Pick a program", body: "Compare stipend, length and eligibility side by side, with a source link on every fact." },
    { icon: SlidersHorizontal, title: "Search and filter", body: `One search box covers ${combined.orgLabel} organizations and ${combined.projectLabel} projects. Narrow by language, category, year and org size. Filters live in the URL, so you can share a view.` },
    { icon: FileSearch, title: "Read the org page", body: "Past projects by year, mentors' GitHub handles, ideas lists and public proposals, before you write a line." },
    { icon: Send, title: "Apply on the official site", body: "OSSGrid never takes applications. Every organization links to its official listing." },
  ];

  return (
    <Section id="how-it-works" className="border-b border-[var(--border)] bg-[var(--bg-raised)]">
      <SectionHeading eyebrow="How it works" title="From a long list to a short one." description="The data comes from official program sources. OSSGrid makes it searchable.">
        <div className="mt-2 flex flex-wrap gap-2">
          {live.map((p) => (
            <Link key={p.id} href={p.dashboardPath!} className="btn btn-secondary">
              Open the {p.shortName} index <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </SectionHeading>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <ScrollReveal key={s.title} delay={i * 0.06} distance={16} className="card flex flex-col p-5">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-primary)]">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="num text-xs text-[var(--text-muted)]">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
            </ScrollReveal>
          );
        })}
      </div>
    </Section>
  );
}
