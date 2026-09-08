import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export const metadata = {
  title: "Page Not Found",
  description: "The organization or page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Brand mark */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--gradient-cta)" }}
      >
        <LogoMark size={36} />
      </div>

      <h1
        className="text-4xl font-extrabold mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        404
      </h1>
      <p
        className="text-xl font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Page not found
      </p>
      <p
        className="text-base max-w-md mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        We couldn&apos;t find that organization or page. It may have been removed or the URL may be
        incorrect.
      </p>

      <Link href="/" className="btn-primary">
        Browse organizations
      </Link>

      <p className="text-xs mt-10" style={{ color: "var(--text-muted)" }}>
        Data from{" "}
        <a
          href="https://github.com/cncf/mentoring"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--color-accent-raw)" }}
        >
          cncf/mentoring
        </a>
      </p>
    </div>
  );
}
