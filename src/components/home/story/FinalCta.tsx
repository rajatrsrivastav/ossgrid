import Link from "next/link";

/**
 * Closing statement: pick an organization to contribute to.
 * OSSGrid is open source, but the product goal is contributing to indexed projects, not this repo.
 */
export default function FinalCta() {
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
              OSSGrid’s source is public. This site exists so you can find organizations to contribute to — not so you contribute here.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/rajatrsrivastav/ossgrid"
              target="_blank"
              rel="noopener noreferrer"
              className="cine-btn cine-btn--line"
            >
              Source on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
