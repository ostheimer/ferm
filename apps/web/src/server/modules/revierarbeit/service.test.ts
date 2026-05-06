import type { Aufgabe, Reviermeldung } from "@hege/domain";
import { describe, expect, it, vi } from "vitest";

import type { RequestContext } from "../../auth/context";
import { createRevierarbeitService } from "./service";
import type { RevierarbeitRepository } from "./repository";

const context: RequestContext = {
  userId: "user-ausgeher",
  membershipId: "member-ausgeher",
  revierId: "revier-attersee",
  role: "ausgeher"
};

const now = "2026-05-03T20:00:00.000Z";

describe("revierarbeit service", () => {
  it("creates reviermeldungen with membership and revier context", async () => {
    const repository = createRepository({
      insertReviermeldung: vi.fn(async (entry) => entry)
    });
    const service = createRevierarbeitService({
      repository,
      generateId: (prefix) => `${prefix}-new`,
      getNow: () => now,
      useDemoStore: false
    });

    await expect(
      service.createReviermeldung(context, {
        category: "schaden",
        title: "Zaun beschädigt"
      })
    ).resolves.toMatchObject({
      id: "reviermeldung-new",
      revierId: "revier-attersee",
      createdByMembershipId: "member-ausgeher",
      status: "neu",
      occurredAt: now
    });
  });

  it("checks reviermeldung sources before creating aufgaben", async () => {
    const repository = createRepository({
      findReviermeldung: vi.fn(async () => undefined)
    });
    const service = createRevierarbeitService({
      repository,
      useDemoStore: false
    });

    await expect(
      service.createAufgabe(context, {
        sourceType: "reviermeldung",
        sourceId: "reviermeldung-missing",
        title: "Nachsehen"
      })
    ).rejects.toMatchObject({
      status: 404
    });
  });

  it("limits regular members to assigned or self-created aufgaben", async () => {
    const entries = [
      createAufgabeFixture({
        id: "aufgabe-assigned",
        assigneeMembershipIds: ["member-ausgeher"]
      }),
      createAufgabeFixture({
        id: "aufgabe-other",
        createdByMembershipId: "member-admin",
        assigneeMembershipIds: ["member-jaeger"]
      })
    ];
    const repository = createRepository({
      listAufgaben: vi.fn(async () => entries)
    });
    const service = createRevierarbeitService({
      repository,
      useDemoStore: false
    });

    await expect(service.listAufgaben(context)).resolves.toEqual([entries[0]]);
  });

  it("sets completedAt when an assigned aufgabe is marked erledigt", async () => {
    const existing = createAufgabeFixture({
      assigneeMembershipIds: ["member-ausgeher"]
    });
    const repository = createRepository({
      findAufgabe: vi.fn(async () => existing),
      updateAufgabe: vi.fn(async (_revierId, _aufgabeId, patch) => ({
        ...existing,
        ...patch,
        completedAt: patch.completedAt ?? existing.completedAt
      }))
    });
    const service = createRevierarbeitService({
      repository,
      getNow: () => now,
      useDemoStore: false
    });

    const updated = await service.updateAufgabe(context, "aufgabe-1", {
      status: "erledigt"
    });

    expect(updated.completedAt).toBe(now);
    expect(repository.updateAufgabe).toHaveBeenCalledWith(
      "revier-attersee",
      "aufgabe-1",
      expect.objectContaining({
        status: "erledigt",
        completedAt: now
      })
    );
  });
});

function createRepository(overrides: Partial<RevierarbeitRepository> = {}): RevierarbeitRepository {
  return {
    findAufgabe: vi.fn(async () => undefined),
    findReviermeldung: vi.fn(async () => createReviermeldungFixture()),
    insertAufgabe: vi.fn(async (entry) => entry),
    insertReviermeldung: vi.fn(async (entry) => entry),
    listAufgaben: vi.fn(async () => []),
    listReviermeldungen: vi.fn(async () => []),
    updateAufgabe: vi.fn(async () => undefined),
    updateReviermeldung: vi.fn(async () => undefined),
    ...overrides
  };
}

function createReviermeldungFixture(overrides: Partial<Reviermeldung> = {}): Reviermeldung {
  return {
    id: "reviermeldung-1",
    revierId: "revier-attersee",
    createdByMembershipId: "member-ausgeher",
    category: "schaden",
    status: "neu",
    occurredAt: now,
    title: "Zaun beschädigt",
    photos: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function createAufgabeFixture(overrides: Partial<Aufgabe> = {}): Aufgabe {
  return {
    id: "aufgabe-1",
    revierId: "revier-attersee",
    createdByMembershipId: "member-ausgeher",
    title: "Zaun kontrollieren",
    status: "offen",
    priority: "normal",
    assigneeMembershipIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}
