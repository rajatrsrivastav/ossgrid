"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { SearchX, ArrowUpRight } from "lucide-react";
import type Fuse from "fuse.js";
import type { ExplorerFilterState, ExplorerOrg, ProgramConfig } from "@/lib/explorer/types";
import { activeFilterCount, allFacetOptions, createExplorerIndex, defaultEmptyState, filterOrgs, searchOrgs } from "@/lib/explorer/filter";
import { useFilterState } from "@/hooks/useFilterState";
import Header from "@/components/Header";
import FacetSidebar from "@/components/explorer/FacetSidebar";
import ExplorerToolbar, { type ViewMode } from "@/components/explorer/ExplorerToolbar";
import WindowedGrid from "@/components/explorer/WindowedGrid";
import OrganizationCard from "@/components/OrganizationCard";
import CommandPalette from "@/components/CommandPalette";
import type { CardRoot } from "@/components/explorer/AnimatedCardGrid";

const AnimatedCardGrid = dynamic(() => import("@/components/explorer/AnimatedCardGrid"));

export function SkeletonCard() {
  return (
    <div className="card flex flex-col gap-3 p-5" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
      <div className="flex gap-1.5"><div className="skeleton h-6 w-16" /><div className="skeleton h-6 w-14" /></div>
      <div className="skeleton h-8 w-full" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  );
}

export interface ExplorerIntroContext {
  organizations: ExplorerOrg[];
  loading: boolean;
  filters: ExplorerFilterState;
}

interface ExplorerShellProps {
  config: ProgramConfig;
  organizations: ExplorerOrg[];
  loading: boolean;
  /** Program-specific intro (H1, facts, schedule). Rendered above the grid. */
  intro: (ctx: ExplorerIntroContext) => React.ReactNode;
  /** Program-specific overlays (about modal etc.). */
  overlays?: React.ReactNode;
  /** Pre-built Fuse index for the current organizations, when the program ships one. */
  searchIndex?: Fuse<ExplorerOrg> | null;
  /** Label for the per-org count: "project" (default). */
  unit?: string;
}

