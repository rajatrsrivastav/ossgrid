"use client";

import {
  Search,
  GitPullRequest,
  Send,
  Users,
  DollarSign,
  Calendar,
  Award,
  ArrowRight,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface FirstTimerGuideProps {
  onFindProjectsClick: () => void;
}

export default function FirstTimerGuide({ onFindProjectsClick }: FirstTimerGuideProps) {
  const steps = [
    {
      step: "01",
      title: "Target & Evaluate",
      icon: Search,
      color: "text-blue-400",
      accentBg: "bg-blue-500/10 border-blue-500/20",
      description:
        "Filter OSSGrid by your primary languages (Go, Python, TypeScript, Rust, C++). Inspect historical term frequency, mentor rosters, and issue trackers before shortlisting 2–3 target projects.",
      tipIcon: Lightbulb,
      tipText: "Pro-tip: Check previous project acceptance history in the detail drawer.",
    },
    {
      step: "02",
      title: "Engage & Pre-Contribute",
      icon: GitPullRequest,
      color: "text-emerald-400",
      accentBg: "bg-emerald-500/10 border-emerald-500/20",
      description:
        "The #1 selection factor: Never submit a cold application! Join the project's Slack or Discord, introduce yourself to mentors, and merge 1–2 small documentation fixes or good-first-issues.",
      tipIcon: Sparkles,
      tipText: "Mentors prioritize candidates who have already touched the codebase.",
    },
    {
      step: "03",
      title: "Milestone Proposal",
      icon: Send,
      color: "text-amber-400",
      accentBg: "bg-amber-500/10 border-amber-500/20",
      description:
        "Submit on mentorship.lfx.linuxfoundation.org. Include a clear 12-week schedule with measurable weekly milestones, your merged PR links, and your resume. Quality beats quantity.",
      tipIcon: CheckCircle2,
      tipText: "Official limit: You can submit up to 3 applications per term.",
    },
  ];

  return (
    <section className="w-full mb-12 rounded-3xl p-6 sm:p-10 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-xl relative overflow-hidden">
      {/* Precision grid pattern background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(var(--text-primary) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <div className="max-w-3xl mb-10 relative z-10">
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-[-0.02em] mb-3">
          How LFX Mentorship Works: The Contributor Playbook
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          The Linux Foundation Mentorship Program isn&apos;t just a scholarship—it is a paid, 12-week real-world engineering
          internship with 1-on-1 guidance from core open-source maintainers. Here is the verified blueprint to get accepted.
        </p>
      </div>

      {/* Connected 3-Stage Process Rail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const TipIcon = item.tipIcon;
          return (
            <div
              key={item.step}
              className="flex flex-col p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-sm hover:border-[var(--border-hover)] transition-all duration-200 relative group"
            >
              {/* Top Rail: Step Number & Action Icon */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-raised)] text-[var(--text-muted)] border border-[var(--border-card)]">
                  PHASE {item.step}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.accentBg} ${item.color}`}>
                  <Icon size={17} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-[var(--text-primary)] mb-2.5 tracking-tight group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-5 flex-1">
                {item.description}
              </p>

              {/* Footer Insight Callout - Pure SVG Icon, No Emojis */}
              <div className="pt-3.5 border-t border-[var(--border-card)] flex items-start gap-2 text-[11px] text-[var(--text-muted)] leading-normal">
                <TipIcon size={14} className={`${item.color} flex-shrink-0 mt-0.5`} />
                <span>{item.tipText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Core Facts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[var(--bg-raised)] border border-[var(--border-card)] relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
            <Users size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Open Eligibility</div>
            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
              18+ worldwide. Students, self-taught, and career-switchers are welcome.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Funded Stipends</div>
            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
              $3,000 to $6,600 USD per mentee, adjusted for purchasing power parity.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
            <Calendar size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">3 Annual Cohorts</div>
            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
              Spring (Mar–May), Summer (Jun–Aug), and Fall (Sep–Nov) terms.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex-shrink-0">
            <Award size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Direct Mentorship</div>
            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-0.5">
              Permanent commit rights, maintainer endorsements, and career network.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
