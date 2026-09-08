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
      className="sticky top-0 z-40 w-full border-b border-[var(--border-card)] bg-[var(--bg-primary)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--bg-primary)]/70 transition-colors"
    >
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto gap-3 sm:gap-4">
        {/* Left: Brand Identity & Desktop Navigation */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {variant === "full" && onMenuToggle && (
            <button
              className="lg:hidden p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-input)] text-[var(--text-secondary)] cursor-pointer"
              onClick={onMenuToggle}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}

          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none flex-shrink-0"
            aria-label="OSSGrid Home"
          >
            <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center shadow-xs border border-black/10 dark:border-white/20 group-hover:border-blue-500/50 transition-all">
              <LogoMark size={16} />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
              OSSGrid
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                activeSection === "overview" && variant !== "full"
                  ? "text-[var(--text-primary)] bg-[var(--bg-card)] shadow-xs border border-[var(--border-card)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50"
              }`}
            >
              All Programs
            </Link>

            <Link
              href="/lfx"
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                activeSection === "lfx" || variant === "full"
                  ? "text-[var(--text-primary)] bg-[var(--bg-card)] shadow-xs border border-[var(--border-card)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50"
              }`}
            >
              <span>LFX Mentorship</span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            </Link>

            <Link
              href="/#playbook"
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50 transition-colors"
            >
              Contributor Playbook
            </Link>

            <Link
              href="/#faq"
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50 transition-colors"
            >
              FAQ
            </Link>

            {savedCount > 0 && (
              <button
                onClick={() => onNavigateSection?.("saved")}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <Bookmark size={13} className="fill-blue-400" />
                <span>Saved ({savedCount})</span>
              </button>
            )}
          </nav>
        </div>

        {/* Center: Search input (in full variant) */}
        {variant === "full" && onSearchChange && (
          <div className="flex-1 max-w-md mx-2">
            <div
              onClick={onCommandPaletteOpen}
              className="relative flex items-center w-full h-[34px] px-3 rounded-lg border border-[var(--border-input)] bg-[var(--bg-input)]/60 transition-all focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30 cursor-text shadow-xs"
            >
              <Search size={14} className="text-[var(--text-muted)] flex-shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search 96+ orgs, 560+ projects, skills (Go, Rust)..."
                className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                aria-label="Search organizations"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCommandPaletteOpen?.();
                }}
                className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[var(--border-card)] bg-[var(--bg-raised)] text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0 ml-1.5 cursor-pointer"
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
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50 transition-colors"
            title="Official LFX Mentorship Portal"
          >
            <span>LFX Portal</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>

          <div className="hidden sm:block w-px h-4 bg-[var(--border-card)]" />

          <button
            onClick={onOpenAbout}
            className="w-8 h-8 rounded-lg border border-[var(--border-card)] bg-[var(--bg-raised)]/60 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] flex items-center justify-center transition-all cursor-pointer"
            title="About OSSGrid & Guidebook"
            aria-label="About and FAQ"
          >
            <HelpCircle size={15} />
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
