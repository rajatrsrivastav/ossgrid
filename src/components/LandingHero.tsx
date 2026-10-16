"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SiteStats } from "@/lib/stats";
import type { FeaturedOrg } from "./home/HomePageClient";

interface LandingHeroProps {
  stats: SiteStats;
  featured: FeaturedOrg[];
}

export default function LandingHero({ stats, featured }: LandingHeroProps) {
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
            OSSGrid lists every LFX Mentorship organization since {stats.yearMin}, with projects, mentors and technologies you can filter in seconds. Free, no login.
          </p>
          <p className="num mt-3 text-sm text-[var(--text-muted)]">
            {stats.orgLabel} organizations · {stats.projectLabel} projects · {stats.yearMin}–{stats.yearMax}
          </p>
        </div>

        <div className="hero-enter hero-enter-2 mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link href="/lfx" className="btn btn-primary btn-lg">
            Browse LFX orgs <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/#playbook" className="btn btn-secondary btn-lg">
            Read the playbook
          </Link>
        </div>
      </div>

      {/* Preview: three real organizations from the data */}
      <div className="hero-enter hero-enter-3 relative mt-14 w-full md:mt-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20"
          style={{ backgroundImage: "url('/images/flower-wildflower.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg-base)] to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg-base)] to-transparent" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-16">
          <div className="panel overflow-hidden rounded-[var(--radius-hero)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-base)] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
              <span className="num ml-3 rounded-[var(--radius-chip)] border border-[var(--border)] bg-[var(--bg-input)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                ossgrid.tech/lfx
              </span>
            </div>
            <div className="grid gap-3 bg-[var(--bg-raised)] p-4 sm:p-6 md:grid-cols-3">
              {featured.map((org) => (
                <Link key={org.id} href={`/organization/${org.id}`} className="card card-interactive flex flex-col gap-3 p-4 text-left">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
                      <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={40} height={40} unoptimized className="h-full w-full object-contain p-1.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{org.name}</span>
                      <span className="block truncate text-xs text-[var(--text-muted)]">{org.category}</span>
                    </span>
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
