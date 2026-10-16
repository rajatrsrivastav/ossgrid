"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, FileSearch, Send, ArrowRight } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { ScrollReveal } from "./ScrollReveal";
import type { SiteStats } from "@/lib/stats";

export function HowItWorks({ stats }: { stats: SiteStats }) {
  const steps = [
    {
      icon: Search,
      title: "Search everything at once",
      body: `One search box covers ${stats.orgLabel} organizations and ${stats.projectLabel} projects, including mentor names and skills.`,
    },
    {
      icon: SlidersHorizontal,
      title: "Filter by what you already know",
      body: "Narrow by language, category, year and organization size. Filters live in the URL, so you can share a view.",
    },
    {
      icon: FileSearch,
      title: "Read the org page before you apply",
      body: "Each page shows past projects by term, mentors with GitHub handles, and the skills that come up most.",
    },
    {
      icon: Send,
      title: "Apply on the official portal",
      body: "OSSGrid never takes applications. Every project links to its official listing and source file.",
    },
  ];

  return (
    <Section id="how-it-works" className="border-y border-[var(--border)] bg-[var(--bg-raised)]">
      <SectionHeading eyebrow="How it works" title="From a long list to a short one." description="The data comes from the official project files. OSSGrid makes it searchable.">
        <Link href="/lfx" className="btn btn-secondary mt-2">
          Open the LFX index <ArrowRight size={15} aria-hidden="true" />
        </Link>
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
