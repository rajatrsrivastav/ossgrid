"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Sparkles, Layers, Users, Calendar } from "lucide-react";

interface OrgSectionNavProps {
  projectCount: number;
  mentorCount: number;
  yearCount: number;
}

interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  count?: number | string;
}

export default function OrgSectionNav({
  projectCount,
  mentorCount,
  yearCount,
}: OrgSectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const isClickScrolling = useRef(false);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const tabs: NavTab[] = useMemo(() => {
    const list: NavTab[] = [
      { id: "overview", label: "Overview", icon: Sparkles },
      { id: "projects", label: "Projects", icon: Layers, count: projectCount },
    ];

    if (mentorCount > 0) {
      list.push({
        id: "mentors",
        label: "Mentors",
        icon: Users,
        count: mentorCount,
      });
    }

    list.push({
      id: "participation",
      label: "Participation",
      icon: Calendar,
      count: `${yearCount} yrs`,
    });

    return list;
  }, [projectCount, mentorCount, yearCount]);

  const scrollToSection = (id: string, updateHash = true) => {
    if (id === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(id);
      if (el) {
        // 56px main header + 48px sticky nav + 12px breathing room = 116px
        const topOffset = 116;
        const targetY = el.getBoundingClientRect().top + window.scrollY - topOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
      }
    }

    setActiveSection(id);
    if (updateHash && typeof window !== "undefined") {
      window.history.pushState(null, "", `#${id}`);
    }

    isClickScrolling.current = true;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    clickTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 750);
  };

  // Scroll spy to highlight active section while scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isClickScrolling.current) return;

      // When near bottom of page, activate the last tab (typically participation)
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;
      if (isAtBottom) {
        const lastTab = tabs[tabs.length - 1];
        if (lastTab) setActiveSection(lastTab.id);
        return;
      }

      // Near top of page, activate overview
      if (window.scrollY < 120) {
        setActiveSection("overview");
        return;
      }

      // Scan sections from bottom to top to find the current active section
      for (let i = tabs.length - 1; i >= 0; i--) {
        const tab = tabs[i];
        const el = document.getElementById(tab.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(tab.id);
            break;
          }
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [tabs]);

  // Keep active tab visible in horizontal container on mobile
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector(
      `[data-section-id="${activeSection}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      const container = scrollContainerRef.current;
      const btnLeft = activeBtn.offsetLeft;
      const btnRight = btnLeft + activeBtn.offsetWidth;
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + container.clientWidth;

      if (btnLeft < containerLeft || btnRight > containerRight) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [activeSection]);

  // Handle direct hash navigation on initial load (e.g. /organization/cncf#mentors)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (tabs.some((t) => t.id === hash)) {
        setTimeout(() => {
          scrollToSection(hash, false);
        }, 120);
      }
    }
  }, [tabs]);

  return (
    <nav
      aria-label="Organization sections"
      className="sticky top-14 z-30 w-full border-b border-[var(--border-card)] bg-[var(--bg-primary)]/85 backdrop-blur-md transition-colors"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-2 -mx-1 px-1"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;

            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                data-section-id={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] border border-transparent"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <Icon
                  size={13}
                  className={
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-[var(--text-muted)]"
                  }
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none transition-colors ${
                      isActive
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-300"
                        : "bg-[var(--bg-badge)] text-[var(--text-muted)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
