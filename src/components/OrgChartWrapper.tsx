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
      className="w-full h-full"
      style={{ width: "100%", height: "100%", minHeight: 180 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <OrgChart projects={projects} />
    </motion.div>
  );
}
