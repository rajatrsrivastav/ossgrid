"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { PROGRAMS, livePrograms } from "@/data/programs";
import { footerGroups, trademarkLine } from "@/data/site";



export default function Footer() {
  const [views, setViews] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const SESSION_KEY = "ossgrid_visited";
    let isNewSession = true;
    try {
      isNewSession = !sessionStorage.getItem(SESSION_KEY);
    } catch {
      /* storage unavailable */
    }
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
        return res.json() as Promise<{ views?: number }>;
      })
      .then((data) => {
        if (typeof data.views === "number") {
          setViews(data.views);
          if (isNewSession) {
            try {
              sessionStorage.setItem(SESSION_KEY, "1");
            } catch {
              /* ignore */
            }
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
    views !== null ? `${views.toLocaleString()} views` : hasError ? "Views unavailable" : "… views";

  return (
    <footer className="cine font-ui relative z-10 mt-auto w-full border-t border-[var(--cine-line)] bg-[var(--cine-bg)]">
      <div className="cine-wrap grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-20">
        <div className="max-w-sm">
          <p className="font-display text-[2rem] font-bold leading-none tracking-[-0.02em] text-[var(--cine-fg)]">OSSGrid</p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--cine-fg-2)]">
            A free, community-built index of open-source mentorship programs. No login, no tracking of you, just the data.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          {footerGroups().map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-[var(--cine-fg-3)]">{group.title}</p>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[var(--cine-fg-2)] hover:text-[var(--cine-fg)]">{l.label}</a>
                    ) : (
                      <Link href={l.href} className="text-[var(--cine-fg-2)] hover:text-[var(--cine-fg)]">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="cine-wrap pb-8">
        <p className="max-w-4xl text-xs leading-relaxed text-[var(--cine-fg-3)]">
          {livePrograms().map((p) => (
            <span key={p.id}>
              {p.shortName} data from{" "}
              {p.dataSources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && (i === p.dataSources.length - 1 ? " and " : ", ")}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--cine-fg)]">{s.label}</a>
                </span>
              ))}
              .{" "}
            </span>
          ))}
          {trademarkLine(PROGRAMS)}
        </p>
      </div>

      <div className="border-t border-[var(--cine-line)]">
        <div className="cine-wrap flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-[var(--cine-fg-3)]">
          <p>Built with ❤️ by <a href="https://x.com/rajatrsrivastav" target="_blank" rel="noopener noreferrer" className="text-[var(--cine-fg-2)] underline underline-offset-4 hover:text-[var(--cine-fg)]">Rajat Srivastav</a></p>
          <span className="num inline-flex items-center gap-1.5">
            <Eye size={13} aria-hidden="true" />
            {viewsDisplay}
          </span>
        </div>
      </div>
    </footer>
  );
}
