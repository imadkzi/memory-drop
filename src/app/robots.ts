import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/upload/", "/invite/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl.replace(/^https?:\/\//, ""),
  };
}
