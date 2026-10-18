import { ogCard, OG_SIZE } from "@/lib/og";
import { getGsocOrganizations } from "@/lib/gsoc-data";
import { getLfxOrganizations } from "@/lib/og-data";

export const alt = "OSSGrid: GSoC, LFX and open-source mentorship organizations in one place";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const gsoc = getGsocOrganizations();
  const lfx = getLfxOrganizations();
  const projects = gsoc.reduce((s, o) => s + o.projectCount, 0) + lfx.reduce((s, o) => s + o.projectCount, 0);
  return ogCard({
    eyebrow: "Google Summer of Code and LFX Mentorship",
    title: "find your place in open source.",
    stats: [
      { value: (gsoc.length + lfx.length).toLocaleString("en-US"), label: "organizations" },
      { value: projects.toLocaleString("en-US"), label: "projects" },
    ],
  });
}
