/** Shared site identity for metadata, sitemap, robots, and JSON-LD. */

export const siteConfig = {
  name: "Memory Drop",
  shortName: "Memory Drop",
  tagline: "Collect every photo your guests take.",
  description:
    "Collect event photos and videos from guests privately. Guests upload via link or QR. Only you can view the gallery.",
  locale: "en_GB",
  email: "hello@imadkazi.co.uk",
  /** Stable content dates for sitemap lastmod (update when copy materially changes). */
  contentUpdated: {
    home: "2026-10-10",
    privacy: "2026-10-06",
    terms: "2026-10-06",
  },
} as const;

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
