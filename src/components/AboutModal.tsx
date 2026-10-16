"use client";

import { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { lfxCalendar } from "@/data/programs";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function AboutModal({ open, onClose }: AboutModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const facts = [
    { label: "Terms per year", value: "3", note: "Spring, Summer and Fall." },
    { label: "Stipend", value: `${usd(lfxCalendar.stipend.minUsd)} to ${usd(lfxCalendar.stipend.maxUsd)}`, note: lfxCalendar.stipend.note },
    { label: "Length", value: `${lfxCalendar.durationWeeks.fullTime} or ${lfxCalendar.durationWeeks.partTime} weeks`, note: "Full time or part time." },
    { label: "Applications per term", value: String(lfxCalendar.applicationsPerTerm), note: "You can only join one project per term." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="panel relative z-10 w-full max-w-lg overflow-y-auto p-6 shadow-[var(--shadow-modal)] animate-scale-in sm:p-8" style={{ maxHeight: "90vh" }}>
        <button type="button" onClick={onClose} className="icon-btn absolute right-4 top-4" aria-label="Close">
          <X size={18} />
        </button>

        <p className="eyebrow mb-2">About the program</p>
        <h2 id="about-title" className="display text-2xl font-semibold text-[var(--text-primary)]">LFX Mentorship</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          A paid, remote mentorship run by {lfxCalendar.sponsor}. Mentees work with maintainers of Linux Foundation and CNCF projects for one term. {lfxCalendar.eligibility}
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
          Last checked {lfxCalendar.lastVerified}. OSSGrid is not run by the Linux Foundation.
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--border)] pt-5">
          <a href={lfxCalendar.portalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full">
            Apply on the LFX portal <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a href={lfxCalendar.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full">
            Project lists on GitHub (cncf/mentoring) <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
