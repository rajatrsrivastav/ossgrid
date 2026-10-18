"use client";

import { useEffect, useRef, useState } from "react";
import { githubRepo } from "@/lib/github-repos";

interface Metadata { hasIssues: boolean; guideUrl: string | null }
const requests = new Map<string, Promise<Metadata | null>>();
function loadMetadata(slug: string) {
  let request = requests.get(slug);
  if (!request) {
    request = fetch(`/api/github-repository?repo=${encodeURIComponent(slug)}`)
      .then((response) => response.ok ? response.json() as Promise<Metadata> : null)
      .catch(() => null);
    requests.set(slug, request);
  }
  return request;
}

export default function GitHubRepoActions({ url, compact = false }: { url?: string; compact?: boolean }) {
  const repo = githubRepo(url);
  const slug = repo?.slug;
  const [details, setDetails] = useState<{ slug: string; metadata: Metadata | null } | null>(null);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !slug) return;
    let cancelled = false;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      void loadMetadata(slug).then((metadata) => { if (!cancelled) setDetails({ slug, metadata }); });
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); };
  }, [slug]);
  if (!repo) return null;
  const metadata = details && details.slug === slug ? details.metadata : null;
  const linkClass = "underline underline-offset-4 hover:text-[var(--text-primary)]";
  return (
    <nav ref={ref} aria-label={`Contribute to ${repo.slug}`} className={`relative z-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-[var(--text-secondary)] ${compact ? "text-xs" : "text-sm"}`}>
      <a href={repo.url} target="_blank" rel="noopener noreferrer" className={linkClass}>View Repository</a>
      <a href={metadata?.guideUrl || `${repo.url}#readme`} target="_blank" rel="noopener noreferrer" className={linkClass} title={metadata?.guideUrl ? "Read the contribution guide" : "Start with the repository README for contribution guidance"}>Contribute</a>
      {metadata?.hasIssues && <a href={`${repo.url}/issues`} target="_blank" rel="noopener noreferrer" className={linkClass}>Report Issue</a>}
      <a href={`${repo.url}/graphs/contributors`} target="_blank" rel="noopener noreferrer" className={linkClass}>View Contributors</a>
    </nav>
  );
}
