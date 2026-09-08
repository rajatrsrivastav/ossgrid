"use client";

import { useEffect, useState, useRef } from "react";
import { Eye } from "lucide-react";

export default function Footer() {
  const [views, setViews] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // React Strict Mode / HMR guard — only run once per mount
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const SESSION_KEY = "ossgrid_visited";
    const isNewSession = !sessionStorage.getItem(SESSION_KEY);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ increment: isNewSession }),
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ views?: number; error?: string }>;
      })
      .then((data) => {
        if (typeof data.views === "number") {
          setViews(data.views);
          if (isNewSession) {
            sessionStorage.setItem(SESSION_KEY, "1");
          }
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setHasError(true);
      });
  }, []);

  const viewsDisplay =
    views !== null
      ? `${views.toLocaleString()} views`
      : hasError
      ? "Views unavailable"
      : "… views";

  return (
    <footer className="w-full border-t border-[var(--border-card)] bg-[var(--bg-primary)] py-8 mt-auto relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-medium text-[var(--text-secondary)] flex flex-wrap items-center justify-center gap-1.5 text-center">
          Made with <span className="text-red-500 mx-0.5 text-xs">❤️</span> by{" "}
          <a
            href="https://x.com/rajatrsrivastav"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] hover:underline decoration-1 underline-offset-4 transition-colors"
          >
            Rajat Srivastav
          </a>{" "}
          &amp;{" "}
          <a
            href="https://x.com/Anandmishra639"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] hover:underline decoration-1 underline-offset-4 transition-colors"
          >
            Anand Mishra
          </a> for oss comutnites
          <span className="hidden sm:inline-block mx-1.5 text-[var(--border-hover)]">
            &middot;
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs sm:text-sm mt-1 sm:mt-0 font-mono">
            <Eye size={13} className="opacity-70" />
            {viewsDisplay}
          </span>
        </p>

        <div className="relative group flex justify-center">
          <p className="text-sm text-[var(--text-muted)] cursor-help flex items-center gap-1.5 transition-colors group-hover:text-[var(--text-primary)]">
            OSSGrid Contributors <span className="opacity-50 text-xs">✦</span>
          </p>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50">
            <div className="bg-[var(--bg-card)] border border-[var(--border-card)] shadow-2xl rounded-xl p-4 w-max flex flex-col gap-3">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Contributors</span>
              <a href="https://github.com/rajatrsrivastav" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-input)]">
                  <img src="https://github.com/rajatrsrivastav.png?size=48" alt="Rajat Srivastav" className="w-full h-full object-cover" />
                </div>
                Rajat Srivastav
              </a>
              <a href="https://github.com/anand-242003" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-input)]">
                  <img src="https://github.com/anand-242003.png?size=48" alt="Anand" className="w-full h-full object-cover" />
                </div>
                Anand
              </a>
              <a href="https://github.com/mitul-bhatia" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-input)]">
                  <img src="https://github.com/mitul-bhatia.png?size=48" alt="Mitul Bhatia" className="w-full h-full object-cover" />
                </div>
                Mitul Bhatia
              </a>
              <a href="https://github.com/NSTKrishna" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-primary)] hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-input)]">
                  <img src="https://github.com/NSTKrishna.png?size=48" alt="Krishna Gehlot" className="w-full h-full object-cover" />
                </div>
                Krishna Gehlot
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
