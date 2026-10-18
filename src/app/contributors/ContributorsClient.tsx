"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Contributor } from "@/lib/contributors";
import { creatorContributor, ossgridRepo } from "@/data/contributors";

export default function ContributorsClient({ initialContributors }: { initialContributors: Contributor[] }) {
  const [contributors, setContributors] = useState(initialContributors);
  const [stale, setStale] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contributors", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json() as { contributors: Contributor[]; stale: boolean };
        setContributors(data.contributors);
        setStale(data.stale);
      })
      .catch(() => { if (!controller.signal.aborted) setStale(true); });
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <p className="eyebrow mb-3">Community</p>
      <h1 className="display text-3xl font-semibold md:text-4xl">OSSGrid contributors</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">The people who help build and maintain OSSGrid. Contributions to the external projects we index are recognized by those projects separately.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/contribute" className="btn btn-primary">Start Contributing</Link>
        <a href={`https://github.com/${ossgridRepo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">View Contribution Guidelines</a>
        <a href="#past-contributors" className="btn btn-secondary">View Past Contributors</a>
      </div>
      <section id="past-contributors" className="mt-10 scroll-mt-24" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-semibold">Current and past contributors</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Recognition stays here even when someone is no longer active. This directory combines OSSGrid’s all-time GitHub history with maintainer-recognized contributions, and credits its creator.</p>
        {stale && <p role="status" className="mt-4 text-sm text-[var(--text-muted)]">GitHub refresh is unavailable. Showing our saved, verified contributor records.</p>}
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <li>
            <a href={creatorContributor.profileUrl} target="_blank" rel="noopener noreferrer" className="card card-interactive flex h-full items-center gap-3 p-4">
              <Image src={creatorContributor.avatarUrl} alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded-full bg-[var(--bg-raised)]" />
              <span className="min-w-0 flex-1">
                <span className="block break-words font-semibold">{creatorContributor.name}</span>
                <span className="num block truncate text-xs text-[var(--text-muted)]">@{creatorContributor.login}</span>
                <span className="mt-1 block text-xs text-[var(--text-secondary)]">Creator</span>
              </span>
              <ArrowUpRight size={15} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            </a>
          </li>
          {contributors.map((person) => <li key={person.id ?? person.login.toLowerCase()}>
            <a href={person.profileUrl} target="_blank" rel="noopener noreferrer" className="card card-interactive flex h-full items-center gap-3 p-4">
              <Image src={person.avatarUrl} alt="" width={48} height={48} unoptimized className="h-12 w-12 shrink-0 rounded-full bg-[var(--bg-raised)]" />
              <span className="min-w-0 flex-1">
                <span className="block break-words font-semibold">{person.name}</span>
                <span className="num block truncate text-xs text-[var(--text-muted)]">@{person.login}</span>
                {typeof person.contributions === "number" && <span className="mt-1 block text-xs text-[var(--text-secondary)]">{person.contributions} {person.contributions === 1 ? "commit" : "commits"} credited by GitHub</span>}
              </span>
              <ArrowUpRight size={15} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            </a>
          </li>)}
        </ul>
        <p className="mt-6 text-xs text-[var(--text-muted)]">Commit counts reflect GitHub’s latest available contributor data, not every kind of contribution. Bot accounts are excluded.</p>
      </section>
    </main>
  );
}
