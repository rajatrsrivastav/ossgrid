"use client";

import dynamic from "next/dynamic";
import { Project } from "@/lib/types";

const OrgChart = dynamic(() => import("@/components/OrgChart"), { ssr: false });

interface OrgChartWrapperProps {
  projects: Project[];
}

export default function OrgChartWrapper({ projects }: OrgChartWrapperProps) {
  return <OrgChart projects={projects} />;
}
