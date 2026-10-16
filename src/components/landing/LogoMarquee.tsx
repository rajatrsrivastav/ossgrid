"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProgramId } from "@/data/programs";

export interface MarqueeOrg {
  name: string;
  /** Empty when no logo is available; a letter tile is shown instead. */
  logoUrl: string;
  program: ProgramId;
}

function Pill({ org }: { org: MarqueeOrg }) {
  const [broken, setBroken] = useState(false);
  const showLogo = org.logoUrl && !broken;
  return (
    <li className="mx-1.5 flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--bg-raised)] px-3 py-1.5 whitespace-nowrap">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-chip)] border border-[var(--border)] bg-white" aria-hidden="true">
        {showLogo ? (
          <Image src={org.logoUrl} alt="" width={24} height={24} unoptimized className="h-full w-full object-contain p-0.5" onError={() => setBroken(true)} />
        ) : (
          <span className="num text-xs font-semibold text-[#1a1917]">{org.name[0]}</span>
        )}
      </span>
      <span className="text-sm font-medium text-[var(--text-secondary)]">{org.name}</span>
    </li>
  );
}

/** Organizations with the most projects across live programs, straight from the data. */
export function LogoMarquee({ orgs }: { orgs: MarqueeOrg[] }) {
  if (!orgs.length) return null;
  const half = Math.ceil(orgs.length / 2);
  const rows = [orgs.slice(0, half), orgs.slice(half)];

  return (
    <div className="relative w-full overflow-hidden py-8" aria-label="Organizations in the index">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/5 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />
      {rows.map((row, i) => (
        <div key={i} className={i === 0 ? "mb-3 flex w-full overflow-hidden" : "flex w-full overflow-hidden"}>
          <div className={i === 0 ? "flex min-w-full animate-marquee" : "flex min-w-full animate-marquee-reverse"}>
            {/* Three copies keep the loop continuous; only the first is exposed to assistive tech. */}
            {[0, 1, 2].map((copy) => (
              <ul key={copy} className="flex" aria-hidden={copy > 0 ? "true" : undefined} inert={copy > 0 ? true : undefined}>
                {row.map((org, j) => (
                  <Pill key={`${copy}-${j}`} org={org} />
                ))}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
