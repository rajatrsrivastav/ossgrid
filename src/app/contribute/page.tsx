import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import GitHubRepoActions from "@/components/GitHubRepoActions";
import { githubRepo } from "@/lib/github-repos";
import { ossgridRepo } from "@/data/contributors";

export const metadata: Metadata = {
  title: "Start contributing",
  description: "A practical guide to contributing to OSSGrid and the open-source projects it indexes.",
  alternates: { canonical: "/contribute" },
};

const steps = [
  { title: "Discover", body: "Choose OSSGrid itself, or browse GSoC and LFX for a project that matches your interests and skills. Read the selected repository’s README and its own contribution guidance before starting." },
  { title: "Choose an issue", body: "Search open issues for documentation, bugs, or good first issue labels. Labels are suggestions, not a promise of easy work. Check that the issue is still relevant and coordinate with its maintainers before starting." },
  { title: "Fork and clone", body: "Use Fork on the repository’s GitHub page, then copy your fork’s clone URL from Code. Run git clone with that URL and enter the project directory. Follow its README to install dependencies. For OSSGrid, run npm ci and npm run dev, then open localhost:3000." },
  { title: "Make changes", body: "Create a branch with git switch -c fix/short-description. Make one focused change, follow the existing code style, and run the project’s checks. Review git diff, stage the relevant files with git add, and use git commit with a message explaining the change." },
  { title: "Submit a pull request", body: "Push your branch to your fork with git push -u origin fix/short-description. Open a pull request to the upstream project’s default branch (main for OSSGrid). Link the issue, explain the result, include test results and UI screenshots, and respond to review feedback." },
  { title: "Get recognized", body: "Accepted or otherwise maintainer-verified contributions to OSSGrid qualify for its contributors directory. If your work is missing, share a link to the accepted contribution with OSSGrid’s maintainers. Contributions to external repositories are recognized by those projects and do not qualify you for the OSSGrid directory." },
];

export default async function ContributePage({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  const { repo: requestedRepo } = await searchParams;
  const selectedRepo = requestedRepo && /^[\w.-]+\/[\w.-]+$/.test(requestedRepo) ? githubRepo(`https://github.com/${requestedRepo}`) : null;
  const ossgrid = githubRepo(`https://github.com/${ossgridRepo}`)!;
  return <>
    <Header />
    <main className="flex w-full flex-1 flex-col">
    <PageMasthead
      crumbs={[{ label: "Home", href: "/" }, { label: "Start contributing" }]}
      label="Open source"
      title="Start contributing"
      lede={<p>A clear path from finding a project to submitting work that maintainers can review. Contributing to OSSGrid itself and contributing to a project indexed on OSSGrid are different paths; both are covered below.</p>}
    />
    <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">

      {selectedRepo && <section className="panel mt-8 p-5" aria-label="Selected repository">
        <p className="eyebrow mb-2">Your selected repository</p>
        <p className="font-semibold text-[var(--text-primary)]">{selectedRepo.slug}</p>
        <div className="mt-3"><GitHubRepoActions url={selectedRepo.url} /></div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">Check this repository’s README and CONTRIBUTING file for its own rules. Issue tracking and contribution guides vary by project.</p>
      </section>}

      <ol aria-label="Contribution steps" className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => <li key={step.title} className="card p-5">
          <span className="num text-xs font-medium text-[var(--text-muted)]">{`Step ${index + 1}`}</span>
          <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
        </li>)}
      </ol>

      <section className="mt-12 border-t border-[var(--border)] pt-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Good places to begin</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={ossgrid.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">OSSGrid repository</a>
          <Link href="/lfx" className="btn btn-secondary">Explore LFX organizations</Link>
          <Link href="/gsoc" className="btn btn-secondary">Explore GSoC organizations</Link>
          <a href={`${ossgrid.url}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Contribution guidelines</a>
          <a href={`${ossgrid.url}/issues`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">OSSGrid open issues</a>
          <a href={`${ossgrid.url}/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22good%20first%20issue%22`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Beginner-friendly issues</a>
          <Link href="/contributors" className="btn btn-secondary">Existing contributors</Link>
          <Link href="/contributors#past-contributors" className="btn btn-secondary">Past contributors</Link>
        </div>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">The beginner-friendly issue list may be empty; browse other open issues or ask maintainers for a suitable task. For OSSGrid bugs, use the repository’s <a href={`${ossgrid.url}/issues/new?template=bug_report.yml`} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">bug report template</a>. For improvements, explain the user problem and expected behavior in a focused issue or pull request.</p>
      </section>
    </div>
    </main>
  </>;
}
