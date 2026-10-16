"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

const contributors = [
  { handle: "rajatrsrivastav", name: "Rajat Srivastav" },
  { handle: "anand24mishra", name: "Anand Mishra" },
  { handle: "mitul-bhatia", name: "Mitul Bhatia" },
  { handle: "OmvedNagre", name: "Omved Nagre" },
];

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
    <footer className="relative z-10 mt-auto w-full border-t border-[var(--border)] bg-[var(--bg-base)]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-[var(--text-primary)]">OSSGrid</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            A free, community-built index of open-source mentorship programs. No login, no tracking of you, just the data.
          </p>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            LFX data from{" "}
            <a
              href="https://github.com/cncf/mentoring"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-[var(--text-primary)]"
            >
              cncf/mentoring on GitHub
            </a>
            . LFX, Linux Foundation, CNCF, GSoC and Google are trademarks of their owners. OSSGrid is not affiliated with them.
          </p>
        </div>

        <nav aria-label="Footer" className="text-sm">
          <p className="eyebrow mb-3">Site</p>
          <ul className="flex flex-col gap-2">
            <li><Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Home</Link></li>
            <li><Link href="/lfx" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">LFX organizations</Link></li>
            <li><Link href="/#playbook" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Contributor playbook</Link></li>
            <li>
              <a href="https://github.com/rajatrsrivastav/ossgrid" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Source on GitHub
              </a>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <p className="eyebrow mb-3">Built by</p>
          <ul className="flex flex-col gap-2.5">
            {contributors.map((c) => (
              <li key={c.handle}>
                <a
                  href={`https://github.com/${c.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Image
                    src={`https://github.com/${c.handle}.png?size=48`}
                    alt=""
                    width={24}
                    height={24}
                    unoptimized
                    className="h-6 w-6 rounded-full border border-[var(--border)]"
                  />
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-[var(--text-muted)] sm:px-6 lg:px-8">
          <span>Made for open-source communities.</span>
          <span className="num inline-flex items-center gap-1.5">
            <Eye size={13} aria-hidden="true" />
            {viewsDisplay}
          </span>
        </div>
      </div>
    </footer>
  );
}
