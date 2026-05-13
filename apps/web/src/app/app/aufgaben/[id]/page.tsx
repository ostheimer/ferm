import { notFound } from "next/navigation";

import { getRequestContext } from "../../../../server/auth/context";
import { requirePageRoles } from "../../../../server/auth/guards";
import {
  getAufgabeForRequest,
  getReviermeldungForRequest
} from "../../../../server/modules/revierarbeit/queries";
import { REVIERARBEIT_ALLOWED_ROLES } from "../../../../server/modules/revierarbeit/service";
import { listRevierMemberships } from "../../../../server/modules/sitzungen/queries";

import { AufgabeDetailClient } from "./aufgabe-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Detail-Sicht fuer eine einzelne Aufgabe. Ergaenzt die Listen-Sicht
 * in /app/aufgaben (#93) — dort sieht man Title + Priorität-Badge,
 * hier den vollen Inhalt (Beschreibung, Notiz, Assignees mit Namen,
 * Source-Reviermeldung mit Deep-Link).
 *
 * Source-Resolution: wenn sourceType === "reviermeldung", laden wir
 * die Original-Meldung mit, damit der Detail-View einen Link auf
 * /app/reviermeldungen zeigen UND die Titel-Vorschau direkt rendern
 * kann. Schlaegt das Laden fehl (Meldung geloescht?), zeigt die UI
 * den raw sourceId — die Aufgabe selbst bleibt sichtbar.
 */
export default async function AufgabeDetailPage({ params }: PageProps) {
  await requirePageRoles([...REVIERARBEIT_ALLOWED_ROLES], { next: "/app/aufgaben" });
  const { id } = await params;
  const context = await getRequestContext();

  let aufgabe;
  try {
    aufgabe = await getAufgabeForRequest(id, context);
  } catch {
    notFound();
  }

  const [memberships, sourceMeldung] = await Promise.all([
    listRevierMemberships(),
    aufgabe.sourceType === "reviermeldung" && aufgabe.sourceId
      ? getReviermeldungForRequest(aufgabe.sourceId, context).catch(() => undefined)
      : Promise.resolve(undefined)
  ]);

  return (
    <AufgabeDetailClient
      aufgabe={aufgabe}
      memberships={memberships}
      sourceMeldung={sourceMeldung}
    />
  );
}
