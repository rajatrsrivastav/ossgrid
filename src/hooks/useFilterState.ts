"use client";

import { useState, useCallback, useEffect } from "react";
import { FilterState } from "@/lib/types";
import { defaultFilterState } from "@/lib/data";

function parseUrlFilters(): Partial<FilterState> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const result: Partial<FilterState> = {};

  const q = params.get("q");
  if (q) result.search = q;

  const terms = params.get("terms");
  if (terms) result.terms = terms.split(",").filter(Boolean);

  const categories = params.get("categories");
  if (categories) result.categories = categories.split(",").filter(Boolean);

  const tech = params.get("tech");
  if (tech) result.technologies = tech.split(",").filter(Boolean);

  const years = params.get("years");
  if (years) result.years = years.split(",").map(Number).filter((n) => !isNaN(n));

  return result;
}

function syncUrlFilters(filters: FilterState) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.terms.length > 0) params.set("terms", filters.terms.join(","));
  if (filters.categories.length > 0) params.set("categories", filters.categories.join(","));
  if (filters.technologies.length > 0) params.set("tech", filters.technologies.join(","));
  if (filters.years.length > 0) params.set("years", filters.years.join(","));

  const str = params.toString();
  const newUrl = str ? `${window.location.pathname}?${str}` : window.location.pathname;

  window.history.replaceState(null, "", newUrl);
}

export function useFilterState() {
  const [filters, setFiltersInternal] = useState<FilterState>(defaultFilterState);
  const [initialized, setInitialized] = useState(false);

  // Initialize from URL on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const urlFilters = parseUrlFilters();
      setFiltersInternal({ ...defaultFilterState, ...urlFilters });
      setInitialized(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setFilters = useCallback((newFilters: FilterState) => {
    setFiltersInternal(newFilters);
    syncUrlFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersInternal(defaultFilterState);
    syncUrlFilters(defaultFilterState);
  }, []);

  return { filters, setFilters, clearFilters, initialized };
}
