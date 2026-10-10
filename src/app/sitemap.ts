import type { MetadataRoute } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getSiteUrl();

  return [
    {
      url: appUrl,
      lastModified: new Date(siteConfig.contentUpdated.home),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${appUrl}/privacy`,
      lastModified: new Date(siteConfig.contentUpdated.privacy),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${appUrl}/terms`,
      lastModified: new Date(siteConfig.contentUpdated.terms),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
