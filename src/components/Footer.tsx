"use client";

import { useEffect, useState, useRef } from "react";
import { Eye } from "lucide-react";

const COUNTER_KEY = "ossgrid_prod_visits";
const COUNTER_API = "https://countapi.mileshilliard.com/api/v1";

export default function Footer() {
  const [views, setViews] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const hasVisited = sessionStorage.getItem("ossgrid_visited");
    const endpoint = hasVisited
      ? `${COUNTER_API}/get/${COUNTER_KEY}`
      : `${COUNTER_API}/hit/${COUNTER_KEY}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch(endpoint, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.value === "number") {
          setViews(data.value);
          if (!hasVisited) {
            sessionStorage.setItem("ossgrid_visited", "true");
          }
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setHasError(true);
      });

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  let viewsDisplay = "… views";
  if (hasError) {
    viewsDisplay = "Views unavailable";
  } else if (views !== null) {
    viewsDisplay = `${views.toLocaleString()} views`;
  }

  return (
    <footer className="w-full border-t border-[var(--border-card)] bg-[var(--bg-primary)] py-8 mt-auto relative z-10">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 flex flex-col items-center justify-center gap-2">
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
          </a>
          <span className="hidden sm:inline-block mx-1.5 text-[var(--border-hover)]">
            &middot;
          </span>
          <span className="flex items-center gap-1.5 text-[var(--text-muted)] text-xs sm:text-sm mt-1 sm:mt-0 font-mono">
            <Eye size={13} className="opacity-70" />
            {viewsDisplay}
          </span>
        </p>
      </div>
    </footer>
  );
}
