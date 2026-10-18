import Link from "next/link";

interface MissionProps {
  orgs: string;
  projects: string;
  since: number;
}

/** Text-led statement on black. The paragraph's words brighten as it scrolls past (CSS only). */
export default function Mission({ orgs, projects, since }: MissionProps) {
  const story = `Every project here was proposed in public, mentored in public and merged in public. OSSGrid keeps ${orgs} organizations and ${projects} projects since ${since} in one place, so you can see who keeps coming back, what they built and where you could start.`;
  return (
    <section id="mission" aria-labelledby="mission-title" className="cine cine-section">
      <div className="cine-wrap grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <h2 id="mission-title" className="font-display cine-h2">
          great work begins
          <br />
          in the open.
        </h2>
        <div className="flex flex-col gap-10">
          <p className="font-display cine-story">
            {story.split(" ").map((word, i) => (
              <span key={i} className="w">{word} </span>
            ))}
          </p>
          <p className="font-ui">
            <Link href="/guide" className="cine-link text-base">Read how people actually get selected</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
