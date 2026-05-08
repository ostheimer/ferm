import Script from "next/script";

import { getPublicAppUrl } from "../lib/public-urls";

/**
 * Strukturierte Daten (JSON-LD) fuer die oeffentliche Produktseite.
 *
 * Wir liefern zwei `@type`s in einem `@graph`:
 * - `Organization` — beschreibt hege als Anbieter
 * - `WebSite` — verknuepft Domain und Suchaktion
 *
 * Das hilft Google, die Seite als Produkt einer konkreten Organisation
 * zu erkennen. Ohne strukturierte Daten zeigt der Lighthouse-SEO-Audit
 * zwar keine Punktabzuege, aber Rich-Result-Tester und Knowledge-Panel
 * profitieren deutlich.
 *
 * Wir nutzen `next/script` mit `strategy="beforeInteractive"` und einer
 * stabilen `id`. Das ist Next.js' offizielle Empfehlung fuer JSON-LD
 * (siehe https://nextjs.org/docs/app/guides/json-ld) — der Inhalt ist
 * vollstaendig server-generiert, keine Nutzereingabe, kein XSS-Risiko.
 */
interface StructuredDataProps {
  description: string;
}

export function StructuredData({ description }: StructuredDataProps) {
  const baseUrl = getPublicAppUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "hege",
        url: baseUrl,
        logo: `${baseUrl}/brand/hege-logo-mark.png`,
        description,
        areaServed: { "@type": "Country", name: "Österreich" }
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "hege",
        description,
        inLanguage: "de-AT",
        publisher: { "@id": `${baseUrl}/#organization` }
      }
    ]
  };

  return (
    <Script
      id="hege-structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  );
}
