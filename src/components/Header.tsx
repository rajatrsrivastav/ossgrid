"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

const links = [
  { label: "Programs", href: "/#programs" },
  { label: "Playbook", href: "/#playbook" },
  { label: "FAQ", href: "/#faq" },
];

interface HeaderProps {
  /** "simple" = marketing pages; "full" = explorer with search */
  variant?: "full" | "simple";
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onOpenAbout?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCommandPaletteOpen?: () => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
}

export default function Header({
  variant = "simple",
  onMenuToggle,
  isMobileMenuOpen,
  searchQuery = "",
  onSearchChange,
  onCommandPaletteOpen,
  searchPlaceholder,
  searchAriaLabel,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isExplorer = variant === "full";

  return (
    <div className="sticky top-0 z-40">
      <header
        className={cn(
          "w-full border-b transition-colors duration-200",
          scrolled || isExplorer
            ? "border-[var(--border)] bg-[var(--bg-base)]/85 backdrop-blur-md"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="OSSGrid home">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--text-primary)] text-[var(--bg-base)]">
              <LogoMark size={16} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">OSSGrid</span>
          </Link>

          {/* Marketing nav */}
          {!isExplorer && (
            <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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
            {!isExplorer && (
              <Link href="/lfx" className="btn btn-primary btn-sm hidden sm:inline-flex">
                Browse LFX orgs
              </Link>
            )}
            {isExplorer ? (
              <button
                type="button"
                className="icon-btn icon-btn-bordered lg:hidden"
                onClick={onMenuToggle}
                aria-label={isMobileMenuOpen ? "Close filters" : "Open filters"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            ) : (
              <button
                type="button"
                className="icon-btn icon-btn-bordered lg:hidden"
                onClick={() => setNavOpen((o) => !o)}
                aria-label={navOpen ? "Close menu" : "Open menu"}
                aria-expanded={navOpen}
                aria-controls="mobile-nav"
              >
                {navOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            )}
          </div>
        </div>

        {/* Explorer search (mobile): always visible, no menu needed */}
        {isExplorer && onSearchChange && (
          <div className="border-t border-[var(--border)] px-4 py-2 sm:hidden">
            <SearchBar value={searchQuery} onChange={onSearchChange} compact />
          </div>
        )}

        {/* Marketing nav (mobile) */}
        {!isExplorer && navOpen && (
          <nav
            id="mobile-nav"
            aria-label="Primary"
            className="border-t border-[var(--border)] bg-[var(--bg-base)] px-4 py-3 lg:hidden"
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
                <Link href="/lfx" className="btn btn-primary w-full" onClick={() => setNavOpen(false)}>
                  <Search size={15} /> Browse LFX orgs
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </div>
  );
}
