import { ogCard, OG_SIZE } from "@/lib/og";
import { getProposalStats } from "@/lib/proposals-data";

export const alt = "Public Google Summer of Code proposals on OSSGrid";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const s = getProposalStats();
  return ogCard({
    eyebrow: "Proposals library",
    title: "Public GSoC proposals, read before you write",
    stats: [
      { value: String(s.count), label: "proposals" },
      { value: String(s.orgCount), label: "organizations" },
    ],
    accent: "#f59e0b",
  });
}
