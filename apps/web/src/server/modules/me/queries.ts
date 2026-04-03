import type { Revier, Role } from "@hege/domain";
import { eq } from "drizzle-orm";

import { getRequestContext } from "../../auth/context";
import { getDb } from "../../db/client";
import { type RevierRecord, memberships, reviere, users } from "../../db/schema";
import { createDemoStore } from "../../demo-store";
import { getServerEnv } from "../../env";

export interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  membership: {
    id: string;
    revierId: string;
    role: Role;
    jagdzeichen: string;
    pushEnabled: boolean;
  };
  revier: Revier;
}

export async function getCurrentUser(): Promise<MeResponse> {
  if (getServerEnv().useDemoStore) {
    return getCurrentUserFromDemoStore();
  }

  const db = getDb();
  const context = await getRequestContext();

  const [user] = await db.select().from(users).where(eq(users.id, context.userId)).limit(1);
  const [membership] = await db.select().from(memberships).where(eq(memberships.id, context.membershipId)).limit(1);
  const [revier] = await db.select().from(reviere).where(eq(reviere.id, context.revierId)).limit(1);

  if (!user || !membership || !revier) {
    throw new Error("Dev context is not configured correctly.");
  }

  return {
    user,
    membership,
    revier: mapRevierRecordToDomain(revier)
  };
}

function getCurrentUserFromDemoStore(): MeResponse {
  const store = createDemoStore();
  const context = {
    userId: process.env.DEV_USER_ID ?? "user-huber",
    membershipId: process.env.DEV_MEMBERSHIP_ID ?? "member-jaeger",
    revierId: process.env.DEV_REVIER_ID ?? "revier-attersee"
  };

  const user = store.users.find((entry) => entry.id === context.userId);
  const membership = store.memberships.find((entry) => entry.id === context.membershipId);
  const revier = store.reviere.find((entry) => entry.id === context.revierId);

  if (!user || !membership || !revier) {
    throw new Error("Dev context is not configured correctly.");
  }

  return {
    user,
    membership,
    revier
  };
}

function mapRevierRecordToDomain(record: RevierRecord): Revier {
  return {
    id: record.id,
    tenantKey: record.tenantKey,
    name: record.name,
    bundesland: record.bundesland,
    bezirk: record.bezirk,
    flaecheHektar: record.flaecheHektar,
    zentrum: {
      lat: record.zentrumLat,
      lng: record.zentrumLng,
      label: record.zentrumLabel ?? undefined
    }
  };
}
