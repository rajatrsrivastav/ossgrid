"use client";

function Pill({ name }: { name: string }) {
  return (
    <li className="mx-1.5 flex shrink-0 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-2 whitespace-nowrap">
      <span className="num flex h-5 w-5 items-center justify-center rounded-[var(--radius-chip)] border border-[var(--border)] bg-[var(--bg-input)] text-xs font-semibold text-[var(--accent)]" aria-hidden="true">
        {name[0]}
      </span>
      <span className="text-sm font-medium text-[var(--text-secondary)]">{name}</span>
    </li>
  );
}

/** Organizations with the most projects, straight from the data. */
export function LogoMarquee({ names }: { names: string[] }) {
  if (!names.length) return null;
  const half = Math.ceil(names.length / 2);
  const rows = [names.slice(0, half), names.slice(half)];

  return (
    <div className="relative w-full overflow-hidden py-8" aria-label="Organizations in the index">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/5 bg-gradient-to-r from-[var(--bg-base)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/5 bg-gradient-to-l from-[var(--bg-base)] to-transparent" />
      {rows.map((row, i) => (
        <div key={i} className={i === 0 ? "mb-3 flex w-full overflow-hidden" : "flex w-full overflow-hidden"}>
          <ul className={i === 0 ? "flex min-w-full animate-marquee" : "flex min-w-full animate-marquee-reverse"} aria-hidden={i === 1 ? "true" : undefined}>
            {[...row, ...row, ...row].map((name, j) => (
              <Pill key={`${i}-${j}`} name={name} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
