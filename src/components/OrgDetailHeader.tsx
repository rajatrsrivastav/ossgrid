"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

interface OrgDetailHeaderProps {
  orgName: string;
}

export default function OrgDetailHeader({ orgName }: OrgDetailHeaderProps) {
  const router = useRouter();

  return (
    <>
      <Header variant="simple" />
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 px-4 lg:px-8 py-2.5 text-sm"
        style={{ borderBottom: "1px solid var(--border-card)" }}
        aria-label="Breadcrumb"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 transition-colors hover:text-[var(--text-secondary)]"
          style={{ color: "var(--text-muted)" }}
          aria-label="Go back"
        >
          <ArrowLeft size={14} />
          LFX Organizations
        </button>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span
          className="font-semibold truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {orgName}
        </span>
      </nav>
    </>
  );
}
