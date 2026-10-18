"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Layers, Users, FileText, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrgSectionNavProps {
  projectCount: number;
  mentorCount: number;
}

interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export default function OrgSectionNav({ projectCount, mentorCount }: OrgSectionNavProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const isClickScrolling = useRef(false);
  const clickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const tabs: NavTab[] = useMemo(() => {
    const list: NavTab[] = [
      { id: "overview", label: "Overview", icon: FileText },
      { id: "projects", label: "Projects", icon: Layers, count: projectCount },
    ];
    if (mentorCount > 0) list.push({ id: "mentors", label: "Mentors", icon: Users, count: mentorCount });
    return list;
  }, [projectCount, mentorCount]);

  const scrollToSection = (id: string, updateHash = true) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (id === "overview") {
      window.scrollTo({ top: 0, behavior });
    } else {
      const el = document.getElementById(id);
      if (el) {
        const targetY = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: Math.max(0, targetY), behavior });
      }
    }
    setActiveSection(id);
    if (updateHash) window.history.pushState(null, "", `#${id}`);
    isClickScrolling.current = true;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => { isClickScrolling.current = false; }, 750);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (atBottom) { setActiveSection(tabs[tabs.length - 1].id); return; }
      if (window.scrollY < 120) { setActiveSection("overview"); return; }
      for (let i = tabs.length - 1; i >= 0; i--) {
        const el = document.getElementById(tabs[i].id);
        if (el && el.getBoundingClientRect().top <= 140) { setActiveSection(tabs[i].id); break; }
      }
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [tabs]);

  useEffect(() => {
    const btn = scrollContainerRef.current?.querySelector<HTMLElement>(`[data-section-id="${activeSection}"]`);
    btn?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSection]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && tabs.some((t) => t.id === hash)) {
      const t = setTimeout(() => scrollToSection(hash, false), 120);
      return () => clearTimeout(t);
    }
  }, [tabs]);

  return (
    <nav aria-label="Sections" className="sticky top-16 z-30 w-full border-b border-[var(--border)] bg-[var(--bg-base)]/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div ref={scrollContainerRef} className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto px-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                data-section-id={tab.id}
                onClick={(e) => { e.preventDefault(); scrollToSection(tab.id); }}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] border px-3 text-xs font-medium transition-colors",
                  isActive
                    ? "border-[var(--accent-ring)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon size={13} aria-hidden="true" />
                {tab.label}
                {tab.count !== undefined && <span className="num text-[var(--text-muted)]">{tab.count}</span>}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
