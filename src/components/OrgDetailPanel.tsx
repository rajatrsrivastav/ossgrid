"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Globe,
  Layers,
  Award,
  Bookmark,
  ArrowRight,
  ExternalLink,
  Users,
  Check,
} from "lucide-react";
import { Organization } from "@/lib/types";

function GitHubIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

interface OrgDetailPanelProps {
  org: Organization | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (orgId: string) => void;
}

function getOrgColor(name: string): string {
  const colors = ["#4f8eff", "#34d399", "#a78bfa", "#fb923c", "#f472b6", "#38bdf8"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function OrgDetailPanel({
  org,
  onClose,
  isSaved = false,
  onToggleSave,
}: OrgDetailPanelProps) {
  const [imgError, setImgError] = useState(false);

  if (!org) return null;

  const fallbackColor = getOrgColor(org.name);

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-y-auto border border-[var(--border-card)] shadow-2xl animate-fade-in"
      style={{
        background: "var(--bg-secondary)",
      }}
    >
      {/* Top action header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Organization Details
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Close details panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 pt-2 flex flex-col gap-5 flex-1">
        {/* Header Hero: Logo & Name */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10"
            style={{ background: "var(--bg-raised)" }}
          >
            {org.logoUrl && !imgError ? (
              <Image
                src={org.logoUrl}
                alt={`${org.name} logo`}
                width={48}
                height={48}
                className="w-full h-full object-contain p-1.5"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-xl font-bold" style={{ color: fallbackColor }}>
                {org.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] truncate">
                {org.name}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2 leading-relaxed">
              {org.description || "Open source organization participating in LFX Mentorship."}
            </p>
          </div>
        </div>

        {/* Quick links row */}
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] border-y border-[var(--border-card)] py-2.5">
          <a
            href={`https://github.com/search?q=${encodeURIComponent(org.name)}&type=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:text-blue-400 transition-colors"
          >
            <GitHubIcon size={13} />
            <span>GitHub</span>
          </a>
          <a
            href={`https://mentorship.lfx.linuxfoundation.org`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 dark:text-blue-400 transition-colors"
          >
            <Globe size={13} />
            <span>LFX Portal</span>
          </a>
          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Award size={13} />
            <span>{org.foundation}</span>
          </span>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className="p-3 rounded-xl border border-[var(--border-card)] flex flex-col items-center justify-center text-center"
            style={{ background: "var(--bg-raised)" }}
          >
            <Layers size={15} className="text-blue-600 dark:text-blue-400 mb-1" />
            <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
              {org.projectCount}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5">Projects</span>
          </div>

          <div
            className="p-3 rounded-xl border border-[var(--border-card)] flex flex-col items-center justify-center text-center"
            style={{ background: "var(--bg-raised)" }}
          >
            <Users size={15} className="text-purple-600 dark:text-purple-400 mb-1" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Mentorship
            </span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5">Program</span>
          </div>

          <div
            className="p-3 rounded-xl border border-[var(--border-card)] flex flex-col items-center justify-center text-center"
            style={{ background: "var(--bg-raised)" }}
          >
            <Award size={15} className="text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {org.years[0] || 2026}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5">Active</span>
          </div>
        </div>

        {/* Technologies section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Technologies
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {org.technologies.slice(0, 8).map((tech) => (
              <span
                key={tech}
                className="badge text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border-card)] text-[var(--text-secondary)]"
                style={{ background: "var(--bg-raised)" }}
              >
                {tech}
              </span>
            ))}
            {org.technologies.length > 8 && (
              <span className="text-[10px] text-[var(--text-muted)] self-center px-1">
                +{org.technologies.length - 8} more
              </span>
            )}
          </div>
        </div>

        {/* Related Links section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Related Links
          </h3>
          <div className="space-y-1 text-xs">
            <a
              href={`https://mentorship.lfx.linuxfoundation.org`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2">
                <Globe size={13} className="text-blue-600 dark:text-blue-400" />
                <span>Official LFX Program</span>
              </span>
              <ExternalLink size={12} className="text-[var(--text-muted)]" />
            </a>
            <a
              href={`https://github.com/cncf/mentoring/tree/main/programs/lfx-mentorship`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2">
                <GitHubIcon size={13} className="text-purple-600 dark:text-purple-400" />
                <span>GitHub Repository</span>
              </span>
              <ExternalLink size={12} className="text-[var(--text-muted)]" />
            </a>
            <a
              href={`https://community.cncf.io`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2">
                <Users size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Community & Mentors</span>
              </span>
              <ExternalLink size={12} className="text-[var(--text-muted)]" />
            </a>
          </div>
        </div>

        {/* Bottom CTA Action Buttons */}
        <div className="mt-auto pt-4 flex flex-col gap-2.5 border-t border-[var(--border-card)]">
          <Link
            href={`/organization/${org.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
            }}
          >
            <span>View Projects</span>
            <ArrowRight size={14} />
          </Link>

          {/*
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(org.id)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-card)]"
              style={{
                background: isSaved ? "rgba(59, 130, 246, 0.12)" : "transparent",
                color: isSaved ? "var(--color-accent-raw)" : "inherit",
              }}
            >
              {isSaved ? (
                <>
                  <Check size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>Saved to Bookmarks</span>
                </>
              ) : (
                <>
                  <Bookmark size={14} />
                  <span>Save Organization</span>
                </>
              )}
            </button>
          )}
          */}
        </div>
      </div>
    </div>
  );
}
