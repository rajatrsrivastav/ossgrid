import Link from "next/link";
import Image from "next/image";

interface FinalCtaProps {
  community: {
    count: number;
    faces: { login: string; name: string; avatarUrl: string; profileUrl: string }[];
  };
}

/**
 * Closing statement with one decision and two actions, then OSSGrid's own contributors, kept
 * clearly apart from the projects OSSGrid indexes.
 */
export default function FinalCta({ community }: FinalCtaProps) {
  return (
    <section aria-labelledby="final-title" className="cine cine-section">
      <div className="cine-wrap flex flex-col items-center text-center">
        <h2 id="final-title" className="font-display cine-title !text-[clamp(2.6rem,6.4vw,6.5rem)]">
          <span className="line">pick one organization.</span>
          <span className="line">start tonight.</span>
        </h2>
        <p className="font-ui cine-lede mt-8 text-center">
          Read its last two years of projects, join its chat, and fix one real issue before applications open.
        </p>
        <div className="font-ui mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
          <Link href="/#explore" className="cine-btn cine-btn--solid">Explore organizations</Link>
          <Link href="/guide" className="cine-btn cine-btn--line">Read the playbook</Link>
        </div>
      </div>

      <div className="cine-wrap font-ui mt-[clamp(88px,14vh,160px)]">
        <div className="flex flex-col gap-6 border-t border-[var(--cine-line)] pt-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[40rem]">
            <h3 className="font-display text-[clamp(1.6rem,2.4vw,2.25rem)] font-bold leading-tight text-[var(--cine-fg)]">built in the open, too.</h3>
            <p className="mt-3 text-base leading-relaxed text-[var(--cine-fg-2)]">
              OSSGrid is itself open source. {community.count} people have shipped changes to it. That work is separate from the organizations listed here, which recognize contributions to their own projects.
            </p>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ul className="flex -space-x-2" aria-label="Some OSSGrid contributors">
              {community.faces.slice(0, 6).map((p) => (
                <li key={p.login}>
                  <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" className="block rounded-full ring-2 ring-[var(--cine-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cine-accent)]" title={p.name}>
                    <Image src={p.avatarUrl} alt={p.name} width={44} height={44} unoptimized className="h-11 w-11 rounded-full grayscale" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link href="/contribute" className="cine-btn cine-btn--line">Start contributing</Link>
              <Link href="/contributors" className="cine-link self-center text-sm">Meet the contributors</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
