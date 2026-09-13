import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { Organization } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ossgrid.tech";
  const now = new Date();

  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Sitemap generation failed: ${filePath} does not exist.`);
  }

  const organizations: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/lfx`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...organizations.map((org) => ({
      url: `${baseUrl}/organization/${org.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return routes;
}
