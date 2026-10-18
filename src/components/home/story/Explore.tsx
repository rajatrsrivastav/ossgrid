"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { livePrograms } from "@/data/programs";
import type { ShowcaseOrg } from "@/lib/home-data";
import { cn } from "@/lib/utils";
import Showcase from "./Showcase";

const nf = new Intl.NumberFormat("en-US");

interface ExploreProps {
  insights: { value: number; label: string; href: string }[];
  topTech: { label: string; count: number }[];
  showcase: ShowcaseOrg[];
  span: number[];
}

/**
 * The practical layer of the story: search straight into a dashboard, jump in by technology,
 * three facts that change how you shortlist, then long-running organizations as previews.
 */
export default function Explore({ insights, topTech, showcase, span }: ExploreProps) {
  const router = useRouter();
  const live = livePrograms();
  const [target, setTarget] = useState(live[0]?.dashboardPath ?? "/gsoc");
  const [q, setQ] = useState("");

  return (
    <section id="explore" aria-labelledby="explore-title" className="cine cine-section">
      <div className="cine-wrap font-ui">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h2 id="explore-title" className="font-display cine-h2">explore organizations.</h2>
          <p className="cine-lede">
            Search both indexes by name, language or topic. Every result opens a page with the organization&rsquo;s years, projects and links.
          </p>
        </div>

        {/* Search goes straight to the chosen dashboard with the query in its URL. */}
        <form
          role="search"
          aria-label="Search organizations"
          className="mt-12 flex flex-col gap-3 border-y border-[var(--cine-line-strong)] py-5 md:flex-row md:items-center"
          onSubmit={(e) => { e.preventDefault(); router.push(q.trim() ? `${target}?q=${encodeURIComponent(q.trim())}` : target); }}
        >
          <label className="flex flex-1 items-center gap-3">
            <Search size={22} className="shrink-0 text-[var(--cine-fg-3)]" aria-hidden="true" />
            <span className="sr-only">Organization, technology or topic</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search an organization, language or topic"
              className="w-full bg-transparent py-2 text-lg text-[var(--cine-fg)] outline-none placeholder:text-[var(--cine-fg-3)] md:text-2xl"
            />
          </label>
          <fieldset className="flex items-center gap-1 self-start rounded-[3px] border border-[var(--cine-line-strong)] p-1 md:self-auto">
            <legend className="sr-only">Program</legend>
            {live.map((p) => (
              <label key={p.id} className={cn("cursor-pointer rounded-[2px] px-4 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--cine-accent)]", target === p.dashboardPath ? "bg-[var(--cine-fg)] text-[var(--cine-bg)]" : "text-[var(--cine-fg-2)] hover:text-[var(--cine-fg)]")}>
                <input type="radio" name="program" value={p.dashboardPath} checked={target === p.dashboardPath} onChange={() => setTarget(p.dashboardPath!)} className="sr-only" />
                {p.shortName}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="cine-btn cine-btn--solid">Search</button>
        </form>

        {/* Popular technologies across GSoC, each a filtered dashboard. */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm text-[var(--cine-fg-3)]">Popular in GSoC</span>
          {topTech.slice(0, 8).map((t) => (
            <Link key={t.label} href={`/gsoc?tech=${encodeURIComponent(t.label)}`} className="cine-chip">
              {t.label} <span className="num text-[var(--cine-fg-3)]">{t.count}</span>
            </Link>
          ))}
        </div>

        {/* Insights: numbers from the index that change how you shortlist. */}
        <ul className="mt-[clamp(56px,9vh,104px)] grid gap-px overflow-hidden rounded-[4px] border border-[var(--cine-line)] bg-[var(--cine-line)] md:grid-cols-3" aria-label="From the index">
          {insights.map((ins) => (
            <li key={ins.href} className="bg-[var(--cine-bg)]">
              <Link href={ins.href} className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-[var(--cine-raised)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--cine-accent)] md:p-8">
                <strong className="font-display text-[clamp(2.5rem,4vw,3.75rem)] font-bold leading-none tracking-[-0.02em] text-[var(--cine-fg)]">{nf.format(ins.value)}</strong>
                <span className="text-base leading-relaxed text-[var(--cine-fg-2)]">{ins.label}</span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-[var(--cine-fg)]">
                  See them <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mb-10 mt-[clamp(72px,11vh,128px)] grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h3 className="font-display text-[clamp(1.9rem,3.2vw,3rem)] font-bold leading-[1.02] tracking-[-0.02em] text-[var(--cine-fg)]">organizations that keep coming back.</h3>
          <p className="max-w-[36rem] text-base leading-relaxed text-[var(--cine-fg-2)]">
            A steady organization has mentors who know the program and maintainers who review quickly. Each square is one year. A lit square means the organization took part that year.
          </p>
        </div>
        <Showcase orgs={showcase} span={span} />
      </div>
    </section>
  );
}
