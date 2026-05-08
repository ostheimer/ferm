import type { MetadataRoute } from "next";

import { getPublicAppUrl } from "../lib/public-urls";

/**
 * Minimalistisches Sitemap. Die einzige indexierbare Seite ist aktuell
 * die oeffentliche Produktseite "/". Sobald wir Blog-Eintraege oder
 * Feature-Detail-Seiten ergaenzen, kommen sie hier dazu.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicAppUrl();
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1
    }
  ];
}
