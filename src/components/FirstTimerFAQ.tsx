"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does LFX Mentorship differ from Google Summer of Code (GSoC)?",
    answer:
      "While both are premier open-source mentorship programs with paid stipends, LFX Mentorship is run directly by The Linux Foundation and CNCF. It runs 3 cohorts per year (Spring, Summer, Fall) instead of one, and is open to all developers worldwide aged 18+, regardless of student status.",
  },
  {
    question: "How much is the stipend, and how is it paid?",
    answer:
      "Stipends typically range from $3,000 to $6,600 USD per mentee depending on your geographical location (calculated using Purchasing Power Parity) and whether the term is full-time (12 weeks, 40 hrs/wk) or part-time (24 weeks, 20 hrs/wk). It is disbursed in milestone payments based on mentor approval.",
  },
  {
    question: "Do I have to be a university or CS student to apply?",
    answer:
      "No! Anyone 18 years or older who is legally eligible to participate and not currently employed by the sponsoring foundation or mentor organization may apply. Self-taught developers, bootcamp grads, and career-changers are actively encouraged.",
  },
  {
    question: "How many projects can I apply to in one term?",
    answer:
      "You can submit up to 3 project applications per term on the official LFX Mentorship portal (mentorship.lfx.linuxfoundation.org). If accepted to more than one, you can only participate in one project per term.",
  },
  {
    question: "What is the single best way to maximize my chance of being accepted?",
    answer:
      "Pre-application engagement! Successful mentees almost always introduce themselves in the project's community channel (Slack, Discord, or GitHub Discussions) 2 to 4 weeks before the application deadline and submit at least 1 or 2 small pull requests (fixing documentation, tests, or good first issues).",
  },
  {
    question: "Is this website (OSSGrid) the official application portal?",
    answer:
      "OSSGrid is a purpose-built community explorer and intelligence platform built to make discovering organizations, comparing technologies, and tracking historical project data effortless. Official applications are submitted at mentorship.lfx.linuxfoundation.org.",
  },
];

export default function FirstTimerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full mb-12 rounded-3xl p-6 sm:p-10 border border-[var(--border-card)] bg-[var(--bg-secondary)] shadow-lg">
      <div className="flex items-center gap-2.5 mb-2">
        <HelpCircle size={20} className="text-blue-400" />
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Frequently Asked Questions for Newcomers
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 max-w-2xl">
        Everything you need to know about eligibility, compensation, deadlines, and the selection process.
      </p>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className={`w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-semibold transition-colors ${
                  isOpen
                    ? "text-blue-400"
                    : "text-[var(--text-primary)] hover:text-[var(--text-secondary)]"
                }`}
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-blue-400 flex-shrink-0 ml-4" />
                ) : (
                  <ChevronDown size={18} className="text-[var(--text-muted)] flex-shrink-0 ml-4" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-card)] pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
