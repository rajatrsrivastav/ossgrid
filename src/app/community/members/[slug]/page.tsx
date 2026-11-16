import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PageMasthead from "@/components/PageMasthead";
import { getAllMembers, getMemberBySlug } from "@/lib/community-data";
import { getEventBySlug, formatEventDateRange } from "@/lib/events-data";
import { safeJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getAllMembers().map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) return { title: "Member not found" };
  return {
    title: `${member.name} · Community`,
    description: member.bio,
    alternates: { canonical: `/community/members/${member.slug}` },
  };
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();

  const events = member.eventsJoined
    .map((eventSlug) => getEventBySlug(eventSlug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ossgrid.tech" },
      { "@type": "ListItem", position: 2, name: "Community", item: "https://www.ossgrid.tech/community" },
      {
        "@type": "ListItem",
        position: 3,
        name: member.name,
        item: `https://www.ossgrid.tech/community/members/${member.slug}`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <PageMasthead
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Community", href: "/community" },
            { label: member.name },
          ]}
          label="Member"
          title={member.name}
          lede={<p>{member.bio}</p>}
        >
          {member.github && (
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              GitHub profile
            </a>
          )}
        </PageMasthead>

        <div className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 md:flex-row">
            <div className="shrink-0">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-[var(--radius-card)] bg-[var(--bg-input)] object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-24 w-24 items-center justify-center rounded-[var(--radius-card)] bg-[var(--bg-input)] text-2xl font-semibold text-[var(--text-secondary)]"
                >
                  {member.name.slice(0, 1)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-10">
              <section aria-labelledby="skills">
                <h2 id="skills" className="text-xl font-semibold text-[var(--text-primary)]">
                  Skills
                </h2>
                {member.skills.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">No skills listed yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {member.skills.map((skill) => (
                      <li key={skill} className="chip num text-xs">
                        {skill}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="projects">
                <h2 id="projects" className="text-xl font-semibold text-[var(--text-primary)]">
                  Projects
                </h2>
                {member.projects.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">No projects listed yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {member.projects.map((project) => (
                      <li key={project.name} className="card p-4">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--text-primary)] underline-offset-4 hover:underline"
                          >
                            {project.name}
                          </a>
                        ) : (
                          <span className="font-medium text-[var(--text-primary)]">{project.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="events">
                <h2 id="events" className="text-xl font-semibold text-[var(--text-primary)]">
                  Events joined
                </h2>
                {events.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">No events listed yet.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {events.map((event) => (
                      <li key={event.slug} className="card p-4">
                        <Link
                          href={`/events/${event.slug}`}
                          className="font-medium text-[var(--text-primary)] underline-offset-4 hover:underline"
                        >
                          {event.title}
                        </Link>
                        <p className="num mt-1 text-xs text-[var(--text-muted)]">
                          {formatEventDateRange(event.startDate, event.endDate)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
