"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { gsocCalendar } from "@/data/programs";

interface GsocAboutModalProps {
  open: boolean;
  onClose: () => void;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function GsocAboutModal({ open, onClose }: GsocAboutModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const facts = [
    { label: "Cycles per year", value: "1", note: "Applications in spring, coding over the summer." },
    { label: "Stipend", value: `${usd(gsocCalendar.stipend.minUsd)} to ${usd(gsocCalendar.stipend.maxUsd)}`, note: gsocCalendar.stipend.note },
    { label: "Project size", value: gsocCalendar.projectSizes.map((s) => `${s.hours} h`).join(" / "), note: gsocCalendar.projectSizes.map((s) => s.label).join(", ") + "." },
    { label: "Length", value: `${gsocCalendar.durationWeeks.standard} to ${gsocCalendar.durationWeeks.extended} weeks`, note: "Extended timelines need the mentor's agreement." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="gsoc-about-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="panel relative z-10 w-full max-w-lg overflow-y-auto p-6 shadow-[var(--shadow-modal)] animate-scale-in sm:p-8" style={{ maxHeight: "90vh" }}>
        <button type="button" onClick={onClose} className="icon-btn absolute right-4 top-4" aria-label="Close">
          <X size={18} />
        </button>

        <p className="eyebrow mb-2">About the program</p>
        <h2 id="gsoc-about-title" className="display text-2xl font-semibold text-[var(--text-primary)]">Google Summer of Code</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          A paid, remote program run by {gsocCalendar.sponsor} since 2005. Contributors work with an open-source organization on one project over the summer. {gsocCalendar.eligibility}
        </p>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="card p-4">
              <dt className="text-xs text-[var(--text-muted)]">{f.label}</dt>
              <dd className="num mt-1 text-lg font-semibold text-[var(--text-primary)]">{f.value}</dd>
              <dd className="mt-1 text-xs text-[var(--text-secondary)]">{f.note}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Last checked {gsocCalendar.lastVerified}. OSSGrid is not run by Google.
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
          <a href={gsocCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
            Open the GSoC site <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a href={gsocCalendar.stipendUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
            Stipend table <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
