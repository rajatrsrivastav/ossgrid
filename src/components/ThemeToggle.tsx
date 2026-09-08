"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="p-2 rounded-xl"
        style={{
          background: "var(--bg-input)",
          border: "1px solid var(--border-card)",
          width: 34,
          height: 34,
        }}
      />
    );
  }

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110"
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-card)",
        color: "var(--text-secondary)",
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
