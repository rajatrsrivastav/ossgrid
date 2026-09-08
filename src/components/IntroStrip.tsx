"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, ExternalLink } from "lucide-react";
import LogoMark from "./LogoMark";

interface IntroStripProps {
  orgCount: number;
  projectCount: number;
}

export default function IntroStrip({ orgCount, projectCount }: IntroStripProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative rounded-xl p-4 mb-5 animate-fade-in"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-card)",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Mark */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--gradient-cta)" }}
        >
          <LogoMark size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-2 leading-relaxed" style={{ color: "var(--text-primary)" }}>
            Explore{" "}
            <span style={{ color: "var(--color-accent-raw)", fontFamily: "var(--font-mono)" }}>
              {orgCount}
            </span>{" "}
            organizations and{" "}
            <span style={{ color: "var(--color-accent-raw)", fontFamily: "var(--font-mono)" }}>
              {projectCount}
            </span>{" "}
            projects from LFX Mentorship — a developer mentorship program by the Linux Foundation.
            Search or filter to find orgs that match your skills.
          </p>

          {/* Inline stats + upcoming term info */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: "Organizations", value: orgCount },
                { label: "Projects", value: projectCount },
                { label: "Terms tracked", value: 11 },
                { label: "Current term", value: "2027 T1" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                  >
                    {value}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="hidden sm:inline-block w-px h-4" style={{ background: "var(--border-card)" }} />

            {/* Merged Upcoming Term Pill */}
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: "var(--color-accent-dim)",
                  color: "var(--color-accent-raw)",
                  border: "1px solid var(--border-hover)",
                }}
              >
                <Sparkles size={11} />
                Upcoming: 2027 Term 1 (Mar–May)
              </span>
              <span style={{ color: "var(--text-muted)" }}>Applications opening soon ·</span>
              <a
                href="https://github.com/cncf/mentoring/blob/main/programs/lfx-mentorship/README.md#program-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]"
                style={{ color: "var(--color-accent-raw)" }}
              >
                Guidelines <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1.5 rounded-md transition-colors hover:bg-[var(--bg-input)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss intro"
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
