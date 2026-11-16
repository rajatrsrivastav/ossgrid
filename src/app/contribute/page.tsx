import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import GitHubRepoActions from "@/components/GitHubRepoActions";
import { githubRepo } from "@/lib/github-repos";

export const metadata: Metadata = {
  title: "Start contributing",
  description: "A practical path from finding an open-source organization on OSSGrid to contributing to that project.",
  alternates: { canonical: "/contribute" },
};

const steps = [
  {
    title: "Discover",
    body: "Browse GSoC and LFX organizations on OSSGrid for a project that matches your interests and skills. Read the selected repository’s README and its own contribution guidance before starting.",
  },
  {
    title: "Choose an issue",
    body: "Search that project’s open issues for documentation, bugs, or beginner-friendly labels. Labels are suggestions, not a promise of easy work. Check that the issue is still relevant and coordinate with its maintainers before starting.",
  },
  {
    title: "Fork and clone",
    body: "Use Fork on the repository’s GitHub page, then copy your fork’s clone URL from Code. Run git clone with that URL and enter the project directory. Follow its README to install dependencies.",
  },
  {
    title: "Make changes",
    body: "Create a branch with git switch -c fix/short-description. Make one focused change, follow the existing code style, and run the project’s checks. Review git diff, stage the relevant files with git add, and use git commit with a message explaining the change.",
  },
  {
    title: "Submit a pull request",
    body: "Push your branch to your fork with git push -u origin fix/short-description. Open a pull request to the upstream project’s default branch. Link the issue, explain the result, include test results when useful, and respond to review feedback.",
  },
  {
    title: "Stay with the community",
    body: "Recognition for your work comes from that project and its maintainers. Keep contributing where you started, or use OSSGrid again to shortlist another organization.",
  },
];

export default async function ContributePage({ searchParams }: { searchParams: Promise<{ repo?: string }> }) {
  const { repo: requestedRepo } = await searchParams;
  const selectedRepo =
    requestedRepo && /^[\w.-]+\/[\w.-]+$/.test(requestedRepo)
      ? githubRepo(`https://github.com/${requestedRepo}`)
      : null;

  return (
    <>
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <PageMasthead
          crumbs={[{ label: "Home", href: "/" }, { label: "Start contributing" }]}
          label="Open source"
          title="Start contributing"
          lede={
            <p>
              OSSGrid helps you pick an organization. Contribution happens on that project’s repository — not on OSSGrid itself.
            </p>
          }
        />
        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
          {selectedRepo && (
            <section className="panel mt-8 p-5" aria-label="Selected repository">
              <p className="eyebrow mb-2">Your selected repository</p>
              <p className="font-semibold text-[var(--text-primary)]">{selectedRepo.slug}</p>
              <div className="mt-3">
                <GitHubRepoActions url={selectedRepo.url} />
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Check this repository’s README and CONTRIBUTING file for its own rules. Issue tracking and contribution guides vary by project.
              </p>
            </section>
          )}

          <ol aria-label="Contribution steps" className="grid gap-4 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="card p-5">
                <span className="num text-xs font-medium text-[var(--text-muted)]">{`Step ${index + 1}`}</span>
                <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
              </li>
            ))}
          </ol>

          <section className="mt-12 border-t border-[var(--border)] pt-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Good places to begin</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/lfx" className="btn btn-primary">
                Explore LFX organizations
              </Link>
              <Link href="/gsoc" className="btn btn-secondary">
                Explore GSoC organizations
              </Link>
              <Link href="/guide" className="btn btn-secondary">
                Contributor playbook
              </Link>
              <Link href="/#explore" className="btn btn-secondary">
                Search organizations
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
