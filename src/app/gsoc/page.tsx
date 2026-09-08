"use client";

import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Organization, FilterOptions } from "@/lib/types";
import { filterOrganizations, getFilterOptions, getActiveFilterCount, defaultFilterState } from "@/lib/data";
import { createSearchIndex, searchOrganizations } from "@/lib/search";
import { useFilterState } from "@/hooks/useFilterState";
import Header from "@/components/Header";
import SidebarFilter from "@/components/SidebarFilter";
import StatusBanner from "@/components/StatusBanner";
import OrganizationCard from "@/components/OrganizationCard";
import Fuse from "fuse.js";

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { filters, setFilters, clearFilters, initialized } = useFilterState();

  // Load data
  useEffect(() => {
    fetch("/data/gsoc-organizations.json")
      .then((res) => res.json())
      .then((data) => {
        setOrganizations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
        setLoading(false);
      });
  }, []);

  // Search index
  const searchIndex = useMemo(() => {
    if (organizations.length === 0) return null;
    return createSearchIndex(organizations);
  }, [organizations]);

  // Filter options
  const filterOptions: FilterOptions = useMemo(
    () => getFilterOptions(organizations),
    [organizations]
  );

  // Apply filters and search
  const filteredOrgs = useMemo(() => {
    if (!initialized) return [];

    let result = organizations;

    // Apply search
    if (filters.search && searchIndex) {
      result = searchOrganizations(searchIndex, filters.search);
    }

    // Apply filters
    result = filterOrganizations(result, filters);

    // Apply quick filters
    if (filters.quickFilters.includes("active")) {
      result = result.filter((org) =>
        org.terms.some((t) => t.includes("2026"))
      );
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

    return result;
  }, [organizations, filters, searchIndex, initialized]);

  const activeFilterCount = getActiveFilterCount(filters);

  // Close mobile menu on filter change
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [filters]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              animation: "pulse-glow 2s infinite",
            }}
          >
            <span className="text-white font-bold text-lg">LF</span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading organizations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-primary)" }}>
      <Header
        searchQuery={filters.search}
        onSearchChange={(query) => setFilters({ ...filters, search: query })}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="sidebar hidden lg:flex flex-col flex-shrink-0">
          <SidebarFilter
            filters={filters}
            options={filterOptions}
            activeCount={activeFilterCount}
            onFilterChange={setFilters}
            onClearAll={clearFilters}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50" />
            <div
              className="absolute left-0 top-0 bottom-0 w-80 animate-slide-in overflow-y-auto"
              style={{
                background: "var(--bg-secondary)",
                borderRight: "1px solid var(--border-card)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarFilter
                filters={filters}
                options={filterOptions}
                activeCount={activeFilterCount}
                onFilterChange={setFilters}
                onClearAll={clearFilters}
                isMobile
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <div className="max-w-[1400px] mx-auto">
            <StatusBanner />

            {/* Results Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15))",
                    color: "var(--accent-start)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  {filteredOrgs.length} {filteredOrgs.length === 1 ? "result" : "results"}
                </span>

                {filters.search && (
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    for &quot;{filters.search}&quot;
                  </span>
                )}
              </div>

              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hidden sm:inline-flex"
                  style={{
                    color: "var(--accent-start)",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.15)",
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Card Grid */}
            {filteredOrgs.length > 0 ? (
              <div className="card-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrgs.map((org) => (
                  <OrganizationCard
                    key={org.id}
                    org={org}
                    basePath="/gsoc/organization"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-card)",
                  }}
                >
                  <LayoutGrid size={28} style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="text-base font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  No organizations found
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                    color: "white",
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 mb-6 text-center">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Data sourced from{" "}
                <a
                  href="https://github.com/cncf/mentoring"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--accent-start)" }}
                >
                  cncf/mentoring
                </a>
                {" · "}Built with ❤️ for the open-source community
                {" · "}
                <a
                  href="https://github.com/rajatrsrivastav/ossgrid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--accent-start)" }}
                >
                  Contribute on GitHub
                </a>
              </p>
            </footer>
          </div>
        </main>
      </div>

      
    </div>
  );
}
