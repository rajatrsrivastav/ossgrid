"use client";

import { useState } from "react";
import { X, ExternalLink, CalendarDays, Sparkles } from "lucide-react";

export default function StatusBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="relative rounded-2xl p-4 mb-6 animate-fade-in overflow-hidden"
      style={{
        background: "var(--bg-banner)",
        border: "1px solid rgba(59, 130, 246, 0.15)",
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 8s linear infinite",
        }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className="p-2 rounded-xl flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2))",
          }}
        >
          <Sparkles size={18} style={{ color: "var(--accent-start)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} className="opacity-70" />
              Upcoming: LFX Mentorship 2027 Term 1 (Mar–May)
            </span>
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            Applications for LFX 2027 Term 1 will open soon. Check program timelines and explore historical projects.{" "}
            <a
              href="https://github.com/cncf/mentoring/blob/main/programs/lfx-mentorship/README.md#program-guidelines"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium underline underline-offset-2"
              style={{ color: "var(--accent-start)" }}
            >
              View guidelines <ExternalLink size={11} />
            </a>
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg transition-colors flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
