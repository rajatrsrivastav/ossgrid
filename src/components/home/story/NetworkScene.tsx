import Link from "next/link";
import type { NetworkLabel } from "@/lib/home-data";

interface NetworkSceneProps {
  desktop: NetworkLabel[];
  mobile: NetworkLabel[];
  orgCount: number;
}

const nf = new Intl.NumberFormat("en-US");

/**
 * Full-bleed render of the largest organizations as a network. Labels are live links placed at
 * the positions the renderer projected, so they sit on the right sphere at every width.
 */
export default function NetworkScene({ desktop, mobile, orgCount }: NetworkSceneProps) {
  return (
    <section id="network" aria-labelledby="network-title" className="cine cine-section !px-0">
      <div className="cine-wrap mb-10 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <h2 id="network-title" className="font-display cine-h2">{nf.format(orgCount)} organizations, linked by the tools they share.</h2>
        <p className="font-ui cine-lede">
          Each sphere is one of the largest GSoC or LFX organizations, sized by the projects it has run. A line joins two organizations that list four or more of the same technologies. If you can work in one, you can read the code of its neighbours.
        </p>
      </div>

      <div className="cine-network font-ui">
        <picture>
          <source media="(max-width: 640px)" type="image/avif" srcSet="/art/network-mobile-780.avif 780w, /art/network-mobile-1170.avif 1170w" sizes="100vw" />
          <source media="(max-width: 640px)" type="image/webp" srcSet="/art/network-mobile-780.webp 780w, /art/network-mobile-1170.webp 1170w" sizes="100vw" />
          <source type="image/avif" srcSet="/art/network-1200.avif 1200w, /art/network-1920.avif 1920w, /art/network-2880.avif 2880w" sizes="100vw" />
          <source type="image/webp" srcSet="/art/network-1200.webp 1200w, /art/network-1920.webp 1920w, /art/network-2880.webp 2880w" sizes="100vw" />
          <img src="/art/network-1920.webp" alt="" width={2880} height={1240} loading="lazy" decoding="async" />
        </picture>
        <ul aria-label="Organizations in the network" className="hidden sm:block">
          {desktop.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="cine-node" style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.name}</Link>
            </li>
          ))}
        </ul>
        <ul aria-label="Organizations in the network" className="sm:hidden">
          {mobile.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="cine-node" style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
