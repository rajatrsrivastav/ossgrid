"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Layers, Bookmark, Sparkles, Check } from "lucide-react";
import Image from "next/image";
import { Organization } from "@/lib/types";
import { truncate, sanitizeDescription } from "@/lib/utils";
import { motion } from "framer-motion";

interface OrganizationCardProps {
  org: Organization;
  isSelected?: boolean;
  onSelect?: (org: Organization) => void;
  isSaved?: boolean;
  onToggleSave?: (orgId: string) => void;
}

// Deterministic color hash for fallback avatar
function getOrgColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

function getInitials(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase() || name.slice(0, 1).toUpperCase();
}

export default function OrganizationCard({
  org,
  isSelected = false,
  onSelect,
  isSaved = false,
  onToggleSave,
}: OrganizationCardProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !org.logoUrl || imgError;
  const maxTechBadges = 3;
  const visibleTech = org.technologies.slice(0, maxTechBadges);

  const isActiveTerm = org.years.includes(2026) || org.years.includes(2025);
  const isBeginnerFriendly = org.technologies.some((t) =>
    ["Python", "JavaScript", "TypeScript", "Documentation", "Go"].includes(t)
  );

  const yearlyCounts = useMemo(() => {
    const counts: Record<number, number> = { 2022: 0, 2023: 0, 2024: 0, 2025: 0, 2026: 0 };
    if (org.projects && org.projects.length > 0) {
      for (const p of org.projects) {
        if (p.year && counts[p.year] !== undefined) {
          counts[p.year]++;
        }
      }
    } else if (org.years && org.years.length > 0) {
      for (const y of org.years) {
        if (counts[y] !== undefined) {
          counts[y] = 1;
        }
      }
    }
    return counts;
  }, [org]);

  const maxProjects = useMemo(() => {
    return Math.max(...Object.values(yearlyCounts), 1);
  }, [yearlyCounts]);

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is on an interactive child (link, button), let it propagate naturally
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    router.push(`/organization/${org.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave?.(org.id);
  };

  return (
    <motion.div
      layout
      onClick={handleCardClick}
      className={`glass-card flex flex-col h-full rounded-2xl transition-colors duration-200 cursor-pointer group select-none relative overflow-hidden ${
        isSelected
          ? "ring-2 ring-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.35)]"
          : "border-[var(--border-card)] shadow-sm"
      }`}
      style={{
        background: "var(--bg-card)",
        border: isSelected ? "1px solid rgba(79, 142, 255, 0.8)" : "1px solid var(--border-card)",
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(org);
        }
      }}
      aria-label={`${org.name} — ${org.projectCount} projects, ${org.foundation}`}
      aria-pressed={isSelected}
    >
      {/* Top row: Logo, Name, Badges & Bookmark */}
      <div className="p-5 pb-3 flex items-start gap-3.5">
        {/* Logo with smooth fallback */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shadow-sm transition-transform group-hover:scale-105"
          style={{
            background: showFallback ? getOrgColor(org.name) : "var(--bg-raised)",
          }}
        >
          {showFallback ? (
            <span className="text-sm font-bold text-white tracking-wider font-mono select-none">
              {getInitials(org.name)}
            </span>
          ) : (
            <Image
              src={org.logoUrl}
              alt={org.name}
              width={44}
              height={44}
              className="w-full h-full object-contain p-1"
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h3 className="text-base font-bold truncate leading-tight text-[var(--text-primary)] group-hover:text-blue-600 dark:text-blue-400 transition-colors">
              {org.name}
            </h3>

            {/* Bookmark button 
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition-all flex-shrink-0 cursor-pointer ${
                isSaved
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/40"
                  : "bg-transparent text-[var(--text-muted)] border-transparent hover:border-[var(--border-card)] hover:text-[var(--text-primary)]"
              }`}
              title={isSaved ? "Remove from bookmarks" : "Save organization"}
              aria-label={isSaved ? "Saved" : "Save"}
            >
              <Bookmark size={14} className={isSaved ? "fill-blue-600 dark:fill-blue-400" : ""} />
            </button>
            */}
          </div>

          {/* Quick status chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isActiveTerm && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Active
              </span>
            )}
            {isBeginnerFriendly && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Sparkles size={9} />
                Beginner
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {truncate(sanitizeDescription(org.description, org.name), 130)}
        </p>
      </div>

      {/* Tech Badges */}
      <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
        {org.category && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          >
            {org.category.split("&")[0].trim()}
          </span>
        )}
        {visibleTech.map((tech) => (
          <span
            key={tech}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)]"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Precision Term Activity Micro-Histogram */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono mb-2">
          <span className="tracking-wider uppercase">Activity</span>
          <span className="text-[var(--text-secondary)]" style={{ fontFeatureSettings: '"tnum"' }}>
            {org.years.length} {org.years.length === 1 ? "year" : "years"} active
          </span>
        </div>

        {/* Micro-chart container */}
        <div className="h-11 flex items-end gap-1.5 p-2 rounded-xl bg-slate-50/80 dark:bg-[var(--bg-raised)] border border-slate-200/80 dark:border-[var(--border-card)]">
          {[2022, 2023, 2024, 2025, 2026].map((year) => {
            const count = yearlyCounts[year] || 0;
            const heightPercent = count > 0 ? Math.max(Math.round((count / maxProjects) * 100), 18) : 0;
            const isRecent = year === 2026 || year === 2025;
            return (
              <div
                key={year}
                className="flex-1 flex flex-col items-center h-full justify-end group/bar relative"
              >
                {/* Precision Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-all duration-150 transform group-hover/bar:-translate-y-0.5 bg-[var(--bg-secondary)] border border-[var(--border-card)] text-[10px] text-[var(--text-primary)] px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap z-30 font-mono">
                  &apos;{String(year).slice(2)}: <strong className="text-blue-600 dark:text-blue-400">{count}</strong> {count === 1 ? "project" : "projects"}
                </div>

                {/* Vertical Bar Slot with subtle track */}
                <div className="w-full h-full flex items-end justify-center rounded-[2px] bg-slate-200/40 dark:bg-white/[0.03]">
                  {count > 0 ? (
                    <div
                      className={`w-full rounded-t-[3px] transition-all duration-300 ${
                        isRecent
                          ? "bg-blue-500 group-hover/bar:bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.3)]"
                          : "bg-blue-400/50 group-hover/bar:bg-blue-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  ) : (
                    <div className="w-2 h-0.5 rounded-full bg-slate-300 dark:bg-white/10" />
                  )}
                </div>

                {/* Year Label */}
                <span
                  className={`text-[9px] font-mono mt-1 select-none ${
                    count > 0 ? "text-[var(--text-secondary)] font-medium" : "text-[var(--text-muted)] opacity-60"
                  }`}
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  &apos;{String(year).slice(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer row */}
      <div
        className="px-5 py-3 flex items-center justify-between mt-auto text-xs text-[var(--text-muted)] border-t border-[var(--border-card)]"
      >
        <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
          <Layers size={13} className="text-blue-600 dark:text-blue-400" />
          <span style={{ fontFeatureSettings: '"tnum"' }}>
            {org.projectCount} {org.projectCount === 1 ? "project" : "projects"}
          </span>
        </span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--text-muted)]">{org.foundation}</span>
          <Link
            href={`/organization/${org.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-md hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
            aria-label={`Open ${org.name} details page`}
            title="Open deep-dive page"
          >
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
