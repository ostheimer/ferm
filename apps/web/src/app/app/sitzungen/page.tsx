import { requirePageRoles } from "../../../server/auth/guards";
import { listRevierMemberships, listSitzungen } from "../../../server/modules/sitzungen/queries";
import { SitzungenClient } from "../../sitzungen/sitzungen-client";

export const dynamic = "force-dynamic";

export default async function SitzungenPage() {
  await requirePageRoles(["schriftfuehrer", "revier-admin"], { next: "/app/sitzungen" });

  const [entries, memberships] = await Promise.all([listSitzungen(), listRevierMemberships()]);

  return <SitzungenClient entries={entries} memberships={memberships} />;
}
