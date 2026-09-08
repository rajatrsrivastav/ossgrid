"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import GlobeCanvas from "./GlobeCanvas";

interface HeroSectionProps {
  onExploreClick: () => void;
  onLearnClick: () => void;
  orgCount?: number;
  projectCount?: number;
}

export default function HeroSection({
  onExploreClick,
  onLearnClick,
  orgCount = 82,
  projectCount = 560,
}: HeroSectionProps) {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden mb-8 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-lg">
      {/* Background ambient radial gradients */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-10 w-80 h-80 rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center px-6 py-8 sm:px-10 sm:py-12">
        {/* Left column: Typography & CTAs */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Kicker badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold tracking-wider uppercase"
              style={{
                background: "rgba(79, 142, 255, 0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(79, 142, 255, 0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Open Source. Real Impact.
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.15] mb-4 text-[var(--text-primary)]">
            Discover organizations.
            <br />
            Build what{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)",
              }}
            >
              matters.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mb-6">
            Explore {orgCount}+ open source organizations and {projectCount}+ mentorship
            projects from the Linux Foundation ecosystem.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
              }}
            >
              Explore Organizations
              <ArrowRight size={15} />
            </button>

            <button
              onClick={onLearnClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-card)]"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <BookOpen size={15} className="text-[var(--text-muted)]" />
              Learn About LFX
            </button>
          </div>
        </div>

        {/* Right column: 3D Holographic Globe & Quote Card */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[280px] sm:min-h-[320px]">
          {/* Globe Canvas */}
          <div className="w-full h-[280px] sm:h-[320px] relative">
            <GlobeCanvas />
          </div>

          {/* Floating Frosted Glass Quote Card */}
          <div
            className="absolute bottom-2 sm:bottom-4 left-0 sm:left-4 z-20 max-w-[260px] sm:max-w-[280px] p-3.5 sm:p-4 rounded-xl text-xs backdrop-blur-md shadow-2xl transition-transform hover:-translate-y-0.5"
            style={{
              background: "rgba(13, 21, 38, 0.82)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
            }}
          >
            <p className="italic text-[var(--text-primary)] leading-relaxed mb-2 font-serif sm:font-sans">
              &ldquo;Open source is a force multiplier for human progress.&rdquo;
            </p>
            <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wide">
              — The Linux Foundation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
