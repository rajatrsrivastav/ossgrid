"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--warning)]">
        <AlertCircle size={26} aria-hidden="true" />
      </span>
      <h1 className="display text-2xl font-semibold text-[var(--text-primary)]">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--text-secondary)]">
        {error?.message ? error.message : "The page failed to load. This is usually a network problem."}
      </p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">Try again</button>
      <p className="mt-10 text-xs text-[var(--text-muted)]">
        Still broken? Open an issue on the{" "}
        <a href="https://github.com/rajatrsrivastav/ossgrid/issues" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
          OSSGrid issue tracker
        </a>
        .
      </p>
    </main>
  );
}
