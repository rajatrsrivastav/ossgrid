import { ogCard, OG_SIZE } from "@/lib/og";

export const alt = "OSSGrid contributor playbook";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    eyebrow: "Contributor playbook",
    title: "How people actually get selected",
    stats: [
      { value: "01", label: "choose a community" },
      { value: "02", label: "contribute" },
      { value: "03", label: "write the proposal" },
    ],
  });
}
