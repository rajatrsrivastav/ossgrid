"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-xl w-full transition-all duration-200"
      style={{
        background: "var(--bg-input)",
        border: "1px solid var(--border-card)",
      }}
    >
      <Search size={16} style={{ color: "var(--text-muted)" }} />
      <input
        type="text"
        placeholder="Search organizations, projects, technologies..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm flex-1 bg-transparent outline-none"
        style={{ color: "var(--text-primary)" }}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ color: "var(--text-muted)" }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
