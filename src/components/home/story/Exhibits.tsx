import Link from "next/link";
import type { Exhibit } from "@/lib/home-data";

const nf = new Intl.NumberFormat("en-US");

/** Two art-directed program exhibits with real numbers, sourced facts and real routes. */
export default function Exhibits({ exhibits }: { exhibits: Exhibit[] }) {
  return (
    <section id="live-programs" aria-label="Programs indexed today" className="cine cine-section !pt-0">
      <div className="cine-wrap flex flex-col gap-[clamp(96px,14vh,200px)]">
        {exhibits.map((ex) => (
          <article
            key={ex.id}
            aria-labelledby={`exhibit-${ex.id}`}
            className="cine-exhibit"
            style={{ "--program-color": `var(--program-${ex.id})` } as React.CSSProperties}
          >
            <div className="cine-exhibit__art">
              <picture>
                <source media="(max-width: 640px)" type="image/avif" srcSet={`/art/${ex.art}-mobile-780.avif 780w, /art/${ex.art}-mobile-1170.avif 1170w`} sizes="100vw" />
                <source media="(max-width: 640px)" type="image/webp" srcSet={`/art/${ex.art}-mobile-780.webp 780w, /art/${ex.art}-mobile-1170.webp 1170w`} sizes="100vw" />
                <source type="image/avif" srcSet={`/art/${ex.art}-960.avif 960w, /art/${ex.art}-1600.avif 1600w, /art/${ex.art}-2400.avif 2400w`} sizes="(min-width: 1320px) 1320px, 100vw" />
                <source type="image/webp" srcSet={`/art/${ex.art}-960.webp 960w, /art/${ex.art}-1600.webp 1600w, /art/${ex.art}-2400.webp 2400w`} sizes="(min-width: 1320px) 1320px, 100vw" />
                {/* Decorative render; the program is described in the text beside it. */}
                <img src={`/art/${ex.art}-1600.webp`} alt="" width={2400} height={1500} loading="lazy" decoding="async" />
              </picture>
              <div className="cine-exhibit__title font-ui">
                <p className="mb-3 text-sm text-[var(--cine-fg-2)]">Run by {ex.runBy}</p>
                <h3 id={`exhibit-${ex.id}`} className="font-display cine-h2 !text-[clamp(2.2rem,5.2vw,5.25rem)]">{ex.name}</h3>
              </div>
            </div>

            <div className="cine-exhibit__body font-ui">
              <div className="flex flex-col gap-8">
                <p className="text-base leading-relaxed text-[var(--cine-fg-2)] md:text-[1.1rem]">{ex.oneLiner}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={ex.href} className="cine-btn cine-btn--solid">{ex.ctaLabel}</Link>
                  <a href={ex.officialUrl} target="_blank" rel="noopener noreferrer" className="cine-btn cine-btn--line">Official site</a>
                </div>
              </div>

              <dl className="cine-numbers">
                {ex.numbers.map((n) => (
                  <div key={n.label}>
                    <dd className="font-display">{n.label === "first term" ? n.value : nf.format(n.value)}</dd>
                    <dt>{n.label}</dt>
                  </div>
                ))}
              </dl>

              <dl className="cine-facts">
                {ex.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>
                      {f.value}
                      {f.sourceUrl && (
                        <>
                          {" "}
                          <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--cine-fg-3)] underline underline-offset-4 hover:text-[var(--cine-fg)]" aria-label={`Source for ${ex.name} ${f.label.toLowerCase()}`}>source</a>
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
