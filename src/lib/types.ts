// =============================================================================
// LFX Organizations — Core Data Types
// =============================================================================

/** Mentor associated with a mentorship project */
export interface Mentor {
  name: string;
  github: string;
  email: string;
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
  category: string;
  terms: string[];
  years: number[];
  technologies: string[];
  projectCount: number;
  projects: Project[];
}

/** Current state of all active filters */
export interface FilterState {
  search: string;
  terms: string[];
  categories: string[];
  technologies: string[];
  years: number[];
  quickFilters: string[];
}

/** Term definition for the data pipeline */
export interface TermDefinition {
  year: number;
  term: string;
  label: string;
  termIndex: number;
  status?: string;
}

/** Available filter options derived from the dataset */
export interface FilterOptions {
  terms: { value: string; count: number }[];
  categories: { value: string; count: number }[];
  technologies: { value: string; count: number }[];
  years: { value: number; count: number }[];
}
