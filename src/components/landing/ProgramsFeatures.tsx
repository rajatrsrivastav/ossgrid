"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";
import { programs, upcomingPrograms } from "@/data/programs";
import { cn } from "@/lib/utils";

export function Programs() {
  return (
    <Section id="programs">
      <SectionHeading
        eyebrow="Programs"
        title="Two programs, one place to prepare."
        description="LFX is fully indexed today. GSoC organizations and past proposals are being added next."
      />

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {programs.map((p) => {
          const live = p.status === "live";
          return (
            <li
              key={p.id}
              className={cn("card flex flex-col p-5 md:p-6", live && "card-selected")}
              style={{ "--program-color": `var(${p.accentVar})` } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{p.sponsor}</p>
                  <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{p.name}</h3>
                </div>
                <span className={cn("pill", live ? "pill-success" : "pill-muted")}>
                  {live && <span className="pill-dot" aria-hidden="true" />}
                  {live ? "Indexed" : "Coming soon"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{p.description}</p>

              <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--border)]">
                {p.facts.map((f) => (
                  <div key={f.label} className="bg-[var(--bg-raised)] px-3 py-2.5">
                    <dt className="text-xs text-[var(--text-muted)]">{f.label}</dt>
                    <dd className="num mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-center justify-between gap-3">
                {live ? (
                  <Link href={p.href} className="btn btn-primary">
                    Browse {p.id.toUpperCase()} orgs <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ) : (
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Official {p.id.toUpperCase()} site <ExternalLink size={14} aria-hidden="true" />
                  </a>
                )}
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-muted)] underline underline-offset-4 hover:text-[var(--text-primary)]">
                  Source
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <p className="text-xs text-[var(--text-muted)] md:w-40 md:shrink-0">Also worth knowing</p>
        <ul className="flex flex-wrap gap-2">
          {upcomingPrograms.map((u) => (
            <li key={u.id}>
              <a
                href={u.href}
                target="_blank"
                rel="noopener noreferrer"
                title={u.blurb}
                className="chip h-8 px-3 text-sm hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                <span>{u.name}</span>
                <ExternalLink size={12} className="text-[var(--text-muted)]" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
