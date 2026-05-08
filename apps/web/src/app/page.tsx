import type { Metadata } from "next";

import { PublicLanding } from "../components/public-landing";
import { StructuredData } from "../components/structured-data";
import { redirectAuthenticatedUser } from "../server/auth/guards";

const PAGE_TITLE = "hege | Reviermanagement für Revierleitung und Team";
const PAGE_DESCRIPTION =
  "hege verbindet Backoffice und mobile App für Jagdgesellschaften: Sitzungen, Protokolle, Ansitze, Fallwild und Reviereinrichtungen auf einer Datenbasis.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Reviermanagement",
    "Jagdgesellschaft",
    "Hege",
    "Sitzungsprotokoll",
    "Fallwild",
    "Ansitz",
    "Hochstand",
    "Österreich"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "de_AT",
    url: "/",
    siteName: "hege",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "hege — Reviermanagement für Jagdgesellschaften"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await redirectAuthenticatedUser();

  return (
    <>
      <StructuredData description={PAGE_DESCRIPTION} />
      <PublicLanding />
    </>
  );
}
