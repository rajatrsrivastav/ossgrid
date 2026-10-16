// =============================================================================
// LFX Organizations — Core Data Types
// =============================================================================

/** Mentor associated with a mentorship project */
export interface Mentor {
  /** True when the source supplies only a handle, not a personal name. */
  nameIsHandle?: boolean;
  name: string;
  github: string;
  email: string;
}

/** Immutable reference to an official source record. */
export interface ProjectSource {
  url: string;
  path: string;
  revision: string;
  line: number;
  contentHash: string;
  status: "accepted" | "proposed";
}

/** Individual mentorship project within an organization */
export interface Project {
  id: string;
  title: string;
  organization: string;
  organizationId: string;
  description: string;
  expectedOutcome: string;
  skills: string[];
  mentors: Mentor[];
  mentees: { name: string; github: string }[];
  upstreamIssueUrl: string;
  upstreamIssueUrls: string[];
  links: string[];
  technologies: string[];
  program: "LFX Mentorship" | "CommunityBridge";
  status: "accepted" | "proposed";
  sources: ProjectSource[];
  missingFields: string[];
  lfxUrl: string;
  term: string;
  year: number;
  termIndex: number;
}

/** Aggregated organization containing multiple projects across terms */
export interface Organization {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  foundation: string;
  website: string;
  github: string;
  sources: string[];
  category: string;
  terms: string[];
  years: number[];
  technologies: string[];
  projectCount: number;
  projects: Project[];
}

/** Lightweight project summary for explorer cards and search */
export interface LfxProjectSummary {
  title: string;
  year: number;
  mentors?: { name: string }[];
}

/** Lightweight organization DTO passed to the LFX explorer client to reduce payload size */
export interface LfxOrganizationDto {
  id: string;
  name: string;
  logoUrl: string;
  description: string;
  foundation: string;
  website: string;
  github: string;
  category: string;
  terms: string[];
  years: number[];
  technologies: string[];
  projectCount: number;
  projects: LfxProjectSummary[];
}

/** Term definition for the data pipeline */
export interface TermDefinition {
  year: number;
  term: string;
  label: string;
  termIndex: number;
  status?: string;
}

// =============================================================================
// Google Summer of Code — Shipped Data Types
// =============================================================================

export type GsocProjectSize = "small" | "medium" | "large";

/** Outbound links for a GSoC organization. Empty string when the source has none. */
export interface GsocOrgLinks {
  ideas: string;
  guide: string;
  chat: string;
  mailingList: string;
  blog: string;
  twitter: string;
  /** GSoC archive page for the latest year. */
  archive: string;
}

/** Light organization DTO shipped to /gsoc. Projects live in projects-<year>.json. */
export interface GsocOrganization {
  slug: string;
  name: string;
  logoUrl: string;
  logoBackground: string;
  description: string;
  website: string;
  category: string;
  topics: string[];
  technologies: string[];
  /** Years the org was accepted, ascending. */
  years: number[];
  /** Accepted projects per year (from the GSoC archive). */
  projectsByYear: Record<string, number>;
  /** GSoC archive page per year. */
  archiveByYear: Record<string, string>;
  projectCount: number;
  firstYear: number;
  latestYear: number;
  links: GsocOrgLinks;
}

/** Mentor as shipped: never an email address. */
export interface GsocMentor {
  name: string;
  github: string;
  primary?: boolean;
}

export interface GsocProject {
  id: string;
  orgSlug: string;
  year: number;
  title: string;
  /** One-line summary (GSoC short description or the first sentence of a CNCF idea). */
  summary: string;
  /** Full text, HTML stripped. */
  description: string;
  /** Accepted contributor, when the archive lists one. */
  contributor: string;
  projectUrl: string;
  codeUrl: string;
  /** "gsoc": accepted project from the archive. "cncf": idea from cncf/mentoring. */
  origin: "gsoc" | "cncf";
  status: "accepted" | "proposed";
  /** Upstream project for umbrella organizations, e.g. "Kubernetes" under CNCF. */
  subProject?: string;
  skills: string[];
  size?: GsocProjectSize;
  difficulty?: string;
  mentors: GsocMentor[];
  upstreamIssueUrls: string[];
  sources: ProjectSource[];
  missingFields: string[];
}

/** projects-<year>.json */
export interface GsocYearFile {
  year: number;
  projects: GsocProject[];
}

// =============================================================================
// Proposals library — Shipped Data Types
// =============================================================================

export interface ProposalRecord {
  id: string;
  year: number | null;
  orgName: string;
  /** GSoC organization slug, "" when the archive's org name did not match. */
  orgId: string;
  title: string;
  author: string;
  status: "accepted" | "rejected" | "unknown";
  format: "pdf" | "md" | "docx" | "link";
  /** Link to the original file. OSSGrid never rehosts proposals. */
  url: string;
  sourceRepo: string;
  license: string;
}
