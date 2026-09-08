"use client";

import { ExternalLink, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ searchQuery, onSearchChange, onMenuToggle, isMobileMenuOpen }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-card)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        height: "var(--header-height)",
      }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
        {/* Left: Logo + Badge */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-2 rounded-lg"
            style={{ color: "var(--text-secondary)" }}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              }}
            >
              LF
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">
              <span className="gradient-text">LFX</span>{" "}
              <span style={{ color: "var(--text-primary)" }}>Organizations</span>
            </h1>
          </div>

          <span
            className="badge badge-accent text-xs hidden md:inline-flex items-center gap-1"
            style={{ animation: "pulse-glow 3s infinite" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            2027 Term 1
          </span>
        </div>

        {/* Center: Search */}
        <div className="w-full max-w-md mx-4 hidden sm:block">
          <SearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/rajatrsrivastav/ossgrid"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              color: "var(--text-secondary)",
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span>Star</span>
          </a>
          <a
            href="https://mentorship.lfx.linuxfoundation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
              color: "white",
            }}
          >
            <ExternalLink size={14} />
            <span>LFX Portal</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
