import type { Metadata } from "next";
import HomePageClient from "@/components/home/HomePageClient";
import { safeJsonLd } from "@/lib/seo";
import { getHomeData } from "@/lib/home-data";
import { PROGRAMS, livePrograms, getProgram, lfxCalendar } from "@/data/programs";
import { getCombinedStats } from "@/lib/stats";

const live = livePrograms();
const programList = live.map((p) => p.shortName).join(", ");
const stats = getCombinedStats();
const nf = new Intl.NumberFormat("en-US");
// Titles carry the current program year: people search "GSoC 2026 organizations".
const title = `GSoC ${stats.yearMax} & LFX Mentorship organizations and projects | OSSGrid`;
const description = `Search ${nf.format(stats.orgCount)} Google Summer of Code and LFX Mentorship organizations and ${nf.format(stats.projectCount)} past projects by technology and year. Free, with a guide to getting selected.`;

const gsocP = getProgram("gsoc")!;
const lfxP = getProgram("lfx")!;
/** Plain-text versions of the home FAQ, for structured data. Same facts and sources as the page. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { q: "Which program should I start with?", a: `If you can give a summer and you are new to open source, start with ${gsocP.name} (${gsocP.facts.eligibility.value.toLowerCase()}). If you want a term at any time of year, ${lfxP.name} runs ${lfxP.facts.cadence.value.toLowerCase()}.` },
    { q: "How is LFX different from GSoC?", a: `Both pay a stipend for a term of mentored open-source work. LFX is run by ${lfxP.runBy} and pays ${lfxP.facts.stipend.value}. GSoC is run by ${gsocP.runBy}, happens ${gsocP.facts.cadence.value.toLowerCase()} and pays ${gsocP.facts.stipend.value} depending on project size and country.` },
    { q: "How many projects can I apply to?", a: `GSoC: up to three proposals, and only one can be accepted. LFX: up to ${lfxCalendar.applicationsPerTerm} applications per term, and you can only join one.` },
    { q: "What matters most for getting accepted?", a: "Showing up in the project's chat weeks before the deadline and getting one or two real fixes merged. Mentors pick people they have already worked with." },
    { q: "Is OSSGrid the official application site?", a: `No. OSSGrid is a community-built index. You apply on each program's official site: ${PROGRAMS.map((p) => p.name).join(", ")}.` },
  ].map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://www.ossgrid.tech" },
  openGraph: { type: "website", siteName: "OSSGrid", title, description, url: "https://www.ossgrid.tech" },
  twitter: { card: "summary_large_image", title, description },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.ossgrid.tech/#webpage",
  url: "https://www.ossgrid.tech",
  name: `OSSGrid: ${programList} and open-source mentorship orgs`,
  description,
  isPartOf: { "@type": "WebSite", "@id": "https://www.ossgrid.tech/#website", name: "OSSGrid", url: "https://www.ossgrid.tech" },
  about: [{ "@type": "Thing", name: "Open Source Software Mentorship" }, ...PROGRAMS.map((p) => ({ "@type": "Thing", name: p.name, url: p.officialUrl }))],
};

export default function HomePage() {
  const data = getHomeData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <HomePageClient data={data} />
    </>
  );
}
