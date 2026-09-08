"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--bg-input)", border: "1px solid var(--border-card)" }}
      >
        <AlertCircle size={32} style={{ color: "var(--color-accent-raw)", opacity: 0.7 }} />
      </div>

      <h2
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Something went wrong
      </h2>
      <p
        className="text-sm max-w-sm mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        {error?.message
          ? `Error: ${error.message}`
          : "We couldn't load organization data. This is usually a network issue."}
      </p>

      <button onClick={reset} className="btn-primary">
        Try again
      </button>

      <p className="text-xs mt-10" style={{ color: "var(--text-muted)" }}>
        If the problem persists, check the{" "}
        <a
          href="https://github.com/rajatrsrivastav/ossgrid/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--color-accent-raw)" }}
        >
          issue tracker
        </a>
        .
      </p>
    </div>
  );
}
