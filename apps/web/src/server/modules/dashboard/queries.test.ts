import { demoData, type AuthContextResponse } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { getDashboardSnapshot } from "./queries";

describe("dashboard queries", () => {
  it("builds the dashboard snapshot from the shared demo store", async () => {
    const context = createDemoAuthContext();
    const snapshot = await getDashboardSnapshot({
      context,
      now: new Date("2026-04-03T12:00:00+02:00")
    });

    expect(snapshot.activeRevierId).toBe("revier-attersee");
    expect(snapshot.overview.aktiveAnsitze).toBe(2);
    expect(snapshot.overview.ansitzeMitKonflikt).toBe(0);
    expect(snapshot.overview.offeneWartungen).toBe(1);
    expect(snapshot.overview.heutigeFallwildBergungen).toBe(1);
    expect(snapshot.overview.unveroeffentlichteProtokolle).toBe(1);
    expect(snapshot.overview.naechsteSitzung?.id).toBe("sitzung-1");
    expect(snapshot.overview.letzteBenachrichtigungen[0]?.id).toBe("notification-2");
    expect(snapshot.activeAnsitze.map((entry) => entry.id)).toEqual(["ansitz-2", "ansitz-1"]);
    expect(snapshot.recentFallwild[0]?.id).toBe("fallwild-1");
  });
});

function createDemoAuthContext(): AuthContextResponse {
  const user = demoData.users[0]!;
  const membership = demoData.memberships[0]!;
  const revier = demoData.reviere[0]!;

    return {
      user,
      membership,
      revier,
      activeRevierId: revier.id,
      setupRequired: false,
      availableMemberships: demoData.memberships.map((membership) => ({
        id: membership.id,
        revierId: membership.revierId,
        role: membership.role,
      jagdzeichen: membership.jagdzeichen,
      revierName: demoData.reviere.find((reier) => reier.id === membership.revierId)?.name ?? ""
    }))
  };
}
