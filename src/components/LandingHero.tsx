"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { FeaturedOrg, CombinedStats } from "./home/HomePageClient";
import { getProgram, livePrograms, type ProgramId } from "@/data/programs";
import { cn } from "@/lib/utils";

interface LandingHeroProps {
  combined: CombinedStats;
  featured: Record<string, FeaturedOrg[]>;
  ctaOrder: ProgramId[];
}

const ROTATE_MS = 6000;

export default function LandingHero({ combined, featured, ctaOrder }: LandingHeroProps) {
  const live = livePrograms();
  const tabs = ctaOrder.map((id) => getProgram(id)!).filter(Boolean);
  const [active, setActive] = useState<ProgramId>(tabs[0]?.id ?? "gsoc");
  const [paused, setPaused] = useState(false);

  // Auto-rotate the preview between live programs; pause on hover/focus; off under reduced motion.
  useEffect(() => {
    if (tabs.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setActive((current) => {
        const i = tabs.findIndex((t) => t.id === current);
        return tabs[(i + 1) % tabs.length].id;
      });
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [tabs, paused]);

  const activeProgram = getProgram(active)!;
  const cards = featured[active] ?? [];
  const [primary, secondary] = tabs;
  const nf = new Intl.NumberFormat("en-US");

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--bg-base)] pt-16 text-center sm:pt-20 md:pt-28">
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="hero-enter flex max-w-4xl flex-col items-center">
          <p className="eyebrow mb-5">Open-source mentorships, indexed</p>
          <h1 className="display text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl md:text-6xl lg:text-[4rem]">
            Find the org you&rsquo;ll get into.
            <span className="block text-[var(--text-secondary)]">Then prepare like you mean it.</span>
          </h1>
          <p className="prose-measure mt-6 text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            OSSGrid indexes {live.map((p) => p.name).join(" and ")} organizations, past projects, mentors and accepted proposals in one place. More programs are on the way. Free, no login.
          </p>
          <p className="num mt-3 text-sm text-[var(--text-muted)]">
            {nf.format(combined.orgCount)} organizations · {nf.format(combined.projectCount)} projects · {combined.liveCount} programs live
          </p>
        </div>

        <div className="hero-enter hero-enter-2 mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          {primary && (
            <Link href={primary.dashboardPath!} className="btn btn-primary btn-lg">
              Browse {primary.shortName} orgs <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
          {secondary && (
            <Link href={secondary.dashboardPath!} className="btn btn-secondary btn-lg">
              Browse {secondary.shortName} orgs
            </Link>
          )}
          <Link href="/#playbook" className="btn btn-ghost btn-lg">
            Read the playbook
          </Link>
        </div>
      </div>

      {/* Preview: real organizations from the data, one program at a time */}
      <div className="hero-enter hero-enter-3 relative mt-14 w-full md:mt-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20"
          style={{ backgroundImage: "url('/images/flower-wildflower.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-base)] to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-base)] to-transparent" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-16">
          <div
            className="panel overflow-hidden rounded-[var(--radius-hero)] shadow-[var(--shadow-lg)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-base)] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="num ml-3 rounded-[var(--radius-chip)] border border-[var(--border)] bg-[var(--bg-input)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                ossgrid.tech{activeProgram.dashboardPath}
              </span>
              <div className="ml-auto flex items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--bg-input)] p-0.5" role="tablist" aria-label="Preview program">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={t.id === active}
                    aria-controls="hero-preview-panel"
                    onClick={() => setActive(t.id)}
                    className={cn(
                      "h-7 rounded-[6px] px-2.5 text-xs font-medium transition-colors",
                      t.id === active ? "bg-[var(--bg-card-hover)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {t.shortName}
                  </button>
                ))}
              </div>
            </div>
            <div id="hero-preview-panel" role="tabpanel" className="grid gap-3 bg-[var(--bg-raised)] p-4 sm:p-6 md:grid-cols-3">
              {cards.map((org) => (
                <Link key={org.id} href={org.href} className="card card-interactive flex flex-col gap-3 p-4 text-left" style={{ "--program-color": `var(${activeProgram.accentVar})` } as React.CSSProperties}>
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
                      <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={40} height={40} unoptimized className="h-full w-full object-contain p-1.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{org.name}</span>
                      <span className="block truncate text-xs text-[var(--text-muted)]">{org.category}</span>
                    </span>
                    <span className="chip chip-mono shrink-0" style={{ color: "var(--program-color)" }}><span>{activeProgram.shortName}</span></span>
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {org.technologies.map((t) => (
                      <span key={t} className="chip chip-mono"><span>{t}</span></span>
                    ))}
                  </span>
                  <span className="num mt-auto flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span><strong className="font-semibold text-[var(--text-primary)]">{org.projectCount}</strong> projects · {org.years} years</span>
                    <ArrowUpRight size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
