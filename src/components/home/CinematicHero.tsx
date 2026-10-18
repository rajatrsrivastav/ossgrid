"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import type { StagedOrg } from "@/lib/home-data";
import { getProgram } from "@/data/programs";

export interface HeroCounts {
  gsocOrgs: number;
  gsocSince: number;
  lfxOrgs: number;
  lfxSince: number;
  projects: number;
}

interface CinematicHeroProps {
  counts: HeroCounts;
  /** The mission statement that rises over the city as the hero scrolls. */
  mission: { orgs: string; projects: string; since: number };
  /** Real organizations staged in the scene, already ordered. */
  staged: StagedOrg[];
  /** Blurred inline placeholders shown until the artwork loads. */
  lqip: { desktop: string; mobile: string; lightDesktop: string; lightMobile: string };
}

const nf = new Intl.NumberFormat("en-US");
const FRAMES = { desktop: 48, mobile: 32 } as const;
/** Share of the sequence the intro plays on load, before any scrolling. */
const INTRO = 0.1;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Home hero. The artwork is a contribution graph built as architecture, sized from real GSoC
 * organizations (scripts/art/hero-scene.html). With motion allowed, the hero pins for a while:
 * a short intro pushes the camera in on load, then scrolling flies it over the graph while
 * contributions light up from near to far (pre-rendered frames on a canvas). The headline lifts
 * away and the mission statement rises over the city, word by word. With reduced motion it is the still poster, which is frame 0.
 */
