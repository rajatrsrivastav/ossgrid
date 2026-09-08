"use client";

import { ArrowRight, Compass } from "lucide-react";

export interface TechTrack {
  id: string;
  name: string;
  badge: string;
  color: string;
  borderColor: string;
  bgLight: string;
  description: string;
  technologies: string[];
  keyOrgs: string[];
  categoryFilter?: string;
  techFilter?: string;
}

export const TECH_TRACKS: TechTrack[] = [
  {
    id: "cloud-native",
    name: "Cloud Native & Distributed Systems",
    badge: "Line 1 • Blue",
    color: "#3b82f6",
    borderColor: "rgba(59, 130, 246, 0.35)",
    bgLight: "rgba(59, 130, 246, 0.08)",
    description: "Orchestration, service mesh, observability, and container runtime platforms.",
    technologies: ["Go", "Kubernetes", "gRPC", "Docker", "Prometheus"],
    keyOrgs: ["Kubernetes", "Envoy", "Cilium", "Prometheus", "Thanos"],
    categoryFilter: "Cloud Native",
    techFilter: "Go",
  },
  {
    id: "systems-kernel",
    name: "Systems, Kernel & Silicon",
    badge: "Line 2 • Amber",
    color: "#f59e0b",
    borderColor: "rgba(245, 158, 11, 0.35)",
    bgLight: "rgba(245, 158, 11, 0.08)",
    description: "Operating system internals, low-level virtualization, firmware, and architectures.",
    technologies: ["C", "C++", "Rust", "Assembly", "eBPF"],
    keyOrgs: ["Linux Kernel", "RISC-V", "Xen", "Zephyr", "OpenBMC"],
    categoryFilter: "Operating Systems",
    techFilter: "C",
  },
  {
    id: "ai-data",
    name: "AI, Vector Engines & Open Data",
    badge: "Line 3 • Purple",
    color: "#a855f7",
    borderColor: "rgba(168, 85, 247, 0.35)",
    bgLight: "rgba(168, 85, 247, 0.08)",
    description: "Machine learning workflows, vector databases, distributed analytics, and pipelines.",
    technologies: ["Python", "C++", "PyTorch", "Rust", "CUDA"],
    keyOrgs: ["OpenSearch", "Milvus", "Ray", "Flyte", "Kubeflow"],
    categoryFilter: "AI & Data",
    techFilter: "Python",
  },
  {
    id: "web-developer-tools",
    name: "Web, API & Developer Experience",
    badge: "Line 4 • Emerald",
    color: "#10b981",
    borderColor: "rgba(16, 185, 129, 0.35)",
    bgLight: "rgba(16, 185, 129, 0.08)",
    description: "APIs, schema governance, frontend developer platforms, and cloud edge.",
    technologies: ["TypeScript", "JavaScript", "GraphQL", "Node.js", "React"],
    keyOrgs: ["GraphQL", "Vitess", "OpenFeature", "Backstage", "KubeEdge"],
    categoryFilter: "Web & Developer Tools",
    techFilter: "TypeScript",
  },
  {
    id: "security-blockchain",
    name: "Security, Supply Chain & Trust",
    badge: "Line 5 • Rose",
    color: "#f43f5e",
    borderColor: "rgba(244, 63, 94, 0.35)",
    bgLight: "rgba(244, 63, 94, 0.08)",
    description: "Cryptographic identity, software supply chain security, and distributed ledgers.",
    technologies: ["Go", "Rust", "Solidity", "Crypto", "WebAssembly"],
    keyOrgs: ["Hyperledger", "OpenSSF", "Sigstore", "TUF", "Confidential Containers"],
    categoryFilter: "Security & Blockchain",
    techFilter: "Rust",
  },
];

interface TechTracksProps {
  onSelectTrack: (track: TechTrack) => void;
}

export default function TechTracks({ onSelectTrack }: TechTracksProps) {
  return (
    <section className="w-full mb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Wayfinding: Choose Your Technology Track
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Navigate the open-source ecosystem by domain. Click any line to filter matching organizations and projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TECH_TRACKS.map((track) => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track)}
            className="flex flex-col p-5 rounded-2xl bg-[var(--bg-card)] border transition-all duration-200 cursor-pointer group select-none relative hover:-translate-y-1 shadow-sm hover:shadow-md"
            style={{
              borderColor: "var(--border-card)",
            }}
          >
            {/* Top Indicator */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span
                className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: track.bgLight,
                  color: track.color,
                  border: `1px solid ${track.borderColor}`,
                }}
              >
                {track.badge}
              </span>

              <ArrowRight
                size={14}
                className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all"
              />
            </div>

            {/* Track Name */}
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 group-hover:text-blue-600 dark:text-blue-400 transition-colors">
              {track.name}
            </h3>

            {/* Description */}
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">
              {track.description}
            </p>

            {/* Stack Tags */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {track.technologies.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-card)]"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Key Orgs */}
            <div
              className="pt-2.5 border-t text-[11px] text-[var(--text-muted)] flex items-center justify-between"
              style={{ borderColor: "var(--border-card)" }}
            >
              <span>Sample orgs: {track.keyOrgs.slice(0, 3).join(", ")}...</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">Explore</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
