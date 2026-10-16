"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ExplorerFilterState, ProgramConfig } from "@/lib/explorer/types";
import { emptyFilterState } from "@/lib/explorer/filter";

type UrlConfig = Pick<ProgramConfig, "facets" | "quickFilters">;

const QUICK_KEY = "quick";

/** Read filters from the query string. Keys come from each facet's urlKey, so LFX links (q, terms, categories, tech, years) keep working. */
export function parseUrlFilters(config: UrlConfig, search: string): ExplorerFilterState {
  const params = new URLSearchParams(search);
  const state = emptyFilterState(config);
  const q = params.get("q");
  if (q) state.search = q;
  for (const def of config.facets) {
    if (!def.urlKey) continue;
    const raw = params.get(def.urlKey);
    if (!raw) continue;
    let values = raw.split(",").filter(Boolean);
    if (def.sort === "valueDesc") values = values.filter((v) => !isNaN(Number(v))).map((v) => String(Number(v)));
    state.facets[def.id] = values;
  }
  const quick = params.get(QUICK_KEY);
  if (quick && config.quickFilters?.length) {
    const known = new Set(config.quickFilters.map((f) => f.id));
    state.quickFilters = quick.split(",").filter((id) => known.has(id));
  }
  return state;
}

export function buildUrlQuery(config: UrlConfig, filters: ExplorerFilterState): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  for (const def of config.facets) {
    if (!def.urlKey) continue;
    const values = filters.facets[def.id];
    if (values?.length) params.set(def.urlKey, values.join(","));
  }
  if (filters.quickFilters.length) params.set(QUICK_KEY, filters.quickFilters.join(","));
  return params.toString();
}

function syncUrl(config: UrlConfig, filters: ExplorerFilterState) {
  if (typeof window === "undefined") return;
  const str = buildUrlQuery(config, filters);
  const newUrl = str ? `${window.location.pathname}?${str}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
}

export function useFilterState(config: UrlConfig) {
  const empty = useMemo(() => emptyFilterState(config), [config]);
  const [filters, setFiltersInternal] = useState<ExplorerFilterState>(empty);
  const [initialized, setInitialized] = useState(false);

  // Initialize from URL on mount (after hydration, so server and client markup match).
  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltersInternal(parseUrlFilters(config, window.location.search));
      setInitialized(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [config]);

  const setFilters = useCallback((next: ExplorerFilterState | ((prev: ExplorerFilterState) => ExplorerFilterState)) => {
    setFiltersInternal((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      syncUrl(config, resolved);
      return resolved;
    });
  }, [config]);

  const clearFilters = useCallback(() => {
    setFiltersInternal(empty);
    syncUrl(config, empty);
  }, [config, empty]);

  return { filters, setFilters, clearFilters, initialized };
}
