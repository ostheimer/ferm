import type { Metadata } from "next";

import { PublicLanding } from "../components/public-landing";
import { redirectAuthenticatedUser } from "../server/auth/guards";

export const metadata: Metadata = {
  title: "hege | Reviermanagement fuer Revierleitung und Team",
  description: "Oeffentliche Produktseite fuer Reviermanagement, Protokolle, Fallwild und mobile Meldungen."
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await redirectAuthenticatedUser();

  return <PublicLanding />;
}
