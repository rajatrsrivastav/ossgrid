"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  SearchX,
  ArrowUpRight,
  Compass,
  ArrowRight,
  ArrowLeft,
  Calendar,
  DollarSign,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Bookmark,
  Layers,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { Organization, FilterOptions } from "@/lib/types";
import {
  filterOrganizations,
  getFilterOptions,
  getActiveFilterCount,
} from "@/lib/data";
import { createSearchIndex, searchOrganizations } from "@/lib/search";
import { useFilterState } from "@/hooks/useFilterState";
import Header from "@/components/Header";
import SidebarFilter, { NavItem } from "@/components/SidebarFilter";
import OrganizationCard from "@/components/OrganizationCard";
import CategoryBar, { ViewMode, SortOption } from "@/components/CategoryBar";
import AboutModal from "@/components/AboutModal";
import CommandPalette from "@/components/CommandPalette";
import Footer from "@/components/Footer";
import { AnimatePresence } from "framer-motion";

/* ── Skeleton card ─────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="glass-card flex flex-col h-full p-5 gap-3 rounded-2xl border border-[var(--border-card)]"
      style={{ minHeight: 220, background: "var(--bg-card)" }}
    >
      <div className="flex items-start gap-3">
        <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-4 rounded-md w-3/4" />
          <div className="flex gap-2">
            <div className="skeleton h-4 rounded-full w-16" />
            <div className="skeleton h-4 rounded-full w-20" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 mt-2">
        <div className="skeleton h-3 rounded w-full" />
        <div className="skeleton h-3 rounded w-5/6" />
      </div>
      <div className="flex gap-1.5 pt-2">
        <div className="skeleton h-5 rounded-md w-14" />
        <div className="skeleton h-5 rounded-md w-14" />
        <div className="skeleton h-5 rounded-md w-14" />
      </div>
    </div>
  );
}

export default function LFXPortalPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [activeNavItem, setActiveNavItem] = useState<NavItem>("home");
  const [selectedSizes, setSelectedSizes] = useState<("large" | "medium" | "small")[]>([]);

  const [savedOrgIds, setSavedOrgIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("ossgrid_saved_orgs");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const gridRef = useRef<HTMLDivElement | null>(null);
  const cohortsRef = useRef<HTMLDivElement | null>(null);

  const { filters, setFilters, clearFilters, initialized } = useFilterState();

  const toggleSaveOrg = (orgId: string) => {
    setSavedOrgIds((prev) => {
      const updated = prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId];
      try {
        localStorage.setItem("ossgrid_saved_orgs", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Load organizations data
  useEffect(() => {
    fetch("/data/organizations.json")
      .then((r) => r.json())
      .then((data: Organization[]) => {
        setOrganizations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const searchIndex = useMemo(() => {
    if (!organizations.length) return null;
    return createSearchIndex(organizations);
  }, [organizations]);

  const filteredOrgs = useMemo(() => {
    if (!initialized) return [];

    let result = organizations;

    if (activeNavItem === "saved") {
      result = result.filter((org) => savedOrgIds.includes(org.id));
    }

    if (filters.search && searchIndex) {
      result = searchOrganizations(searchIndex, filters.search);
    }

    result = filterOrganizations(result, filters);

    if (selectedSizes.length > 0) {
      result = result.filter((org) => {
        const isLarge = org.projectCount >= 15;
        const isMedium = org.projectCount >= 5 && org.projectCount < 15;
        const isSmall = org.projectCount < 5;
        if (selectedSizes.includes("large") && isLarge) return true;
        if (selectedSizes.includes("medium") && isMedium) return true;
        if (selectedSizes.includes("small") && isSmall) return true;
        return false;
      });
    }

    if (filters.quickFilters.includes("active")) {
      result = result.filter((org) => org.terms.some((t) => t.includes("2026") || t.includes("2025")));
    }
    if (filters.quickFilters.includes("first-time")) {
      result = result.filter((org) => org.years.length === 1);
    }
    if (filters.quickFilters.includes("beginner")) {
      result = result.filter((org) =>
        org.technologies.some((t) =>
          ["Python", "JavaScript", "TypeScript", "Documentation", "Go"].includes(t)
        )
      );
    }

    if (sortBy === "projects") {
      result = [...result].sort((a, b) => b.projectCount - a.projectCount);
    } else if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [organizations, filters, searchIndex, initialized, activeNavItem, savedOrgIds, selectedSizes, sortBy]);

  const sizeCounts = useMemo(() => {
    let large = 0;
    let medium = 0;
    let small = 0;
    for (const org of organizations) {
      if (org.projectCount >= 15) large++;
      else if (org.projectCount >= 5) medium++;
      else small++;
    }
    return { large, medium, small };
  }, [organizations]);

  const filterOptions: FilterOptions = useMemo(
    () => getFilterOptions(organizations, filteredOrgs),
    [organizations, filteredOrgs]
  );

  const activeFilterCount =
    getActiveFilterCount(filters) +
    selectedSizes.length +
    (activeNavItem === "saved" ? 1 : 0);

  const scrollToGrid = () => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToCohorts = () => {
    if (cohortsRef.current) {
      cohortsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavSelect = (item: NavItem) => {
    setActiveNavItem(item);
    if (item === "about") {
      setAboutModalOpen(true);
    } else if (item === "organizations") {
      scrollToGrid();
    } else if (item === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalProjectCount = useMemo(() => {
    return organizations.reduce((acc, o) => acc + o.projectCount, 0);
  }, [organizations]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Header */}
      <Header
        variant="full"
        searchQuery={filters.search}
        onSearchChange={(q) => {
          setFilters({ ...filters, search: q });
          if (q) scrollToGrid();
        }}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
        onCommandPaletteOpen={() => setCmdOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        savedCount={savedOrgIds.length}
      />

      <div className="flex-1 flex flex-col w-full max-w-[1920px] mx-auto px-4 lg:px-8 py-6">

        {/* ══════════════════════════════════════════════════════════════════════
            STAGE 1: LFX HOMEPAGE & OVERVIEW
        ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full rounded-3xl overflow-hidden mb-12 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-xl transition-all">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(var(--text-primary) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute -top-32 right-10 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}
          />

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14">
            {/* Top Breadcrumb link back to OSSGrid home */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-blue-400 transition-colors mb-6"
            >
              <ArrowLeft size={13} />
              Back to OSSGrid Programs Guidebook
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                {/* Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    The Linux Foundation & CNCF Mentorship Program
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Next: 2027 Term 1 Upcoming
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-[-0.03em] leading-[1.12] mb-5 text-[var(--text-primary)]">
                  Linux Foundation (LFX) Mentorship Portal
                </h1>

                <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
                  The flagship mentorship program of <strong>The Linux Foundation</strong> and <strong>Cloud Native Computing Foundation (CNCF)</strong>.
                  Connect directly with core maintainers across {organizations.length || 96}+ organizations, work on critical infrastructure projects, and earn a <strong className="text-[var(--text-primary)]">$3,000 to $6,600 USD stipend</strong> through 12-week or 24-week terms.
                </p>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-3.5 mb-8">
                  <button
                    onClick={scrollToGrid}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      boxShadow: "0 4px 18px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    <Compass size={17} />
                    Explore Organizations Grid
                    <ArrowRight size={16} />
                  </button>

                  <button
                    onClick={scrollToCohorts}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:border-blue-500/50 hover:bg-[var(--bg-card)] transition-all cursor-pointer"
                  >
                    <Calendar size={16} className="text-blue-400" />
                    Cohort Schedule & Terms
                  </button>

                  <a
                    href="https://mentorship.lfx.linuxfoundation.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span>Official Portal</span>
                    <ExternalLink size={14} className="text-[var(--text-muted)]" />
                  </a>
                </div>

                {/* Key Benefits Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[var(--border-card)]">
                  <div>
                    <div className="text-xs font-mono uppercase text-[var(--text-muted)]">Organizations</div>
                    <div className="text-2xl font-black font-mono text-[var(--text-primary)]">{organizations.length || 96}+</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[var(--text-muted)]">Projects</div>
                    <div className="text-2xl font-black font-mono text-[var(--text-primary)]">{totalProjectCount || 400}+</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[var(--text-muted)]">Stipend Range</div>
                    <div className="text-2xl font-black font-mono text-emerald-400">$3k - $6.6k</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[var(--text-muted)]">Annual Cohorts</div>
                    <div className="text-2xl font-black font-mono text-purple-400">3 Terms</div>
                  </div>
                </div>
              </div>

              {/* Right decorative stats card */}
              <div className="lg:col-span-4 hidden lg:flex flex-col gap-3.5 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 font-mono">
                  <ShieldCheck size={16} /> Why LFX Mentorship?
                </div>
                <ul className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>1-on-1 Mentorship</strong> with core maintainers of CNCF & LF projects.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>No University Required</strong>: Open to anyone 18+ worldwide.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Production Code</strong>: Real pull requests deployed to billions of devices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Up to 3 Applications</strong> allowed per applicant each term.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            STAGE 2: OPEN MENTORSHIP SECTION & TERMS
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="cohorts" ref={cohortsRef} className="w-full mb-14 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 font-mono mb-1">
                <Calendar size={14} /> Cohort Schedule & Active Terms
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                LFX Mentorship Cycles & Real-Time Status
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Updated for 2026–2027 Cycles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 2026 Term 2 */}
            <div className="p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-secondary)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[var(--bg-raised)] text-[var(--text-muted)]">
                    2026 Term 2
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    CLOSED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Summer Cohort</h3>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-3">June 1 – August 31, 2026</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Mid-year cycle running in parallel with Summer open source programs. Mentees present at KubeCon.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                Concluded
              </div>
            </div>

            {/* 2026 Term 3 - OVER */}
            <div className="p-6 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-secondary)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[var(--bg-raised)] text-[var(--text-muted)]">
                    2026 Term 3
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    OVER / CLOSED
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Fall Cohort</h3>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-3">September 1 – November 30, 2026</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  This year&apos;s Term 3 is over. Applications are closed and mentees are currently completing their deliverables.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border-card)] text-xs text-[var(--text-muted)] flex items-center justify-between">
                <span>Cycle Concluded</span>
                <span className="font-mono text-[10px]">Applications Closed</span>
              </div>
            </div>

            {/* 2027 Term 1 - UPCOMING NEXT CYCLE */}
            <div
              className="p-6 rounded-2xl border-2 flex flex-col justify-between relative overflow-hidden"
              style={{
                borderColor: "#3b82f6",
                background: "linear-gradient(145deg, var(--bg-secondary) 0%, rgba(59,130,246,0.08) 100%)",
                boxShadow: "0 0 24px rgba(59,130,246,0.15)",
              }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    2027 Term 1 (Next)
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    UPCOMING
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Spring Cohort 2027</h3>
                <p className="text-xs font-mono text-blue-400 font-semibold mb-3">March 1 – May 31, 2027</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  The upcoming mentorship cycle. Review participating organizations and prepare contributions before project applications open on the LFX Portal.
                </p>
              </div>
              <button
                onClick={scrollToGrid}
                className="btn-primary w-full justify-center text-xs py-2.5 font-bold cursor-pointer"
              >
                Browse Organizations for 2027 T1 ↓
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            STAGE 3: THE ALL ORGANIZATIONS & PROJECTS GRID
        ══════════════════════════════════════════════════════════════════════ */}
        <section id="grid" ref={gridRef} className="pt-2 scroll-mt-20">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 font-mono mb-1">
              <Layers size={14} /> The All Organizations Grid
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              Explore {organizations.length || 96} Linux Foundation Organizations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Filter by technology stack, foundation, size, or active 2026 participation. Click any organization to inspect its dedicated profile with project history and analytics.
            </p>
          </div>

          {/* Unified Command Toolbar */}
          <CategoryBar
            selectedCategory={filters.categories[0] || null}
            onSelectCategory={(cat) =>
              setFilters({ ...filters, categories: cat ? [cat] : [] })
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            allCategories={filterOptions.categories}
            resultCount={filteredOrgs.length}
            searchQuery={filters.search}
            isSavedActive={activeNavItem === "saved"}
            activeFilterCount={activeFilterCount}
            onResetFilters={() => {
              clearFilters();
              setSelectedSizes([]);
              setActiveNavItem("home");
            }}
            onOpenMobileFilters={() => setMobileMenuOpen(true)}
          />

          {/* Main Layout: Sidebar Filter + Cards Grid */}
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Desktop Left Filter Sidebar */}
            <aside
              className="hidden lg:block w-64 flex-shrink-0 sticky top-24 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-secondary)] p-3 shadow-md overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              <SidebarFilter
                filters={filters}
                options={filterOptions}
                activeCount={activeFilterCount}
                onFilterChange={setFilters}
                onClearAll={() => {
                  clearFilters();
                  setSelectedSizes([]);
                  setActiveNavItem("home");
                }}
                savedCount={savedOrgIds.length}
                activeNavItem={activeNavItem}
                onSelectNav={handleNavSelect}
                selectedSizes={selectedSizes}
                onSizeChange={setSelectedSizes}
                sizeCounts={sizeCounts}
              />
            </aside>

            {/* Center Content Column */}
            <div className="flex-1 w-full min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredOrgs.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {filteredOrgs.map((org) => (
                        <OrganizationCard
                          key={org.id}
                          org={org}
                          isSelected={false}
                          onSelect={undefined}
                          isSaved={savedOrgIds.includes(org.id)}
                          onToggleSave={toggleSaveOrg}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Compact List View */
                  <div className="space-y-2.5">
                    {filteredOrgs.map((org) => {
                      return (
                        <div
                          key={org.id}
                          onClick={() => window.location.href = `/organization/${org.id}`}
                          className="p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--border-hover)]"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono flex-shrink-0 border border-white/10"
                              style={{ background: "var(--bg-raised)" }}
                            >
                              {org.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold truncate text-[var(--text-primary)]">
                                {org.name}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] truncate">
                                {org.category} • {org.technologies.slice(0, 3).join(", ")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-[var(--bg-input)] text-[var(--text-secondary)]">
                              {org.projectCount} projects
                            </span>
                            <Link
                              href={`/organization/${org.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-blue-400 transition-colors"
                            >
                              <ArrowUpRight size={15} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                /* No Results Empty State */
                <div className="py-20 text-center flex flex-col items-center justify-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)]">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                    <SearchX size={26} />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                    No matching organizations
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">
                    Try relaxing your filters, searching for a different language, or clearing all criteria.
                  </p>
                  <button
                    onClick={() => {
                      clearFilters();
                      setSelectedSizes([]);
                      setActiveNavItem("home");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-input)] border border-[var(--border-card)] hover:border-blue-500/40 text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

      <Footer />

      <AboutModal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        organizations={organizations}
      />
    </div>
  );
}
