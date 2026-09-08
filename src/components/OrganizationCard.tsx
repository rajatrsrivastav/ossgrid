import Link from "next/link";
import { ExternalLink, FolderOpen } from "lucide-react";
import { Organization } from "@/lib/types";
import { truncate } from "@/lib/utils";

interface OrganizationCardProps {
  org: Organization;
}

export default function OrganizationCard({ org }: OrganizationCardProps) {
  const maxTechBadges = 4;
  const visibleTech = org.technologies.slice(0, maxTechBadges);
  const extraTechCount = org.technologies.length - maxTechBadges;

  const latestLfxUrl = org.projects.find((p) => p.lfxUrl)?.lfxUrl;

  return (
    <Link
      href={`/organization/${org.id}`}
      className="glass-card flex flex-col h-full group"
      style={{ textDecoration: "none" }}
    >
      {/* Card Header */}
      <div className="p-5 pb-3 flex items-start gap-3.5">
        {/* Logo */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden ring-1 ring-white/10">
          <img
            src={org.logoUrl}
            alt={org.name}
            width={44}
            height={44}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="text-base font-semibold truncate leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {org.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-accent text-[10px] px-2 py-0.5">
              {org.foundation}
            </span>
            <span className="badge text-[10px] px-2 py-0.5">
              {org.category}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {truncate(org.description, 160)}
        </p>
      </div>

      {/* Year Badges */}
      <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
        {org.years.slice(0, 5).map((year) => (
          <span key={year} className="badge badge-year text-[10px] px-2 py-0.5 font-mono">
            {year}
          </span>
        ))}
        {org.years.length > 5 && (
          <span className="badge text-[10px] px-2 py-0.5 font-mono">
            +{org.years.length - 5}
          </span>
        )}
      </div>

      {/* Tech Badges */}
      <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
        {visibleTech.map((tech) => (
          <span key={tech} className="badge badge-tech text-[10px] px-2 py-0.5">
            {tech.toLowerCase()}
          </span>
        ))}
        {extraTechCount > 0 && (
          <span className="badge badge-tech text-[10px] px-2 py-0.5">
            +{extraTechCount} more
          </span>
        )}
      </div>

      {/* Footer Actions */}
      <div
        className="px-5 py-3 flex items-center justify-between mt-auto"
        style={{ borderTop: "1px solid var(--border-card)" }}
      >
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--accent-start)" }}
        >
          <FolderOpen size={13} />
          {org.projectCount} {org.projectCount === 1 ? "project" : "projects"}
        </span>

        {latestLfxUrl && (
          <span
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--accent-end)" }}
          >
            Apply <ExternalLink size={11} />
          </span>
        )}
      </div>
    </Link>
  );
}
