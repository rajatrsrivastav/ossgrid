"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Layers } from "lucide-react";
import Image from "next/image";
import { Organization, LfxOrganizationDto } from "@/lib/types";
import { truncate, sanitizeDescription } from "@/lib/utils";
import { motion } from "framer-motion";

interface OrganizationCardProps {
  org: Organization | LfxOrganizationDto;
  isSelected?: boolean;
  onSelect?: (org: Organization | LfxOrganizationDto) => void;
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

function getListingTechnologies(technologies: string[], maxCount = 2): { visible: string[]; extraCount: number } {
  if (!technologies || technologies.length === 0) return { visible: [], extraCount: 0 };

  // Exclude verbose requirement sentences dumped from project requirements
  const cleanTech = technologies.filter((tech) => {
    if (!tech || tech.length > 22) return false;
    const lower = tech.toLowerCase();
    if (
      lower.includes("understanding") ||
      lower.includes("familiarity") ||
      lower.includes("experience") ||
      lower.includes("knowledge") ||
      lower.includes("ability") ||
      lower.includes("optional") ||
      lower.includes("concepts") ||
      lower.includes("basic") ||
      lower.includes("e2e") ||
      lower.includes("pipelines") ||
      lower.includes("http") ||
      lower.includes(".md") ||
      lower.startsWith("(")
    ) {
      return false;
    }
    return true;
  });

  const visible = cleanTech.slice(0, maxCount);
  const extraCount = technologies.length - visible.length;
  return { visible, extraCount: extraCount > 0 ? extraCount : 0 };
}

export default function OrganizationCard({
  org,
  isSelected = false,
  onSelect,
  isSaved: _isSaved = false,
  onToggleSave: _onToggleSave,
}: OrganizationCardProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !org.logoUrl || imgError;
  const { visible: visibleTech, extraCount: extraTechCount } = useMemo(
    () => getListingTechnologies(org.technologies, 2),
    [org.technologies]
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

  return (
    <motion.div
      layout
      onClick={handleCardClick}
      className={`glass-card flex flex-col rounded-2xl transition-colors duration-200 cursor-pointer group select-none relative overflow-hidden ${
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
      {/* Top row: Logo, Name */}
      <div className="p-4 pb-2 flex items-center gap-3">
        {/* Logo with smooth fallback */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 shadow-sm transition-transform group-hover:scale-105"
          style={{
            background: showFallback ? getOrgColor(org.name) : "var(--bg-raised)",
          }}
        >
          {showFallback ? (
            <span className="text-xs font-bold text-white tracking-wider font-mono select-none">
              {getInitials(org.name)}
            </span>
          ) : (
            <Image
              src={org.logoUrl}
              alt={org.name}
              width={40}
              height={40}
              className="w-full h-full object-contain p-1"
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold truncate leading-tight text-[var(--text-primary)] group-hover:text-blue-600 dark:text-blue-400 transition-colors">
            {org.name}
          </h3>
        </div>
      </div>

      {/* Description (strictly max 2 lines, no empty flex-1 space) */}
      <div className="px-4 pb-2.5">
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {truncate(sanitizeDescription(org.description, org.name), 120)}
        </p>
      </div>

      {/* Tech & Category Badges (compact discovery tags) */}
      <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
        {org.category && (
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 truncate max-w-[130px]"
          >
            {org.category.split("&")[0].trim()}
          </span>
        )}
        {visibleTech.map((tech) => (
          <span
            key={tech}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] truncate max-w-[110px]"
            title={tech}
          >
            {tech}
          </span>
        ))}
        {extraTechCount > 0 && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-[var(--text-muted)] bg-[var(--bg-raised)]/60 border border-transparent"
            title={`${extraTechCount} more technologies and skills`}
          >
            +{extraTechCount}
          </span>
        )}
      </div>

      {/* Precision Term Activity Micro-Histogram */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono mb-1.5">
          <span className="tracking-wider uppercase">Activity</span>
          <span className="text-[var(--text-secondary)]" style={{ fontFeatureSettings: '"tnum"' }}>
            {org.years.length} {org.years.length === 1 ? "year" : "years"} active
          </span>
        </div>

        {/* Micro-chart container */}
        <div className="h-10 flex items-end gap-1.5 p-1.5 rounded-xl bg-slate-50/80 dark:bg-[var(--bg-raised)] border border-slate-200/80 dark:border-[var(--border-card)]">
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
                  className={`text-[9px] font-mono mt-0.5 select-none ${
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
        className="px-4 py-2.5 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-card)] bg-[var(--bg-raised)]/20"
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
