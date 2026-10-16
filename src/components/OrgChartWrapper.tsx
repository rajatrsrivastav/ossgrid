"use client";

import dynamic from "next/dynamic";
import { Project } from "@/lib/types";
import { motion } from "framer-motion";

const OrgChart = dynamic(() => import("@/components/OrgChart"), { ssr: false });

interface OrgChartWrapperProps {
  projects: Project[];
}

export default function OrgChartWrapper({ projects }: OrgChartWrapperProps) {
  return (
    <motion.div
      className="h-full min-h-[180px] w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <OrgChart projects={projects} />
    </motion.div>
  );
}
