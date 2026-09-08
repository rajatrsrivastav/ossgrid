"use client";

import Link from "next/link";
import { Menu, X, Search, Command, ExternalLink, Bookmark, Compass, HelpCircle } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LogoMark from "./LogoMark";

interface HeaderProps {
  variant?: "full" | "simple";
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onCommandPaletteOpen?: () => void;
  onOpenAbout?: () => void;
  savedCount?: number;
  onNavigateSection?: (section: "overview" | "explorer" | "guide" | "saved" | "faq") => void;
  activeSection?: string;
}

export default function Header({
  variant = "full",
  searchQuery = "",
  onSearchChange,
  onMenuToggle,
  isMobileMenuOpen,
  onCommandPaletteOpen,
  onOpenAbout,
  savedCount = 0,
  onNavigateSection,
  activeSection = "overview",
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-card)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-[1920px] mx-auto gap-3">
        {/* Left: Brand Identity (Logo + Name + Status Indicator) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {variant === "full" && onMenuToggle && (
            <button
              className="lg:hidden p-2 rounded-xl transition-colors hover:bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-pointer"
              onClick={onMenuToggle}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <LogoMark size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                OSSGrid
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Guidebook
                </span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium hidden sm:inline">
                Open Source Ecosystem Navigator
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 pl-4 border-l border-[var(--border-card)]">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSection === "overview" && variant !== "full"
                  ? "bg-[var(--bg-input)] text-blue-400 border border-blue-500/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
              }`}
            >
              All Programs
            </Link>

            <Link
              href="/lfx"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            >
              <span>LFX Mentorship</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </Link>

            <Link
              href="/#playbook"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            >
              Contributor Playbook
            </Link>

            <Link
              href="/#faq"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
            >
              FAQ
            </Link>

            {savedCount > 0 && (
              <button
                onClick={() => onNavigateSection?.("saved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === "saved"
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "text-blue-400 hover:bg-blue-500/10"
                }`}
              >
                <Bookmark size={13} className="fill-blue-400" />
                Saved ({savedCount})
              </button>
            )}
          </nav>
        </div>

        {/* Center: Search input */}
        {variant === "full" && onSearchChange && (
          <div className="flex-1 max-w-lg mx-2">
            <div
              onClick={onCommandPaletteOpen}
              className="relative flex items-center w-full px-3.5 py-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] transition-all focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 cursor-text shadow-sm"
            >
              <Search size={15} className="text-[var(--text-muted)] flex-shrink-0 mr-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search 80+ orgs, 560+ projects, skills (Go, Rust, Python)..."
                className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                aria-label="Search organizations"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommandPaletteOpen?.();
                }}
                className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-[var(--border-card)] bg-[var(--bg-raised)] text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0 ml-2 cursor-pointer"
                title="Open command palette (⌘K)"
              >
                <Command size={10} />
                <span>K</span>
              </button>
            </div>
          </div>
        )}

        {/* Right: External LFX Portal, About button & Theme Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://mentorship.lfx.linuxfoundation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] border border-[var(--border-card)] transition-colors cursor-pointer"
            title="Official LFX Mentorship Portal"
          >
            <span>Official Portal</span>
            <ExternalLink size={12} className="text-[var(--text-muted)]" />
          </a>

          <button
            onClick={onOpenAbout}
            className="p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
            title="About OSSGrid & FAQ"
            aria-label="About and FAQ"
          >
            <HelpCircle size={16} />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