export default function CinematicHero({ counts, staged, lqip, mission }: CinematicHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "light" : "dark";
  const [live, setLive] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const update = () => setLive(mq.matches && !saveData);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!live) return;
    const track = trackRef.current, stage = stageRef.current, canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!track || !stage || !canvas || !ctx) return;

    // Portrait screens get the tall mobile frames; others the wide set at a size that fits.
    const variant = window.innerWidth / window.innerHeight < 0.9 ? "mobile" : "desktop";
    const count = FRAMES[variant];
    const width = variant === "mobile" ? 720 : window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1300 ? 1920 : 1080;
    const dir = `/art/seq/hero-${variant}-${theme}`;
    const images: HTMLImageElement[] = [];
    const ready: boolean[] = Array(count).fill(false);
    let intro = 0;
    let current = -1;
    let raf = 0;
    let introRaf = 0;
    let cancelled = false;

    const draw = (i: number) => {
      let k = -1;
      for (let d = 0; d < count; d++) {
        if (ready[i - d]) { k = i - d; break; }
        if (ready[i + d]) { k = i + d; break; }
      }
      if (k === -1) return;
      const img = images[k];
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      // Cover-fit anchored to the bottom, like the poster (object-position: center bottom).
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, h - dh, dw, dh);
      setDrawn(true);
    };

    const tick = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
      const t = intro + p * (1 - INTRO);
      const i = Math.round(t * (count - 1));
      if (i !== current) { current = i; draw(i); }
      // Choreography as CSS variables: the headline lifts away, the totals take over.
      const out = smooth(0.03, 0.36, p);
      stage.style.setProperty("--hero-out", out.toFixed(4));
      const stat = smooth(0.34, 0.5, p);
      stage.style.setProperty("--hero-stat", stat.toFixed(4));
      // Mission words brighten one by one while the camera keeps flying.
      stage.style.setProperty("--hero-words", smooth(0.42, 0.9, p).toFixed(4));
      stage.dataset.mission = stat > 0.6 ? "true" : "false";
      stage.style.setProperty("--hero-cue", (1 - smooth(0, 0.06, p)).toFixed(4));
      stage.style.setProperty("--hero-p", p.toFixed(4));
      stage.style.setProperty("--hero-bar", (smooth(0, 0.04, p) * (1 - smooth(0.85, 1, p))).toFixed(4));
      // Once the headline has gone, its links stop taking clicks and focus moves past them visually.
      stage.dataset.out = out > 0.85 ? "true" : "false";
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { current = -1; onScroll(); };

    // Intro: a slow push-in over the first frames once they are loaded, only from the top.
    const playIntro = () => {
      if (window.scrollY > 40) { intro = INTRO; onScroll(); return; }
      const t0 = performance.now();
      const step = (now: number) => {
        const u = Math.min(1, (now - t0) / 2200);
        intro = INTRO * (1 - Math.pow(1 - u, 3));
        current = -1;
        tick();
        if (u < 1 && !cancelled) introRaf = requestAnimationFrame(step);
      };
      introRaf = requestAnimationFrame(step);
    };

    // Load order: the intro frames, then every fourth frame, then the rest.
    const introFrames = Math.ceil(INTRO * (count - 1)) + 1;
    const order = [...Array.from({ length: introFrames }, (_, i) => i)];
    for (let i = introFrames; i < count; i += 4) order.push(i);
    for (let i = introFrames; i < count; i++) if (!order.includes(i)) order.push(i);
    let introLeft = introFrames;
    const start = () => {
      for (const i of order) {
        const img = new window.Image();
        img.decoding = "async";
        img.onload = () => {
          if (cancelled) return;
          ready[i] = true;
          if (i < introFrames && --introLeft === 0) playIntro();
          if (Math.abs(i - current) <= 3 || current === -1) { current = -1; onScroll(); }
        };
        img.src = `${dir}/${String(i).padStart(3, "0")}-${width}.webp`;
        images[i] = img;
      }
    };
    // Let the poster and the page settle first.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const later = () => { if (idle) idle(start, { timeout: 800 }); else setTimeout(start, 200); };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    tick();
    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      if (introRaf) cancelAnimationFrame(introRaf);
      setDrawn(false);
    };
  }, [live, theme]);

  const total = counts.gsocOrgs + counts.lfxOrgs;

  return (
    <section id="hero" aria-labelledby="hero-title" className="hero" data-live={live}>
      <div ref={trackRef} className="hero__track">
        <div ref={stageRef} className="cine cine-hero hero__stage flex flex-col">
          <div className="hero__media">
            {/* Two renders of the same scene; the theme decides which one shows. Frame 0 of the sequence. */}
            {(["dark", "light"] as const).map((t) => {
              const base = t === "dark" ? "hero-grid" : "hero-grid-light";
              return (
                <picture key={t} className={`cine-hero__art art-${t}`} data-art={t} style={{ backgroundImage: `url(${t === "dark" ? lqip.desktop : lqip.lightDesktop})` }}>
                  <source media="(max-width: 640px)" type="image/avif" srcSet={`/art/${base}-mobile-780.avif 780w, /art/${base}-mobile-1170.avif 1170w`} sizes="100vw" />
                  <source media="(max-width: 640px)" type="image/webp" srcSet={`/art/${base}-mobile-780.webp 780w, /art/${base}-mobile-1170.webp 1170w`} sizes="100vw" />
                  <source type="image/avif" srcSet={`/art/${base}-1080.avif 1080w, /art/${base}-1600.avif 1600w, /art/${base}-2560.avif 2560w`} sizes="100vw" />
                  <source type="image/webp" srcSet={`/art/${base}-1080.webp 1080w, /art/${base}-1600.webp 1600w, /art/${base}-2560.webp 2560w`} sizes="100vw" />
                  {/* Plain <img> inside an art-directed <picture> with AVIF/WebP sources. */}
                  <img src={`/art/${base}-1600.webp`} alt="" width={2560} height={1440} fetchPriority={t === "dark" ? "high" : "auto"} loading={t === "dark" ? "eager" : "lazy"} decoding="async" />
                </picture>
              );
            })}
            {live && <canvas ref={canvasRef} className="hero__canvas" data-drawn={drawn} aria-hidden="true" />}
          </div>
          <style>{`@media (max-width: 640px){#hero .cine-hero__art[data-art=dark]{background-image:url(${lqip.mobile})!important}#hero .cine-hero__art[data-art=light]{background-image:url(${lqip.lightMobile})!important}}`}</style>

          <div className="hero__content relative mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-center px-5 pt-28 text-center sm:px-8 md:pt-40 lg:pt-[24vh]">
            <div className="cine-scrim flex flex-col items-center">
              <p className="font-ui cine-in-1 mb-6 text-sm text-[var(--cine-fg-2)] md:text-[0.95rem]">Open-source mentorships, indexed</p>

              <h1 id="hero-title" className="font-display cine-title">
                <span className="line">find your place</span>
                <span className="line">in open source.</span>
              </h1>

              <p className="font-ui cine-in-1 mt-7 max-w-[31rem] text-base leading-relaxed text-[var(--cine-fg)] md:text-[1.15rem] md:leading-[1.65]">
                {nf.format(total)} organizations and {nf.format(counts.projects)} projects from Google Summer of Code and LFX Mentorship, since {Math.min(counts.gsocSince, counts.lfxSince)}.
              </p>
            </div>

            <div className="cine-in-2 mt-9 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link href="/#programs" className="cine-btn cine-btn--solid">Explore programs</Link>
              <Link href="/#explore" className="cine-btn cine-btn--line">Discover organizations</Link>
            </div>

            {/* Staged explorer: three real organizations from the index, sitting in the scene. */}
            <div className="cine-stage hero__panels cine-in-3 mt-auto w-full max-w-[880px] pb-6 pt-14 md:pb-10">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5" aria-label="Organizations in the index">
                {staged.map((org, i) => {
                  const program = getProgram(org.program)!;
                  return (
                    <li key={org.id} className={i > 0 ? "hidden sm:block" : undefined}>
                      <Link href={org.href} className="cine-panel font-ui text-left">
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-white">
                            <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={36} height={36} unoptimized className="h-full w-full object-contain p-1" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] font-semibold text-[var(--cine-fg)]">{org.name}</span>
                            <span className="block truncate text-xs text-[var(--cine-fg-3)]">{program.name}</span>
                          </span>
                        </span>
                        <span className="flex items-baseline justify-between text-xs text-[var(--cine-fg-2)]">
                          <span><strong className="font-display text-xl font-semibold text-[var(--cine-fg)]">{org.projectCount}</strong> projects</span>
                          <span>{org.years} {org.years === 1 ? "year" : "years"}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Mid-scroll: the mission rises over the city. With reduced motion it is a normal section below. */}
          {live && <MissionBlock {...mission} live />}

          {live && (
            <div className="hero__cue font-ui" aria-hidden="true">
              <span>Scroll</span>
              <i />
            </div>
          )}
          {live && <div className="hero__progress" aria-hidden="true" />}
        </div>
      </div>
      {!live && <MissionBlock {...mission} live={false} />}
    </section>
  );
}

/** Text-led statement. In the live hero each word brightens with scroll (--hero-words). */
function MissionBlock({ orgs, projects, since, live }: CinematicHeroProps["mission"] & { live: boolean }) {
  const story = `Every project here was proposed in public, mentored in public and merged in public. OSSGrid keeps ${orgs} organizations and ${projects} projects since ${since} in one place, so you can see who keeps coming back, what they built and where you could start.`;
  const words = story.split(" ");
  return (
    <div id="mission" role="region" aria-labelledby="mission-title" className={live ? "hero__mission" : "cine cine-section"}>
      <div className="cine-wrap grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20">
        <h2 id="mission-title" className="font-display cine-h2 hero__mission-title">
          great work begins
          <br />
          in the open.
        </h2>
        <div className="flex flex-col gap-8">
          <p className="font-display cine-story" style={{ "--n": words.length } as React.CSSProperties}>
            {words.map((word, i) => (
              <span key={i} className="w" style={{ "--i": i } as React.CSSProperties}>{word} </span>
            ))}
          </p>
          <p className="font-ui">
            <Link href="/guide" className="cine-link text-base">Read how people actually get selected</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
