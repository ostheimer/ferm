import type { ProtokollVersion } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { buildVersionTimeline } from "./version-timeline";

function version(overrides: Partial<ProtokollVersion> & { id: string; createdAt: string }): ProtokollVersion {
  return {
    id: overrides.id,
    createdAt: overrides.createdAt,
    createdByMembershipId: overrides.createdByMembershipId ?? "m1",
    summary: overrides.summary ?? "",
    agenda: overrides.agenda ?? [],
    beschluesse: overrides.beschluesse ?? [],
    attachments: overrides.attachments ?? []
  };
}

describe("buildVersionTimeline", () => {
  it("leere Liste ergibt leeres Timeline", () => {
    expect(buildVersionTimeline([], [])).toEqual([]);
  });

  it("sortiert nach createdAt absteigend (neueste zuerst)", () => {
    const versions = [
      version({ id: "alt", createdAt: "2026-05-01T08:00:00Z" }),
      version({ id: "neu", createdAt: "2026-05-10T08:00:00Z" }),
      version({ id: "mittel", createdAt: "2026-05-05T08:00:00Z" })
    ];

    const result = buildVersionTimeline(versions, []);

    expect(result.map((entry) => entry.id)).toEqual(["neu", "mittel", "alt"]);
  });

  it("setzt versionNumber so dass neueste die hoechste hat", () => {
    const versions = [
      version({ id: "a", createdAt: "2026-05-01T08:00:00Z" }),
      version({ id: "b", createdAt: "2026-05-05T08:00:00Z" }),
      version({ id: "c", createdAt: "2026-05-10T08:00:00Z" })
    ];

    const result = buildVersionTimeline(versions, []);

    expect(result.map((entry) => ({ id: entry.id, num: entry.versionNumber }))).toEqual([
      { id: "c", num: 3 },
      { id: "b", num: 2 },
      { id: "a", num: 1 }
    ]);
  });

  it("aufloest Membership zum Author-Namen", () => {
    const versions = [
      version({ id: "v1", createdAt: "2026-05-10T08:00:00Z", createdByMembershipId: "m-mair" })
    ];
    const memberships = [
      { membershipId: "m-mair", userName: "Florian Mair" },
      { membershipId: "m-other", userName: "Andere Person" }
    ];

    const result = buildVersionTimeline(versions, memberships);
    expect(result[0]?.authorName).toBe("Florian Mair");
  });

  it("Fallback 'Unbekannt' wenn Membership unbekannt", () => {
    const versions = [
      version({ id: "v1", createdAt: "2026-05-10T08:00:00Z", createdByMembershipId: "m-orphan" })
    ];

    expect(buildVersionTimeline(versions, []).at(0)?.authorName).toBe("Unbekannt");
  });

  it("zaehlt Agenda/Beschluesse/Attachments korrekt", () => {
    const versions = [
      version({
        id: "v1",
        createdAt: "2026-05-10T08:00:00Z",
        agenda: ["a", "b", "c"],
        beschluesse: [
          { id: "b1", title: "T", decision: "D", owner: "O" },
          { id: "b2", title: "T", decision: "D", owner: "O" }
        ] as unknown as ProtokollVersion["beschluesse"],
        attachments: [
          { id: "att1", url: "u", title: "T", createdAt: "2026-05-10T08:00:00Z" }
        ] as unknown as ProtokollVersion["attachments"]
      })
    ];

    const result = buildVersionTimeline(versions, [])[0];
    expect(result?.agendaCount).toBe(3);
    expect(result?.beschluesseCount).toBe(2);
    expect(result?.attachmentsCount).toBe(1);
  });
});