export default function ExplorerShell({ config, organizations, loading, intro, overlays, searchIndex: providedIndex, unit = "project" }: ExplorerShellProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<string>(config.sortOptions[0]?.id ?? "relevance");
  const gridRef = useRef<HTMLDivElement | null>(null);

  const { filters, setFilters, clearFilters, initialized } = useFilterState(config);

  // Debounced search input: the field updates immediately, filtering waits config.searchDebounceMs.
  const [searchInput, setSearchInput] = useState(filters.search);
  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (filters.search !== prevSearch) {
    // Committed search changed elsewhere (URL init, clear): mirror it into the field.
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchChange = useCallback((q: string) => {
    setSearchInput(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const commit = () => setFilters((prev) => ({ ...prev, search: q }));
    if (config.searchDebounceMs > 0) debounceRef.current = setTimeout(commit, config.searchDebounceMs);
    else commit();
  }, [config.searchDebounceMs, setFilters]);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  const builtIndex = useMemo(
    () => (providedIndex === undefined && organizations.length ? createExplorerIndex(organizations, config.searchKeys) : null),
    [providedIndex, organizations, config.searchKeys]
  );
  const searchIndex = providedIndex ?? builtIndex;

  const plotYears = useMemo(() => {
    if (config.plotYears) return config.plotYears(organizations);
    const max = organizations.reduce((m, o) => Math.max(m, ...o.years), 0) || new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => max - 4 + i);
  }, [organizations, config]);

  const filteredOrgs = useMemo(() => {
    if (!initialized) return organizations;
    let result = organizations;
    if (filters.search && searchIndex) result = searchOrgs(searchIndex, filters.search);
    result = filterOrgs(result, filters, config);
    const sort = config.sortOptions.find((s) => s.id === sortBy);
    if (sort?.compare) result = [...result].sort(sort.compare);
    return result;
  }, [organizations, filters, searchIndex, initialized, sortBy, config]);

  const facetOptions = useMemo(() => allFacetOptions(config, organizations, filteredOrgs), [config, organizations, filteredOrgs]);
  const quickFilterCounts = useMemo(
    () => Object.fromEntries((config.quickFilters || []).map((q) => [q.id, organizations.filter(q.predicate).length])),
    [config.quickFilters, organizations]
  );
  const activeCount = activeFilterCount(filters);
  const categoryFacet = config.facets.find((f) => f.isCategory);
  const selectedCategory = categoryFacet ? filters.facets[categoryFacet.id]?.[0] || null : null;

  const resetAll = () => { clearFilters(); setSearchInput(""); };

  const empty = (config.emptyState ?? defaultEmptyState)(filters, config.facets);
  const windowed = filteredOrgs.length > config.virtualizeAbove;

  const sidebar = (isMobile: boolean) => (
    <FacetSidebar
      facets={config.facets}
      quickFilters={config.quickFilters}
      quickFilterCounts={quickFilterCounts}
      options={facetOptions}
      filters={filters}
      activeCount={activeCount}
      onFilterChange={setFilters}
      onClearAll={resetAll}
      isMobile={isMobile}
      onClose={() => setFiltersOpen(false)}
    />
  );

  const renderCard = (org: ExplorerOrg, Root?: CardRoot) => (
    <OrganizationCard key={org.id} org={org} years={plotYears} accentVar={config.accentVar} Root={Root} unit={unit} />
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Header
        variant="full"
        searchQuery={searchInput}
        onSearchChange={onSearchChange}
        onMenuToggle={() => setFiltersOpen((o) => !o)}
        isMobileMenuOpen={filtersOpen}
        onCommandPaletteOpen={() => setCmdOpen(true)}
        searchPlaceholder={config.searchPlaceholder}
        searchAriaLabel={config.searchAriaLabel}
      />

      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {intro({ organizations, loading, filters })}

        {/* Grid */}
        <section id="grid" ref={gridRef} aria-labelledby="grid-heading" className="scroll-mt-24">
          <h2 id="grid-heading" className="mb-3 text-lg font-semibold text-[var(--text-primary)]">Browse organizations</h2>

          <ExplorerToolbar
            tabs={config.categoryTabs}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              if (!categoryFacet) return;
              setFilters({ ...filters, facets: { ...filters.facets, [categoryFacet.id]: cat ? [cat] : [] } });
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortOptions={config.sortOptions}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredOrgs.length}
            searchQuery={filters.search}
            activeFilterCount={activeCount}
            onResetFilters={resetAll}
            onOpenMobileFilters={() => setFiltersOpen(true)}
          />

          <div className="flex flex-col items-start gap-4 lg:flex-row">
            <aside className="panel sticky top-20 hidden w-[280px] shrink-0 overflow-y-auto p-3 lg:block" style={{ maxHeight: "calc(100vh - 6rem)" }} aria-label="Filters">
              {sidebar(false)}
            </aside>

            <div className="w-full min-w-0 flex-1">
              {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : filteredOrgs.length === 0 ? (
                <div className="card flex flex-col items-center px-6 py-16 text-center">
                  <SearchX size={24} className="mb-3 text-[var(--text-muted)]" aria-hidden="true" />
                  <p className="text-base font-semibold text-[var(--text-primary)]">{empty.hint}</p>
                  <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">{empty.advice}</p>
                  <button type="button" onClick={resetAll} className="btn btn-secondary mt-5">Clear all filters</button>
                </div>
              ) : viewMode === "grid" ? (
                windowed ? (
                  <WindowedGrid items={filteredOrgs} renderItem={(org) => renderCard(org)} />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {config.animateCards ? (
                      <AnimatedCardGrid items={filteredOrgs} renderCard={renderCard} />
                    ) : (
                      filteredOrgs.map((org) => renderCard(org))
                    )}
                  </div>
                )
              ) : (
                <ul className="flex flex-col gap-2">
                  {filteredOrgs.map((org) => (
                    <li key={org.id}>
                      <Link
                        href={org.href}
                        className="card card-interactive flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-chip)] border border-[var(--border)] bg-white">
                            <Image src={org.logoUrl || "/placeholder.svg"} alt="" width={36} height={36} unoptimized className="h-full w-full object-contain p-1" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{org.name}</span>
                            <span className="block truncate text-xs text-[var(--text-muted)]">
                              {org.category} · {org.technologies.slice(0, 3).join(", ")}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="num text-xs text-[var(--text-secondary)]">{org.projectCount} {org.projectCount === 1 ? unit : `${unit}s`}</span>
                          <ArrowUpRight size={15} className="text-[var(--text-muted)]" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
                {config.attribution.text}{" "}
                {config.attribution.links.map((l, i) => (
                  <span key={l.href}>
                    {i > 0 && " and "}
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
                      {l.label}
                    </a>
                  </span>
                ))}
                {config.attribution.suffix}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[min(100%,360px)] overflow-y-auto bg-[var(--bg-raised)] p-4 shadow-[var(--shadow-modal)]">
            {sidebar(true)}
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary mt-4 w-full">
              Show {filteredOrgs.length} {filteredOrgs.length === 1 ? "organization" : "organizations"}
            </button>
          </div>
        </div>
      )}

      {overlays}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} organizations={organizations} />
    </div>
  );
}
