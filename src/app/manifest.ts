import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OSSGrid: open-source mentorship organizations",
    short_name: "OSSGrid",
    description: "Google Summer of Code and LFX Mentorship organizations, projects and mentors in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    categories: ["education", "developer"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
