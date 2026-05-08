import type { MetadataRoute } from "next";

import { getPublicAppUrl } from "../lib/public-urls";

/**
 * Robots-Manifest. Die Marketingseite ist crawlbar, die App-Bereiche
 * (Login, Dashboard, App-Routes, API) bleiben fuer Suchmaschinen aussen
 * vor — sie sind entweder Auth-pflichtig oder als JSON-Endpunkte nicht
 * fuer den Search-Index gedacht.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/app/", "/login", "/registrieren", "/einladung/"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
