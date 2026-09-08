"use client";

import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Compass,
  Bookmark,
  Flame,
  Cloud,
  Cpu,
  Terminal,
  Activity,
  Award,
  Layers,
} from "lucide-react";
import GlobeCanvas from "./GlobeCanvas";
import { motion } from "framer-motion";

interface LandingHeroProps {
  onExploreClick: () => void;
  onGuideClick: () => void;
  onFilterPreset?: (preset: "active" | "beginner" | "cloud" | "systems" | "ai" | "saved") => void;
  orgCount?: number;
  projectCount?: number;
  savedCount?: number;
}

export default function LandingHero({
  onExploreClick,
  onGuideClick,
  onFilterPreset,
  orgCount = 82,
  projectCount = 560,
  savedCount = 0,
}: LandingHeroProps) {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden mb-10 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-xl transition-all">
      {/* Precision grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Subtle ambient accent glow */}
      <div
        className="absolute -top-32 right-10 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 left-10 w-80 h-80 rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 py-10 sm:px-12 sm:py-14">
        {/* Left Column: Mission, Value Prop, CTAs & Quick Filters */}
        <motion.div
          className="lg:col-span-7 flex flex-col justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LFX Mentorship Explorer • 2026 Terms Live
            </span>
          </div>

          {/* Main Title - No gradient text, pure typographical authority */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-[-0.03em] leading-[1.12] mb-5 text-[var(--text-primary)]">
            The Definitive Launchpad for Linux Foundation Mentorships
          </h1>

          {/* Subtitle & Value Proposition */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-8">
            Discover funded open-source mentorships across {orgCount}+ organizations and {projectCount}+ projects.
            Earn a <strong className="text-[var(--text-primary)] font-semibold">$1,000 to $6,600 USD stipend</strong> while
            contributing to Kubernetes, Linux, GraphQL, and OpenSSF under 1-on-1 guidance from core maintainers.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                boxShadow: "0 4px 18px rgba(37, 99, 235, 0.4)",
              }}
            >
              <Compass size={17} />
              Explore All {orgCount} Organizations
              <ArrowRight size={16} />
            </button>

            <button
              onClick={onGuideClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] text-[var(--text-primary)] border border-slate-200/90 dark:border-[var(--border-card)] cursor-pointer"
            >
              <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
              First-Timer Roadmap
            </button>
          </div>

          {/* Quick-Jump Stack Filters - Pure SVG Icons, Zero Emojis */}
          <div className="flex flex-col gap-2.5 pt-4 border-t border-[var(--border-card)]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Quick Stack Filters:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onFilterPreset?.("active")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <Flame size={13} className="text-amber-600 dark:text-amber-400" />
                <span>Active 2026/2025</span>
              </button>

              <button
                onClick={() => onFilterPreset?.("beginner")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Beginner Friendly</span>
              </button>

              <button
                onClick={() => onFilterPreset?.("cloud")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-blue-500/40 transition-all cursor-pointer"
              >
                <Cloud size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Cloud Native / Go</span>
              </button>

              <button
                onClick={() => onFilterPreset?.("systems")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-orange-500/40 transition-all cursor-pointer"
              >
                <Cpu size={13} className="text-orange-600 dark:text-orange-400" />
                <span>Rust &amp; Systems</span>
              </button>

              <button
                onClick={() => onFilterPreset?.("ai")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40 transition-all cursor-pointer"
              >
                <Terminal size={13} className="text-purple-600 dark:text-purple-400" />
                <span>Python &amp; AI</span>
              </button>

              {savedCount > 0 && (
                <button
                  onClick={() => onFilterPreset?.("saved")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                >
                  <Bookmark size={13} className="fill-blue-600 dark:fill-blue-400" />
                  <span>Saved ({savedCount})</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Live Ecosystem Ticker & Interactive 3D Orbit */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          {/* Globe Canvas */}
          <div className="w-full h-[280px] sm:h-[320px] relative">
            <GlobeCanvas />
          </div>

          {/* Unified Precision HUD Telemetry Strip */}
          <motion.div
            className="w-full grid grid-cols-2 sm:grid-cols-4 rounded-2xl bg-slate-100/90 dark:bg-[var(--bg-raised)] border border-slate-200/90 dark:border-[var(--border-card)] shadow-md dark:shadow-lg mt-2 divide-x divide-slate-200/90 dark:divide-[var(--border-card)] overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col p-3 sm:p-3.5 bg-white dark:bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card-hover)] transition-colors">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--text-primary)]" style={{ fontFeatureSettings: '"tnum"' }}>
                {orgCount}+
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">
                Organizations
              </span>
            </div>

            <div className="flex flex-col p-3 sm:p-3.5 bg-white dark:bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card-hover)] transition-colors">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--text-primary)]" style={{ fontFeatureSettings: '"tnum"' }}>
                {projectCount}+
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">
                Active Projects
              </span>
            </div>

            <div className="flex flex-col p-3 sm:p-3.5 bg-white dark:bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card-hover)] transition-colors">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--text-primary)]" style={{ fontFeatureSettings: '"tnum"' }}>
                $3k–$6.6k
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">
                Paid Stipends
              </span>
            </div>

            <div className="flex flex-col p-3 sm:p-3.5 bg-white dark:bg-[var(--bg-card)] hover:bg-slate-50 dark:hover:bg-[var(--bg-card-hover)] transition-colors">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-[var(--text-primary)]" style={{ fontFeatureSettings: '"tnum"' }}>
                11 Terms
              </span>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-medium uppercase tracking-wider mt-0.5">
                Historical Span
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
