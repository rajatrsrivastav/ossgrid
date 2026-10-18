import Link from "next/link";

/** Closing statement: one decision, two real actions. */
export default function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="cine cine-section text-center">
      <div className="cine-wrap flex flex-col items-center">
        <h2 id="final-title" className="font-display cine-title !text-[clamp(2.6rem,6.4vw,6.5rem)]">
          <span className="line">pick one organization.</span>
          <span className="line">start tonight.</span>
        </h2>
        <p className="font-ui cine-lede mt-8 text-center">
          Read its last two years of projects, join its chat, and fix one real issue before applications open.
        </p>
        <div className="font-ui mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
          <Link href="/#programs" className="cine-btn cine-btn--solid">Explore programs</Link>
          <Link href="/guide" className="cine-btn cine-btn--line">Read the playbook</Link>
        </div>
      </div>
    </section>
  );
}
