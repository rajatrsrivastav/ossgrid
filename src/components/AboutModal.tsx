"use client";

import { X, ExternalLink, Calendar, Award, Code, Users } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="About LFX Mentorship"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border-card)] shadow-2xl p-6 sm:p-8 animate-scale-in"
        style={{
          background: "var(--bg-secondary)",
          color: "var(--text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)" }}
          >
            <Code size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">About LFX Mentorship</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              The premier open-source mentorship program by the Linux Foundation
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          The LFX Mentorship program connects aspiring open source contributors with experienced
          maintainers across leading Linux Foundation and CNCF projects. Mentees gain hands-on
          experience working directly on production systems, architecture, and developer tools.
        </p>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div
            className="p-3.5 rounded-xl border border-[var(--border-card)]"
            style={{ background: "var(--bg-raised)" }}
          >
            <div className="flex items-center gap-2 mb-1.5 text-blue-400">
              <Calendar size={15} />
              <span className="text-xs font-semibold">3 Annual Terms</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Spring (Mar–May), Summer (Jun–Aug), and Fall (Sep–Nov) cycles with full-time or
              part-time commitments.
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border border-[var(--border-card)]"
            style={{ background: "var(--bg-raised)" }}
          >
            <div className="flex items-center gap-2 mb-1.5 text-purple-400">
              <Users size={15} />
              <span className="text-xs font-semibold">Dedicated Mentors</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Pair program weekly with principal maintainers who guide architectural decisions and
              review pull requests.
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border border-[var(--border-card)]"
            style={{ background: "var(--bg-raised)" }}
          >
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400">
              <Award size={15} />
              <span className="text-xs font-semibold">Global Stipends</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Competitive stipends awarded upon successful milestone completions based on local
              purchasing parity.
            </p>
          </div>

          <div
            className="p-3.5 rounded-xl border border-[var(--border-card)]"
            style={{ background: "var(--bg-raised)" }}
          >
            <div className="flex items-center gap-2 mb-1.5 text-amber-400">
              <Code size={15} />
              <span className="text-xs font-semibold">Production Code</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ship features directly to projects like Kubernetes, KubeEdge, WasmEdge, PyTorch, and
              OpenTelemetry.
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-card)]">
          <a
            href="https://mentorship.lfx.linuxfoundation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-card)] hover:bg-[var(--bg-input)] transition-colors text-xs font-medium text-[var(--text-primary)]"
          >
            <span>Official LFX Mentorship Portal</span>
            <ExternalLink size={13} className="text-[var(--text-muted)]" />
          </a>
          <a
            href="https://github.com/cncf/mentoring/tree/main/programs/lfx-mentorship"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-card)] hover:bg-[var(--bg-input)] transition-colors text-xs font-medium text-[var(--text-primary)]"
          >
            <span>CNCF Mentoring GitHub Repository</span>
            <ExternalLink size={13} className="text-[var(--text-muted)]" />
          </a>
        </div>
      </div>
    </div>
  );
}
