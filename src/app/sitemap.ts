import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { GsocOrganization, Organization } from "@/lib/types";
import { comingSoonPrograms } from "@/data/programs";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.ossgrid.tech";
  // Pages change when the data does, so the data files' modification time is the honest date.
  const mtime = (f: string) => (fs.existsSync(f) ? fs.statSync(f).mtime : new Date());
  const lfxUpdated = mtime(path.join(process.cwd(), "public", "data", "organizations.json"));
  const gsocUpdated = mtime(path.join(process.cwd(), "public", "data", "gsoc", "organizations.json"));
  const now = new Date(Math.max(lfxUpdated.getTime(), gsocUpdated.getTime()));

  const filePath = path.join(process.cwd(), "public", "data", "organizations.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Sitemap generation failed: ${filePath} does not exist.`);
  }

  const organizations: Organization[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const gsocPath = path.join(process.cwd(), "public", "data", "gsoc", "organizations.json");
  const gsocOrgs: GsocOrganization[] = fs.existsSync(gsocPath) ? JSON.parse(fs.readFileSync(gsocPath, "utf8")) : [];

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
    {
      url: `${baseUrl}/gsoc`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contribute`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contributors`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/proposals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...comingSoonPrograms().map((p) => ({
      url: `${baseUrl}/programs/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...organizations.map((org) => ({
      url: `${baseUrl}/organization/${org.id}`,
      lastModified: lfxUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...gsocOrgs.map((org) => ({
      url: `${baseUrl}/gsoc/${org.slug}`,
      lastModified: gsocUpdated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return routes;
}
