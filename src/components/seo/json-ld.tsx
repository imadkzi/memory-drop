import { getSiteUrl, siteConfig } from "@/lib/site";

/** Server-only JSON-LD. Keep values trusted (no user input). */
export function HomeJsonLd() {
  const url = getSiteUrl();

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteConfig.name,
        url,
        email: siteConfig.email,
        logo: `${url}/brand/logo-mark.webp`,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: siteConfig.locale.replace("_", "-"),
      },
      {
        "@type": "WebPage",
        "@id": `${url}/#webpage`,
        url,
        name: siteConfig.name,
        description: siteConfig.description,
        isPartOf: { "@id": `${url}/#website` },
        about: { "@id": `${url}/#organization` },
        inLanguage: siteConfig.locale.replace("_", "-"),
      },
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "GBP",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
