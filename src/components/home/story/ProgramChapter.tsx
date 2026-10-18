"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type { ChapterStep, Exhibit } from "@/lib/home-data";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");
const FRAMES = 40;

interface FrameState { t: number; year?: number; term?: string; lit?: number; explode?: number }
interface Manifest { frames: number; width: number; height: number; states: FrameState[] }

/** Short captions that change with scroll, like annotations beside the object. */
const CAPTIONS: Record<"gsoc" | "lfx", { until: number; text: string }[]> = {
  gsoc: [
    { until: 0.34, text: "Each stone is one summer. Its height is the number of organizations Google accepted that year." },
    { until: 0.7, text: "The light moves year by year. The lit stone is the year shown on the left." },
    { until: 1.01, text: "The most recent summers are the largest. Most of these organizations take part again." },
  ],
  lfx: [
    { until: 0.3, text: "Each ring is one mentorship term, oldest at the base. Its height is the projects that term ran." },
    { until: 0.6, text: "Terms light up in order as you scroll, from the pilot to the latest term." },
    { until: 1.01, text: "Pulled apart, the tower shows three terms a year since 2020." },
  ],
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

interface ProgramChapterProps {
  exhibit: Exhibit;
  steps: ChapterStep[];
  /** Mirrors the layout so the two chapters alternate sides. */
  flip?: boolean;
}

/**
 * One program, told as a pinned scene. On wide screens with motion allowed, the section is
 * several screens tall; scrolling scrubs a pre-rendered frame sequence on a canvas and the
 * readout shows the year or term in that frame. Elsewhere it is a still image with the same text.
 */
export default function ProgramChapter({ exhibit, steps, flip }: ProgramChapterProps) {
  const scene = exhibit.id;
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const [active, setActive] = useState(false);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [frame, setFrame] = useState(FRAMES - 1);

  // Scroll scenes run only on wide screens with motion allowed.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px) and (prefers-reduced-motion: no-preference)");
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/art/seq/${scene}-${theme}/manifest.json`)
      .then((r) => r.json())
      .then((m: Manifest) => { if (!cancelled) setManifest(m); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [scene, theme]);

  // Load frames when the chapter comes near, draw the frame for the current scroll position.
  useEffect(() => {
    if (!active) return;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: (HTMLImageElement | null)[] = Array(FRAMES).fill(null);
    const ready: boolean[] = Array(FRAMES).fill(false);
    let loading = false;
    let current = -1;
    let raf = 0;
    const width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1400 ? 1600 : 960;
    const src = (i: number) => `/art/seq/${scene}-${theme}/${String(i).padStart(3, "0")}-${width}.webp`;

    const draw = (i: number) => {
      // Nearest loaded frame, so the scene never goes blank while frames stream in.
      let k = i;
      for (let d = 0; d < FRAMES; d++) {
        if (ready[i - d]) { k = i - d; break; }
        if (ready[i + d]) { k = i + d; break; }
      }
      const img = images[k];
      if (!img || !ready[k]) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      // Cover-fit, like object-fit: cover.
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    };

    const load = () => {
      if (loading) return;
      loading = true;
      // First and last frames first, then the rest in order.
      const order = [0, FRAMES - 1, ...Array.from({ length: FRAMES - 2 }, (_, i) => i + 1)];
      for (const i of order) {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => { ready[i] = true; if (Math.abs(i - current) <= 2 || current === -1) { current = -1; tick(); } };
        img.src = src(i);
        images[i] = img;
      }
    };

    const tick = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      const i = Math.round(p * (FRAMES - 1));
      if (i !== current) {
        current = i;
        draw(i);
        setFrame(i);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { current = -1; onScroll(); };

    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) load(); }, { rootMargin: "150% 0px" });
    io.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    tick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, scene, theme]);

  const state = manifest?.states[active ? frame : FRAMES - 1];
  const t = state?.t ?? 1;
  const stepIndex = useMemo(() => {
    if (!state) return steps.length - 1;
    const key = scene === "gsoc" ? String(state.year) : state.term;
    const i = steps.findIndex((s) => s.key === key);
    return i === -1 ? steps.length - 1 : i;
  }, [state, steps, scene]);
  const step = steps[stepIndex];
  const caption = CAPTIONS[scene].find((c) => t < c.until)?.text ?? CAPTIONS[scene][CAPTIONS[scene].length - 1].text;
  const max = Math.max(...steps.map((s) => s.value));
  // Facts arrive in the second half of the scene, so the opening frames stay quiet.
  const factsIn = active ? smooth(0.45, 0.7, t) : 1;
  const last = String(FRAMES - 1).padStart(3, "0");

  return (
    <article
      aria-labelledby={`chapter-${scene}`}
      className={cn("chapter", active && "chapter--live")}
      style={{ "--program-color": `var(--program-${scene})` } as React.CSSProperties}
    >
      <div ref={trackRef} className="chapter__track">
        <div className="chapter__stage">
          {/* Still frame for small screens, reduced motion and before the canvas has drawn. */}
          <picture className="chapter__still">
            <img className="art-dark" src={`/art/seq/${scene}-dark/${last}-960.webp`} srcSet={`/art/seq/${scene}-dark/${last}-960.webp 960w, /art/seq/${scene}-dark/${last}-1600.webp 1600w`} sizes="100vw" alt="" width={1600} height={1000} loading="lazy" decoding="async" />
            <img className="art-light" src={`/art/seq/${scene}-light/${last}-960.webp`} srcSet={`/art/seq/${scene}-light/${last}-960.webp 960w, /art/seq/${scene}-light/${last}-1600.webp 1600w`} sizes="100vw" alt="" width={1600} height={1000} loading="lazy" decoding="async" />
          </picture>
          {active && <canvas ref={canvasRef} className="chapter__canvas" aria-hidden="true" />}

          <div className={cn("chapter__overlay cine-wrap font-ui", flip && "chapter__overlay--flip")}>
            <div className="chapter__copy">
              <p className="text-sm text-[var(--cine-fg-2)]">Run by {exhibit.runBy}</p>
              <h3 id={`chapter-${scene}`} className="font-display cine-h2 mt-3">{exhibit.name}</h3>
              <p className="mt-5 max-w-[30rem] text-base leading-relaxed text-[var(--cine-fg-2)] md:text-[1.1rem]">{exhibit.oneLiner}</p>

              {/* Readout: the year or term in the current frame, with its real count. */}
              <div className="chapter__readout mt-8" aria-live="off">
                <p className="text-sm text-[var(--cine-fg-3)]">{step.label}</p>
                <p className="mt-1 flex items-baseline gap-3">
                  <strong className="font-display text-[clamp(2.6rem,4.4vw,4.25rem)] font-bold leading-none tracking-[-0.02em] text-[var(--cine-fg)]">{nf.format(step.value)}</strong>
                  <span className="text-base text-[var(--cine-fg-2)]">{step.unit}</span>
                </p>
                <div
                  className="chapter__bars mt-5"
                  role="img"
                  aria-label={`${step.unit} per ${scene === "gsoc" ? "year" : "term"}: ${steps.map((s) => `${s.label} ${s.value}`).join(", ")}`}
                >
                  {steps.map((s, i) => (
                    <span key={s.key} data-on={i <= stepIndex} data-now={i === stepIndex} style={{ height: `${12 + (s.value / max) * 88}%` }} />
                  ))}
                </div>
                <p className="mt-2 flex justify-between text-xs text-[var(--cine-fg-3)]">
                  <span>{steps[0].label}</span>
                  <span>{steps[steps.length - 1].label}</span>
                </p>
              </div>
              {active && <p className="chapter__caption mt-6 max-w-[28rem] text-[0.95rem] leading-relaxed text-[var(--cine-fg-2)]">{caption}</p>}
            </div>

            <div className="chapter__facts" style={{ opacity: factsIn, transform: `translateY(${(1 - factsIn) * 24}px)` }}>
              <dl className="cine-numbers">
                {exhibit.numbers.map((n) => (
                  <div key={n.label}>
                    <dd className="font-display">{n.label === "first term" ? n.value : nf.format(n.value)}</dd>
                    <dt>{n.label}</dt>
                  </div>
                ))}
              </dl>
              <dl className="cine-facts mt-8">
                {exhibit.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>
                      {f.value}
                      {f.sourceUrl && (
                        <>
                          {" "}
                          <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--cine-fg-3)] underline underline-offset-4 hover:text-[var(--cine-fg)]" aria-label={`Source for ${exhibit.name} ${f.label.toLowerCase()}`}>source</a>
                        </>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={exhibit.href} className="cine-btn cine-btn--solid">{exhibit.ctaLabel}</Link>
                <a href={exhibit.officialUrl} target="_blank" rel="noopener noreferrer" className="cine-btn cine-btn--line">Official site</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
