import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft } from "lucide-react";
import fs from "fs";
import path from "path";
import { Organization, Project } from "@/lib/types";
import OrgChart from "@/components/OrgChartWrapper";

// Static generation
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return [];
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return orgs.map((org) => ({ slug: org.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return { title: "Organization Not Found" };
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const org = orgs.find((o) => o.id === slug);

  if (!org) return { title: "Organization Not Found" };

  return {
    title: `${org.name} - LFX Organizations`,
    description: org.description,
  };
}

// Fetch org data
async function getOrganization(slug: string): Promise<Organization | null> {
  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) return null;
  const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return orgs.find((o) => o.id === slug) || null;
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganization(slug);

  if (!org) {
    notFound();
  }

  // Group projects by year, then by term within each year
  const projectsByYearTerm: Record<number, Record<string, Project[]>> = {};
  for (const project of org.projects) {
    if (!projectsByYearTerm[project.year]) projectsByYearTerm[project.year] = {};
    const termKey = project.term; // e.g. "2026 Term 1 (Mar-May)"
    if (!projectsByYearTerm[project.year][termKey]) projectsByYearTerm[project.year][termKey] = [];
    projectsByYearTerm[project.year][termKey].push(project);
  }

  const displayYears = Object.keys(projectsByYearTerm).map(Number).sort((a, b) => b - a);

  // Helper for generic fallback action
  const latestLfxUrl = org.projects.find((p) => p.lfxUrl)?.lfxUrl;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Since we don't have search/filter state passed, we'll pass no-ops for this static page for now or create a static Header variation */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-card)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          height: "var(--header-height)",
        }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 text-inherit no-underline">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                }}
              >
                LF
              </div>
              <h1 className="text-lg font-bold tracking-tight hidden sm:block">
                <span className="gradient-text">LFX</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>Organizations</span>
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
             <Link 
               href="/"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
               style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-card)",
                  color: "var(--text-secondary)",
               }}
             >
               <ArrowLeft size={16} /> Back to Search
             </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-8">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Top Section: Profile & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-7">
              <div 
                className="glass-card p-8 rounded-2xl h-full flex flex-col"
                style={{ 
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  boxShadow: "var(--shadow-card)" 
                }}
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden ring-1 ring-white/10 bg-white">
                    <img
                      src={org.logoUrl}
                      alt={org.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                      {org.name}
                    </h1>
                    <div className="flex items-center gap-3">
                      {latestLfxUrl && (
                        <a 
                          href={latestLfxUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))",
                            color: "white",
                          }}
                        >
                          Visit Site <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-base leading-relaxed mb-8 flex-1" style={{ color: "var(--text-secondary)" }}>
                  {org.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Category</span>
                    <span className="badge px-3 py-1 bg-white/5">{org.category}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Years</span>
                    <div className="flex flex-wrap gap-1.5">
                      {org.years.map((year) => (
                        <span key={year} className="badge badge-year text-xs px-2 py-0.5 font-mono">{year}</span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2 mt-2">
                    <span className="block text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Technologies & Topics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {org.technologies.map((tech) => (
                        <span key={tech} className="badge badge-tech text-xs px-2 py-1">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recharts Stacked Bar Chart */}
            <div className="lg:col-span-5 flex flex-col">
              <div 
                className="glass-card p-6 rounded-2xl flex-1 flex flex-col"
                style={{ 
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                }}
              >
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-center" style={{ color: "var(--text-muted)" }}>
                  Projects by Year &amp; Term
                </h3>
                
                <div className="flex-1 min-h-[240px]">
                  <OrgChart projects={org.projects} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Past Projects — grouped by Year, then Term */}
          <div className="space-y-12">
            <h2 className="text-2xl font-bold border-b pb-4" style={{ color: "var(--text-primary)", borderColor: "var(--border-card)" }}>
              Past Projects
            </h2>

            {displayYears.map((year) => {
              // Sort terms ascending within each year (Term 1, Term 2, Term 3)
              const termsForYear = Object.keys(projectsByYearTerm[year]).sort((a, b) => {
                const idxA = a.match(/Term\s*(\d+)/i)?.[1] ?? '0';
                const idxB = b.match(/Term\s*(\d+)/i)?.[1] ?? '0';
                return Number(idxA) - Number(idxB);
              });

              return (
                <div key={year}>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                    <span className="badge badge-year text-lg px-3 py-1 shadow-sm">{year}</span>
                  </h3>

                  {termsForYear.map((termLabel) => {
                    // Extract short term label like "Term 1 (Mar-May)" from "2026 Term 1 (Mar-May)"
                    const shortTerm = termLabel.replace(/^\d{4}\s*/, '');

                    return (
                      <div key={termLabel} className="mb-8">
                        <h4 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ background: "linear-gradient(135deg, var(--accent-start), var(--accent-end))" }}
                          />
                          {shortTerm}
                          <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                            — {projectsByYearTerm[year][termLabel].length} project{projectsByYearTerm[year][termLabel].length !== 1 ? 's' : ''}
                          </span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                          {projectsByYearTerm[year][termLabel].map((project, index) => (
                            <div 
                              key={`${project.id}-${year}-${index}`} 
                              className="glass-card p-6 flex flex-col h-full rounded-xl transition-all hover:translate-y-[-2px]"
                              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-card)" }}
                            >
                              <h4 className="font-bold leading-tight mb-2" style={{ color: "var(--text-primary)" }}>
                                {project.title}
                              </h4>
                              
                              {/* Mentee details */}
                              {project.mentees && project.mentees.length > 0 ? (
                                <div className="mb-3 text-sm italic" style={{ color: "var(--text-muted)" }}>
                                  Mentee: {project.mentees.map(m => m.name).join(", ")}
                                </div>
                              ) : (
                                <div className="mb-3 text-sm italic" style={{ color: "var(--text-muted)" }}>
                                  Mentee details unavailable
                                </div>
                              )}

                              <p className="text-sm line-clamp-4 leading-relaxed mb-6 flex-1" style={{ color: "var(--text-secondary)" }}>
                                {project.description || project.expectedOutcome || "No description provided."}
                              </p>

                              <div className="flex items-center gap-2 mt-auto pt-4 border-t" style={{ borderColor: "var(--border-card)" }}>
                                {project.upstreamIssueUrl && (
                                  <a
                                    href={project.upstreamIssueUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-colors"
                                    style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
                                  >
                                    More Details
                                  </a>
                                )}
                                {project.lfxUrl ? (
                                  <a
                                    href={project.lfxUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center py-2 rounded-lg text-xs font-semibold transition-colors"
                                    style={{ background: "var(--bg-badge)", color: "var(--text-primary)" }}
                                  >
                                    LFX Portal
                                  </a>
                                ) : (
                                  <span 
                                    className="flex-1 text-center py-2 rounded-lg text-xs font-semibold opacity-50 cursor-not-allowed"
                                    style={{ background: "var(--bg-badge)", color: "var(--text-muted)" }}
                                  >
                                    LFX Portal
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
