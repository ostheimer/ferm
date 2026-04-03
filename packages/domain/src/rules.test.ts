import { describe, expect, it } from "vitest";

import { cloneDemoData } from "./mock-data";
import { buildDashboardOverview, createFallwild, endAnsitz, publishSitzung, startAnsitz } from "./rules";

describe("domain rules", () => {
  it("marks a new ansitz as conflict when the same hochstand is active", () => {
    const data = cloneDemoData();
    const session = startAnsitz(data, {
      revierId: "revier-attersee",
      membershipId: "member-admin",
      standortId: "einrichtung-1",
      standortName: "Hochstand Buchenhang",
      location: { lat: 47.9161, lng: 13.5182 },
      startedAt: "2026-04-03T07:10:00+02:00"
    });

    expect(session.conflict).toBe(true);
  });

  it("ends active ansitze and updates the dashboard count", () => {
    const data = cloneDemoData();
    endAnsitz(data, "ansitz-1", {
      endedAt: "2026-04-03T08:00:00+02:00"
    });

    const overview = buildDashboardOverview(data, "revier-attersee");
    expect(overview.aktiveAnsitze).toBe(1);
  });

  it("creates fallwild entries and keeps them exportable", () => {
    const data = cloneDemoData();
    const entry = createFallwild(data, {
      revierId: "revier-attersee",
      reportedByMembershipId: "member-jaeger",
      recordedAt: "2026-04-03T09:15:00+02:00",
      location: { lat: 47.92, lng: 13.51 },
      wildart: "Fuchs",
      geschlecht: "männlich",
      altersklasse: "Adult",
      gemeinde: "Steinbach am Attersee",
      bergungsStatus: "geborgen"
    });

    expect(entry.wildart).toBe("Fuchs");
    expect(data.fallwild).toHaveLength(2);
  });

  it("publishes minutes as a generated document", () => {
    const data = cloneDemoData();
    const sitzung = publishSitzung(data, "sitzung-1", "2026-04-03T10:00:00+02:00");

    expect(sitzung.status).toBe("freigegeben");
    expect(sitzung.publishedDocument?.contentType).toBe("application/pdf");
  });
});
