"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Coffee, Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import { headerLinks } from "@/data/site";

const links = headerLinks();

interface HeaderProps {
  /** "simple" = marketing pages; "full" = explorer with search */
  variant?: "full" | "simple";
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCommandPaletteOpen?: () => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  /** Sits over the always-dark home hero: transparent with light text until the page scrolls. */
  overlay?: boolean;
}

export default function Header({
  variant = "simple",
  searchQuery = "",
  onSearchChange,
  onCommandPaletteOpen,
  searchPlaceholder,
  searchAriaLabel,
  overlay = false,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeMobileNav = () => { if (desktop.matches) setNavOpen(false); };
    desktop.addEventListener("change", closeMobileNav);
    return () => desktop.removeEventListener("change", closeMobileNav);
  }, []);

  useEffect(() => {
    if (!navOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNavOpen(false);
        document.getElementById("mobile-nav-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  const isExplorer = variant === "full";
  // On the home story the header stays cinematic; it only gains a dark backdrop once scrolled.
  const onArt = overlay;

  return (
    <div className="sticky top-0 z-40">
      <header
        className={cn(
          "w-full border-b transition-colors duration-200",
          onArt && "cine font-ui",
          overlay
            ? scrolled || navOpen ? "border-[var(--border)] bg-[color-mix(in_srgb,var(--cine-bg)_82%,transparent)] backdrop-blur-md" : "border-transparent bg-transparent"
            : scrolled || isExplorer || navOpen
              ? "border-[var(--border)] bg-[var(--bg-base)]/85 backdrop-blur-md"
              : "border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="OSSGrid home">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--text-primary)] text-[var(--bg-base)]">
              <LogoMark size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">OSSGrid</span>
          </Link>

          {/* Marketing nav */}
          {!isExplorer && (
            <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Explorer search (desktop) */}
          {isExplorer && onSearchChange && (
            <div className="mx-auto hidden w-full max-w-xl sm:block">
              <SearchBar
                value={searchQuery}
                onChange={onSearchChange}
                onCommandPaletteOpen={onCommandPaletteOpen}
                placeholder={searchPlaceholder}
                ariaLabel={searchAriaLabel}
              />
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://buymeacoffee.com/rajatrsrivastav"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Support OSSGrid on Buy Me a Coffee"
              title="Support OSSGrid on Buy Me a Coffee"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border border-transparent px-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <Coffee size={15} aria-hidden="true" />
              <span className="hidden lg:inline">Support</span>
            </a>
            {!isExplorer && (
              <div className="hidden lg:block">
                <Link href="/#programs" className={onArt ? "cine-btn cine-btn--line !h-9 !px-4 !text-sm" : "btn btn-primary btn-sm"}>Explore programs</Link>
              </div>
            )}
            <div className="lg:hidden">
              <button
                type="button"
                id="mobile-nav-toggle"
                className="icon-btn icon-btn-bordered"
                onClick={() => setNavOpen((o) => !o)}
                aria-label={navOpen ? "Close menu" : "Open menu"}
                aria-expanded={navOpen}
                aria-controls="mobile-nav"
              >
                {navOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>

        {/* Explorer search (mobile): always visible, no menu needed */}
        {isExplorer && onSearchChange && (
          <div className="border-t border-[var(--border)] px-4 py-2 sm:hidden">
            <SearchBar value={searchQuery} onChange={onSearchChange} compact placeholder={searchPlaceholder} ariaLabel={searchAriaLabel} />
          </div>
        )}

        {/* Shared navigation on narrow screens; filters have their own toolbar control. */}
        {navOpen && (
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="border-t border-[var(--border)] bg-[var(--bg-base)] max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-3 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setNavOpen(false)}
                    className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link href="/#programs" className="btn btn-primary w-full" onClick={() => setNavOpen(false)}>
                  <Search size={15} /> Explore programs
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
}
