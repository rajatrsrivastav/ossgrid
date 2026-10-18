import Link from "next/link";
import Image from "next/image";
import type { ShowcaseOrg } from "@/lib/home-data";
import { getProgram } from "@/data/programs";
import { cn, sanitizeDescription, truncate } from "@/lib/utils";

interface ShowcaseProps {
  orgs: ShowcaseOrg[];
  /** Years drawn in each tile's activity strip, oldest first. */
  span: number[];
}

/** Long-running organizations from both programs, as editorial tiles with real history. */
export default function Showcase({ orgs, span }: ShowcaseProps) {
  return (
        <ul className="cine-showcase font-ui" aria-label="Organizations that keep coming back">
          {orgs.map((org, i) => {
            const program = getProgram(org.program)!;
            const large = i === 0;
            return (
              <li key={org.id} className={cn("cine-tile", large && "md:grid md:grid-cols-[1fr_1.1fr] md:gap-x-16")} style={{ "--program-color": `var(--program-${org.program})` } as React.CSSProperties}>
                <div className="flex items-start justify-between gap-4">
                  <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white", large ? "h-20 w-20 md:h-28 md:w-28" : "h-14 w-14")}>
                    <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={112} height={112} unoptimized className="h-full w-full object-contain p-2" />
                  </span>
                  <span className="text-right text-sm leading-snug text-[var(--cine-fg-2)]">
                    {program.name}
                    <br />
                    {org.category}
                  </span>
                </div>

                <div>
                  <h3 className={cn("font-display font-bold leading-[1.02] tracking-[-0.02em] text-[var(--cine-fg)]", large ? "text-[clamp(2rem,3.4vw,3.25rem)]" : "text-[1.75rem]")}>
                    <Link href={org.href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">{org.name}</Link>
                  </h3>
                  <p className="mt-2 text-[0.95rem] text-[var(--cine-fg-2)]">{org.note}</p>
                </div>

                {large && org.description && <p className="max-w-[34rem] text-base leading-relaxed text-[var(--cine-fg-2)]">{truncate(sanitizeDescription(org.description, org.name), 220)}</p>}

                <div className="cine-years" role="img" aria-label={`Years active: ${org.activeYears.join(", ")}`}>
                  {span.map((y) => (
                    <span key={y} data-on={org.activeYears.includes(y)} title={String(y)} />
                  ))}
                </div>

                {(large || org.recentProjects.length > 0) && (
                  <ul className={cn("flex flex-col gap-2 border-t border-[var(--cine-line)] pt-4 text-sm", !large && "hidden md:flex")}>
                    {org.recentProjects.slice(0, large ? 3 : 1).map((p) => (
                      <li key={p.title} className="flex items-baseline justify-between gap-4">
                        <span className="text-[var(--cine-fg)]">{p.title}</span>
                        <span className="num shrink-0 text-[var(--cine-fg-2)]">{p.year}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-auto flex items-baseline gap-2 text-[0.95rem] text-[var(--cine-fg-2)]">
                  <strong className="font-display text-2xl font-bold text-[var(--cine-fg)]">{org.projectCount}</strong> projects across {org.years} {org.years === 1 ? "year" : "years"}
                </p>
              </li>
            );
          })}
        </ul>
  );
}
