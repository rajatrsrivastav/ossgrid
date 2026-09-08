"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Award,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Layers,
  HelpCircle,
  ExternalLink,
  Code2,
  Flame,
  Terminal,
  Cpu,
  Globe2,
  ShieldCheck,
  Bookmark,
} from "lucide-react";
import Header from "@/components/Header";
import FirstTimerGuide from "@/components/FirstTimerGuide";
import FirstTimerFAQ from "@/components/FirstTimerFAQ";
import AboutModal from "@/components/AboutModal";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface ProgramCard {
  id: string;
  name: string;
  shortName: string;
  sponsor: string;
  status: "active" | "roadmap" | "coming-soon";
  statusLabel: string;
  statusColor: string;
  stipend: string;
  cohorts: string;
  commitment: string;
  studentOnly: boolean;
  description: string;
  highlights: string[];
  link?: string;
  actionLabel: string;
}

const PROGRAMS: ProgramCard[] = [
  {
    id: "lfx",
    name: "Linux Foundation (LFX) Mentorship",
    shortName: "LFX Mentorship",
    sponsor: "The Linux Foundation & CNCF",
    status: "active",
    statusLabel: "ACTIVE • 2026 T3 LIVE",
    statusColor: "#10b981",
    stipend: "$3,000 – $6,600 USD",
    cohorts: "3 per year (Spring, Summer, Fall)",
    commitment: "Full-time (12 wks) or Part-time (24 wks)",
    studentOnly: false,
    description:
      "Work 1-on-1 with core maintainers of Linux, Kubernetes, Envoy, PyTorch, Prometheus, and 90+ ecosystem leaders. Get paid while committing production code.",
    highlights: ["96+ Active Organizations", "400+ Tracked Projects", "No university degree required", "Direct maintainer mentorship"],
    link: "/lfx",
    actionLabel: "Launch LFX Explorer →",
  },
  {
    id: "gsoc",
    name: "Google Summer of Code (GSoC)",
    shortName: "Google Summer of Code",
    sponsor: "Google Open Source",
    status: "roadmap",
    statusLabel: "ROADMAP • CYCLE 2027",
    statusColor: "#f59e0b",
    stipend: "$1,500 – $6,600 USD (PPP)",
    cohorts: "Annual (May – August)",
    commitment: "12 to 22 weeks (~175h to 350h)",
    studentOnly: false,
    description:
      "The world's largest open-source initiative bringing new contributors into software organizations like Debian, Apache, Mozilla, GNU, and Python.",
    highlights: ["200+ Mentoring Orgs", "Medium & Large project scopes", "Proposal preparation guide", "Global community network"],
    actionLabel: "Guidebook Available",
  },
  {
    id: "gssoc",
    name: "GirlScript Summer of Code (GSSoC)",
    shortName: "GSSoC",
    sponsor: "GirlScript Foundation",
    status: "coming-soon",
    statusLabel: "COMING SOON • BEGINNER",
    statusColor: "#ec4899",
    stipend: "Prizes, Certificates & Swag",
    cohorts: "Annual 3-Month Sprint",
    commitment: "Flexible part-time",
    studentOnly: false,
    description:
      "A 3-month open source program designed to help newcomers learn Git workflows, submit their first pull requests, and contribute to diverse open repositories.",
    highlights: ["Beginner friendly", "Leaderboards & badges", "Peer mentorship", "Ideal for first PRs"],
    actionLabel: "Track Coming Soon",
  },
  {
    id: "outreachy",
    name: "Outreachy",
    shortName: "Outreachy",
    sponsor: "Software Freedom Conservancy",
    status: "coming-soon",
    statusLabel: "COMING SOON • DIVERSITY",
    statusColor: "#8b5cf6",
    stipend: "$7,000 USD Total Stipend",
    cohorts: "2 per year (May & December)",
    commitment: "Full-time (13 weeks)",
    studentOnly: false,
    description:
      "Paid, remote internships for people subject to systemic bias and underrepresented groups in tech, fostering equity across free software ecosystems.",
    highlights: ["$7,000 USD stipend + travel grant", "Structured initial contribution phase", "Non-coding tracks available", "Experienced mentors"],
    actionLabel: "Track Coming Soon",
  },
  {
    id: "mlh",
    name: "MLH Fellowship",
    shortName: "MLH Fellowship",
    sponsor: "Major League Hacking",
    status: "coming-soon",
    statusLabel: "COMING SOON • FELLOWSHIP",
    statusColor: "#3b82f6",
    stipend: "Educational Stipend",
    cohorts: "Spring, Summer, Fall",
    commitment: "12-week intensive sprint",
    studentOnly: false,
    description:
      "A 12-week internship alternative where fellows contribute to real open source repositories sponsored by industry giants under dedicated pod mentorship.",
    highlights: ["Sprint-based pod structure", "Portfolio-ready repositories", "Professional career guidance", "Competitive cohort model"],
    actionLabel: "Track Coming Soon",
  },
  {
    id: "gsod",
    name: "Google Season of Docs (GSoD)",
    shortName: "Season of Docs",
    sponsor: "Google Open Source",
    status: "coming-soon",
    statusLabel: "COMING SOON • DOCS",
    statusColor: "#06b6d4",
    stipend: "$5,000 – $15,000 USD (Org Grants)",
    cohorts: "Annual",
    commitment: "6-month documentation projects",
    studentOnly: false,
    description:
      "Connecting technical writers with open source organizations to build world-class documentation architecture, tutorials, and developer guides.",
    highlights: ["Technical writing focus", "High-impact docs architecture", "Open to professional writers", "Direct maintainer collaboration"],
    actionLabel: "Track Coming Soon",
  },
];

