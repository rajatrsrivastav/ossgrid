"use client";

import { useState } from "react";
import { X, ExternalLink, CalendarDays, Sparkles } from "lucide-react";

export default function StatusBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative rounded-xl p-4 mb-5 animate-fade-in overflow-hidden"
      style={{
        background: "var(--bg-banner)",
        border: "1px solid rgba(79, 142, 255, 0.15)",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(79,142,255,0.08), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 8s linear infinite",
        }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ background: "var(--color-accent-dim)" }}
        >
          <Sparkles size={16} style={{ color: "var(--color-accent-raw)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="opacity-60" />
              Upcoming: LFX Mentorship 2027 Term 1 (Mar–May 2027)
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Applications open soon. Explore past projects to find orgs that match your skills.{" "}
            <a
              href="https://github.com/cncf/mentoring/blob/main/programs/lfx-mentorship/README.md#program-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
              style={{ color: "var(--color-accent-raw)" }}
            >
              Program guidelines <ExternalLink size={10} />
            </a>
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-md transition-colors flex-shrink-0 hover:bg-[var(--bg-input)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
