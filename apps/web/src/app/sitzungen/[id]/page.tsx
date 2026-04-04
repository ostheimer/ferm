import { notFound } from "next/navigation";

import { requirePageRoles } from "../../../server/auth/guards";
import { getSitzungById, listRevierMemberships } from "../../../server/modules/sitzungen/queries";
import { SitzungDetailClient } from "./sitzung-detail-client";

export const dynamic = "force-dynamic";

interface SitzungDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SitzungDetailPage({ params }: SitzungDetailPageProps) {
  const viewer = await requirePageRoles(["schriftfuehrer", "revier-admin"]);
  const { id } = await params;
  const [sitzung, memberships] = await Promise.all([getSitzungById(id), listRevierMemberships()]);

  if (!sitzung) {
    notFound();
  }

  return (
    <SitzungDetailClient
      canApprove={viewer.membership.role === "revier-admin"}
      memberships={memberships}
      sitzung={sitzung}
    />
  );
}