export default function HomePage() {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const programsRef = useRef<HTMLDivElement | null>(null);
  const playbookRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);

  const scrollToPrograms = () => {
    programsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToPlaybook = () => {
    playbookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Header */}
      <Header
        variant="simple"
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-8 py-8 space-y-16">

        {/* ══════════════════════════════════════════════════════════════════════
            HERO: OSSGRID MASTER GUIDEBOOK
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full rounded-3xl overflow-hidden border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-2xl p-8 sm:p-14 lg:p-16">
          {/* Subtle decorative grid background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(var(--text-primary) 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Accent glow spheres */}
          <div
            className="absolute -top-32 right-12 w-[32rem] h-[32rem] rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 left-12 w-[28rem] h-[28rem] rounded-full pointer-events-none opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
          />

          <div className="relative z-10 max-w-4xl">
            {/* Live Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                <Globe2 size={13} className="text-blue-400" />
                OSSGrid • The Universal Open Source Guidebook
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LFX Mentorship Hub Live
              </span>
            </div>

            {/* Main Typographical Authority */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4rem] font-black tracking-[-0.035em] leading-[1.08] mb-6 text-[var(--text-primary)]">
              Navigate All Open Source Mentorships & Fellowships
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-3xl">
              The unified intelligence hub and playbook for developers. Discover paid open-source fellowships, compare stipend models ($1.5k–$7k), master real Git contribution workflows, and launch your journey across the global open source ecosystem.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                href="/lfx"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 22px rgba(37, 99, 235, 0.4)",
                }}
              >
                <Compass size={18} />
                Explore LFX Mentorship (Live)
                <ArrowRight size={17} />
              </Link>

              <button
                onClick={scrollToPrograms}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-blue-500/50 hover:bg-[var(--bg-card)] transition-all cursor-pointer"
              >
                <Layers size={16} className="text-blue-400" />
                View All Programs
              </button>

              <button
                onClick={scrollToPlaybook}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all cursor-pointer"
              >
                <BookOpen size={16} className="text-[var(--text-muted)]" />
                Contributor Playbook
              </button>
            </div>

            {/* Key Ecosystem Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-[var(--border-card)]">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Programs Tracked</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)] mt-0.5">6 Premier</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">LFX Organizations</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400 mt-0.5">96+ Active</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Funded Stipends</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-0.5">$1.5k – $7k</div>
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Eligibility</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-purple-400 mt-0.5">Open Globally</div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            PROGRAMS CATALOG / HUB
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="programs" ref={programsRef} className="scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 font-mono mb-1.5">
                <Layers size={14} /> Open Source Mentorship Directory
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                Programs & Fellowships Across Open Source
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
              Compare requirements, stipend brackets, and application calendars. LFX Mentorship is currently live with full organization profiling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((prog) => {
              const isLfx = prog.id === "lfx";
              return (
                <div
                  key={prog.id}
                  className={`flex flex-col justify-between rounded-3xl p-6 sm:p-7 border transition-all relative overflow-hidden ${
                    isLfx
                      ? "border-blue-500/60 bg-[var(--bg-secondary)] shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/30"
                      : "border-[var(--border-card)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]"
                  }`}
                >
                  {isLfx && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div>
                    {/* Header with Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-mono text-[var(--text-muted)] font-semibold">
                        {prog.sponsor}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                        style={{
                          background: `${prog.statusColor}15`,
                          color: prog.statusColor,
                          border: `1px solid ${prog.statusColor}30`,
                        }}
                      >
                        {isLfx && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {prog.statusLabel}
                      </span>
                    </div>

                    {/* Program Title */}
                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                      {prog.shortName}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                      {prog.description}
                    </p>

                    {/* Key Attributes */}
                    <div className="space-y-2 mb-6 p-3.5 rounded-xl bg-[var(--bg-raised)] border border-[var(--border-card)] text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Stipend</span>
                        <span className="font-bold text-emerald-400">{prog.stipend}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Schedule</span>
                        <span className="text-[var(--text-secondary)]">{prog.cohorts}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Degree required</span>
                        <span className="text-[var(--text-secondary)]">{prog.studentOnly ? "Students Only" : "None (18+)"}</span>
                      </div>
                    </div>

                    {/* Highlights bullets */}
                    <div className="space-y-1.5 mb-6">
                      {prog.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <CheckCircle2 size={13} className="text-blue-400 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div>
                    {prog.link ? (
                      <Link
                        href={prog.link}
                        className="btn-primary w-full justify-center text-xs py-3 font-bold"
                      >
                        {prog.actionLabel}
                      </Link>
                    ) : (
                      <div className="w-full py-2.5 px-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-input)] text-center text-xs font-mono text-[var(--text-muted)]">
                        {prog.actionLabel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            COMPARISON MATRIX TABLE
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="w-full rounded-3xl p-6 sm:p-10 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 font-mono mb-2">
            <ShieldCheck size={14} /> Side-by-Side Comparison
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mb-2">
            Open Source Mentorship Program Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-2xl">
            Key evaluation factors at a glance. Find which initiative aligns with your availability, compensation needs, and career goals.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs" aria-label="Program comparison table">
              <thead>
                <tr className="border-b border-[var(--border-card)] text-[var(--text-muted)] font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Sponsor</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Eligibility</th>
                  <th className="py-3 px-4">Annual Cohorts</th>
                  <th className="py-3 px-4">OSSGrid Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-card)] font-sans">
                {PROGRAMS.map((prog) => (
                  <tr key={prog.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="py-4 px-4 font-bold text-[var(--text-primary)]">
                      {prog.shortName}
                    </td>
                    <td className="py-4 px-4 text-[var(--text-secondary)]">
                      {prog.sponsor}
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold text-emerald-400">
                      {prog.stipend}
                    </td>
                    <td className="py-4 px-4 text-[var(--text-secondary)]">
                      {prog.studentOnly ? "Enrolled Students" : "Worldwide (18+)"}
                    </td>
                    <td className="py-4 px-4 text-[var(--text-secondary)] font-mono">
                      {prog.cohorts}
                    </td>
                    <td className="py-4 px-4">
                      {prog.link ? (
                        <Link
                          href={prog.link}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:underline"
                        >
                          Explore Hub <ArrowRight size={12} />
                        </Link>
                      ) : (
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          Roadmap
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            CONTRIBUTOR PLAYBOOK ROADMAP
        ══════════════════════════════════════════════════════════════════════ */}
        <div id="playbook" ref={playbookRef} className="scroll-mt-20">
          <FirstTimerGuide onFindProjectsClick={() => {
            window.location.href = "/lfx";
          }} />
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            FAQ FOR FIRST TIMERS & COMPARISONS
        ══════════════════════════════════════════════════════════════════════ */}
        <div id="faq" ref={faqRef} className="scroll-mt-20">
          <FirstTimerFAQ />
        </div>

      </main>

      <Footer />

      <AboutModal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
}
