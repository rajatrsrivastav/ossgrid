import Link from "next/link";
import Image from "next/image";

interface CommunityProps {
  count: number;
  faces: { login: string; name: string; avatarUrl: string; profileUrl: string }[];
}

/** OSSGrid's own contributors, kept clearly apart from the projects OSSGrid indexes. */
export default function Community({ count, faces }: CommunityProps) {
  return (
    <section id="community" aria-labelledby="community-title" className="cine cine-section">
      <div className="cine-wrap grid gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 id="community-title" className="font-display cine-h2">built in the open, too.</h2>
          <p className="font-ui cine-lede mt-8">
            OSSGrid is itself an open-source project. {count} people have shipped changes to it so far. Contributing here is a good first pull request: the codebase is small, the issues are scoped, and reviews are quick.
          </p>
          <p className="font-ui mt-4 max-w-[36rem] text-sm leading-relaxed text-[var(--cine-fg-3)]">
            This is separate from the organizations listed on OSSGrid. Work on those projects is recognized by those projects, not in OSSGrid&rsquo;s contributor list.
          </p>
          <div className="font-ui mt-10 flex flex-wrap gap-3">
            <Link href="/contribute" className="cine-btn cine-btn--solid">Start contributing</Link>
            <Link href="/contributors" className="cine-btn cine-btn--line">Meet the contributors</Link>
          </div>
        </div>

        <ul className="font-ui grid grid-cols-2 gap-px self-end overflow-hidden rounded-[4px] border border-[var(--cine-line)] bg-[var(--cine-line)] sm:grid-cols-3" aria-label="OSSGrid contributors">
          {faces.map((p) => (
            <li key={p.login} className="bg-[var(--cine-bg)]">
              <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--cine-raised)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--cine-accent)]">
                <Image src={p.avatarUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-full grayscale" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--cine-fg)]">{p.name}</span>
                  <span className="block truncate text-xs text-[var(--cine-fg-3)]">@{p.login}</span>
                </span>
              </a>
            </li>
          ))}
          <li className="bg-[var(--cine-bg)]">
            <Link href="/contribute" className="flex h-full items-center gap-3 p-4 text-sm font-semibold text-[var(--cine-fg)] transition-colors hover:bg-[var(--cine-raised)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--cine-accent)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--cine-line-strong)] text-lg" aria-hidden="true">+</span>
              Your name here
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
