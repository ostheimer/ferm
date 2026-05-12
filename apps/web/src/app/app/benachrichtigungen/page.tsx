import { requirePageAuth } from "../../../server/auth/guards";
import { getDashboardSnapshot } from "../../../server/modules/dashboard/queries";
import { BenachrichtigungenClient } from "./benachrichtigungen-client";

export const dynamic = "force-dynamic";

/**
 * Web-Pendant zum Mobile-Notification-Center (P2.3).
 *
 * Liest die letzten Benachrichtigungen aus dem Dashboard-Snapshot —
 * Backend bleibt unangetastet, weil der Snapshot sie schon enthaelt.
 * Client kombiniert sie mit localStorage-Read-State und stellt Filter
 * + Mark-As-Read bereit.
 */
export default async function BenachrichtigungenPage() {
  await requirePageAuth({ next: "/app/benachrichtigungen" });
  const snapshot = await getDashboardSnapshot();

  return <BenachrichtigungenClient notifications={snapshot.overview.letzteBenachrichtigungen} />;
}
