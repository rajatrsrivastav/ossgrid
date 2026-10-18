"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageMasthead from "@/components/PageMasthead";
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
    <main className="flex w-full flex-1 flex-col">
    <PageMasthead
      crumbs={[{ label: "Home", href: "/" }, { label: "Contributors" }]}
      label="Community"
      title="OSSGrid contributors"
      lede={<p>The people who help build and maintain OSSGrid. Contributions to the external projects we index are recognized by those projects separately.</p>}
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/contribute" className="btn btn-primary">Start contributing</Link>
        <a href={`https://github.com/${ossgridRepo}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Contribution guidelines</a>
      </div>
    </PageMasthead>
    <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <section id="past-contributors" className="scroll-mt-24" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-semibold">Current and past contributors</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Recognition stays here even when someone is no longer active. This directory combines OSSGrid’s all-time GitHub history with maintainer-recognized contributions.</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Creator</span>
          <a href={creatorContributor.profileUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">{creatorContributor.name}</a>
          <span>is credited here, separately from the contributor directory below.</span>
        </p>
        {stale && <p role="status" className="mt-4 text-sm text-[var(--text-muted)]">GitHub refresh is unavailable. Showing our saved, verified contributor records.</p>}
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
    </main>
  );
}
