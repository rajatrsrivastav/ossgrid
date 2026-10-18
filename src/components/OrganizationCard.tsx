"use client";

import GitHubRepoActions from "./GitHubRepoActions";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { ExplorerOrg } from "@/lib/explorer/types";
import { truncate, sanitizeDescription, cn } from "@/lib/utils";

interface OrganizationCardProps {
  org: ExplorerOrg;
  /** Years to plot in the activity strip, oldest first. Defaults to the last five years in the org data. */
  years?: number[];
  /** CSS variable holding the program colour. */
  accentVar?: string;
  /** Root element. ExplorerShell passes a framer-motion article when the program animates cards. */
  Root?: React.ComponentType<{ className?: string; style?: React.CSSProperties; children?: React.ReactNode }>;
  /** Label for the per-year counts, e.g. "project". */
  unit?: string;
  isSelected?: boolean;
}

function getInitials(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase() || name.slice(0, 1).toUpperCase();
}

const NOISE = ["understanding", "familiarity", "experience", "knowledge", "ability", "optional", "concepts", "basic", "e2e", "pipelines", "http", ".md"];

function getListingTechnologies(technologies: string[], maxCount: number) {
  if (!technologies?.length) return { visible: [] as string[], extraCount: 0 };
  const clean = technologies.filter((t) => {
    if (!t || t.length > 22) return false;
    const lower = t.toLowerCase();
    return !NOISE.some((n) => lower.includes(n)) && !lower.startsWith("(");
  });
  const visible = clean.slice(0, maxCount);
  return { visible, extraCount: Math.max(technologies.length - visible.length, 0) };
}

export default function OrganizationCard({ org, years, accentVar = "--program-lfx", Root = "article" as unknown as NonNullable<OrganizationCardProps["Root"]>, unit = "project", isSelected = false }: OrganizationCardProps) {
  const [imgError, setImgError] = useState(false);
  const showFallback = !org.logoUrl || imgError;

  const { visible: visibleTech, extraCount } = useMemo(() => getListingTechnologies(org.technologies, 3), [org.technologies]);

  const plotYears = useMemo(() => {
    if (years?.length) return years;
    const max = Math.max(...org.years, new Date().getFullYear());
    return Array.from({ length: 5 }, (_, i) => max - 4 + i);
  }, [years, org.years]);

  const yearlyCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    plotYears.forEach((y) => (counts[y] = org.yearlyCounts[y] || 0));
    return counts;
  }, [org.yearlyCounts, plotYears]);
  const maxProjects = Math.max(...Object.values(yearlyCounts), 1);
  const yearSpan = org.years.length ? `${Math.min(...org.years)}–${Math.max(...org.years)}` : "";

  const description = truncate(sanitizeDescription(org.description, org.name), 140);
  const plural = `${unit}s`;

  const className = cn(
    "card card-interactive group relative flex flex-col p-5",
    "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--accent)]",
    isSelected && "card-selected"
  );
  const style = { "--program-color": `var(${accentVar})` } as React.CSSProperties;

  const body = (
    <>
      {/* Identity */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-white"
          aria-hidden="true"
        >
          {showFallback ? (
            <span className="num text-xs font-semibold text-[#1a1917]">{getInitials(org.name)}</span>
          ) : (
            <Image
              src={org.logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-contain p-1.5"
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold leading-tight text-[var(--text-primary)]">
            <Link
              href={org.href}
              className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none"
            >
              {org.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
            {org.category}
            {yearSpan && <span className="num"> · {yearSpan}</span>}
            {org.badge && <span className="ml-1.5 font-medium text-[var(--program-color)]">· {org.badge}</span>}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>

      {/* Tech */}
      <ul className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Technologies">
        {visibleTech.map((tech) => (
          <li key={tech} className="chip chip-mono max-w-[140px]" title={tech}>
            <span>{tech}</span>
          </li>
        ))}
        {extraCount > 0 && (
          <li className="chip chip-quiet chip-mono" title={`${extraCount} more technologies`}>
            <span>+{extraCount}</span>
          </li>
        )}
      </ul>

      {/* Activity strip: projects per year */}
      <div className="mt-4" aria-label={`${plural[0].toUpperCase()}${plural.slice(1)} per year, ${plotYears[0]} to ${plotYears[plotYears.length - 1]}`}>
        <div className="flex h-8 items-end gap-1">
          {plotYears.map((year) => {
            const count = yearlyCounts[year] || 0;
            const pct = count > 0 ? Math.max(Math.round((count / maxProjects) * 100), 20) : 0;
            return (
              <div key={year} className="flex h-full flex-1 flex-col justify-end" title={`${year}: ${count} ${count === 1 ? unit : plural}`}>
                <div
                  className={cn("w-full rounded-[2px]", count > 0 ? "bg-[var(--program-color)]" : "bg-[var(--border)]")}
                  style={{ height: count > 0 ? `${pct}%` : "2px", opacity: count > 0 ? 0.9 : 1 }}
                />
              </div>
            );
          })}
        </div>
        <div className="num mt-1 flex justify-between text-xs text-[var(--text-muted)]" aria-hidden="true">
          <span>{String(plotYears[0]).slice(2).padStart(3, "'")}</span>
          <span>{String(plotYears[plotYears.length - 1]).slice(2).padStart(3, "'")}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
        <span className="num text-[var(--text-secondary)]">
          <strong className="font-semibold text-[var(--text-primary)]">{org.projectCount}</strong>{" "}
          {org.projectCount === 1 ? unit : plural}
          <span className="text-[var(--text-muted)]"> · {org.years.length} {org.years.length === 1 ? "year" : "years"}</span>
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]">
          View details <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      </div>

      {org.repositoryUrl && <div className="mt-3"><GitHubRepoActions url={org.repositoryUrl} compact /></div>}

      {/* Outbound links sit above the stretched card link so they stay clickable. */}
      {org.links && org.links.length > 0 && (
        <ul className="relative z-10 mt-3 flex flex-wrap gap-1.5" aria-label="Links">
          {org.links.map((l) => (
            <li key={`${l.label}-${l.href}`}>
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="chip h-7 hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]">
                <span>{l.label}</span>
                <ExternalLink size={11} className="text-[var(--text-muted)]" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <Root className={className} style={style}>
      {body}
    </Root>
  );
}
