import Link from "next/link";

interface Crumb { label: string; href?: string }

interface PageMastheadProps {
  title: React.ReactNode;
  lede?: React.ReactNode;
  /** Small sentence-case label above the title. */
  label?: string;
  crumbs?: Crumb[];
  /** Fades the program's exhibit art in behind the copy. */
  art?: "gsoc" | "lfx";
  /** Actions, facts or anything else under the lede. */
  children?: React.ReactNode;
  /** Right-hand column (for example a facts strip). */
  aside?: React.ReactNode;
}

/** Shared always-dark opening band for internal pages (DESIGN.md v4). */
export default function PageMasthead({ title, lede, label, crumbs, art, children, aside }: PageMastheadProps) {
  return (
    <div className="cine cine-masthead font-ui" data-art={art}>
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--cine-fg-3)]">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {c.href ? <Link href={c.href} className="hover:text-[var(--cine-fg)]">{c.label}</Link> : <span aria-current="page" className="text-[var(--cine-fg-2)]">{c.label}</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {label && <p className="mb-4 text-sm text-[var(--cine-fg-2)]">{label}</p>}
            <h1 className="masthead-title">{title}</h1>
            {lede && <div className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--cine-fg-2)] md:text-[1.075rem]">{lede}</div>}
            {children && <div className="mt-7">{children}</div>}
          </div>
          {aside}
        </div>
      </div>
    </div>
  );
}
