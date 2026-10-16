import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export const metadata = {
  title: "Page not found",
  description: "That organization or page does not exist.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 text-center">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] bg-[var(--text-primary)] text-[var(--bg-base)]">
        <LogoMark size={28} />
      </span>
      <p className="eyebrow mb-2">404</p>
      <h1 className="display text-3xl font-semibold text-[var(--text-primary)]">Page not found</h1>
      <p className="mt-3 max-w-md text-base text-[var(--text-secondary)]">
        That organization or page does not exist. The slug may have changed when the data was refreshed.
      </p>
      <Link href="/lfx" className="btn btn-primary mt-8">Browse LFX organizations</Link>
      <p className="mt-10 text-xs text-[var(--text-muted)]">
        Data from{" "}
        <a href="https://github.com/cncf/mentoring" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[var(--text-primary)]">
          cncf/mentoring on GitHub
        </a>
      </p>
    </main>
  );
}
