import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { Organization } from "@/lib/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ossgrid.tech";
  const now = new Date();

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
  ];

  try {
    const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
    if (fs.existsSync(filePath)) {
      const orgs: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
      for (const org of orgs) {
        routes.push({
          url: `${baseUrl}/organization/${org.id}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error reading organizations for sitemap:", error);
  }

  return routes;
}
