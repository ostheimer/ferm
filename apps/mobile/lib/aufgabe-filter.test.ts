import type { Aufgabe } from "@hege/domain";
import { describe, expect, it } from "vitest";

import {
  applyAufgabeFilter,
  DEFAULT_AUFGABE_FILTER,
  isAufgabeFilterActive
} from "./aufgabe-filter.helpers";

function aufgabe(overrides: Partial<Aufgabe> & { id: string; title: string }): Aufgabe {
  return {
    id: overrides.id,
    revierId: overrides.revierId ?? "r1",
    createdByMembershipId: overrides.createdByMembershipId ?? "m1",
    sourceType: overrides.sourceType,
    sourceId: overrides.sourceId,
    title: overrides.title,
    description: overrides.description,
    status: overrides.status ?? "offen",
    priority: overrides.priority ?? "normal",
    dueAt: overrides.dueAt,
    completedAt: overrides.completedAt,
    completionNote: overrides.completionNote,
    assigneeMembershipIds: overrides.assigneeMembershipIds ?? [],
    createdAt: overrides.createdAt ?? "2026-05-01T08:00:00Z",
    updatedAt: overrides.updatedAt ?? "2026-05-01T08:00:00Z"
  };
}

describe("applyAufgabeFilter Status-Bucket", () => {
  it("Default-Status 'offen' filtert erledigte + abgelehnte + archivierte raus", () => {
    const list = [
      aufgabe({ id: "1", title: "Offen-A", status: "offen" }),
      aufgabe({ id: "2", title: "Erledigt-B", status: "erledigt" }),
      aufgabe({ id: "3", title: "In-Arbeit-C", status: "in_arbeit" }),
      aufgabe({ id: "4", title: "Blockiert-D", status: "blockiert" }),
      aufgabe({ id: "5", title: "Abgelehnt-E", status: "abgelehnt" }),
      aufgabe({ id: "6", title: "Archiviert-F", status: "archiviert" }),
      aufgabe({ id: "7", title: "Angenommen-G", status: "angenommen" })
    ];

    const result = applyAufgabeFilter(list, DEFAULT_AUFGABE_FILTER);
    // offen, in_arbeit, blockiert, angenommen -> 4 Aufgaben
    expect(result.map((entry) => entry.id).sort()).toEqual(["1", "3", "4", "7"]);
  });

  it("'erledigt' zeigt NUR erledigte (nicht abgelehnt/archiviert)", () => {
    const list = [
      aufgabe({ id: "e", title: "A", status: "erledigt" }),
      aufgabe({ id: "a", title: "B", status: "abgelehnt" }),
      aufgabe({ id: "ar", title: "C", status: "archiviert" })
    ];

    const result = applyAufgabeFilter(list, { ...DEFAULT_AUFGABE_FILTER, status: "erledigt" });
    expect(result.map((entry) => entry.id)).toEqual(["e"]);
  });

  it("'alle' zeigt alles ungefiltert", () => {
    const list = [
      aufgabe({ id: "1", title: "A", status: "offen" }),
      aufgabe({ id: "2", title: "B", status: "erledigt" }),
      aufgabe({ id: "3", title: "C", status: "archiviert" })
    ];

    const result = applyAufgabeFilter(list, { ...DEFAULT_AUFGABE_FILTER, status: "alle" });
    expect(result).toHaveLength(3);
  });
});

describe("applyAufgabeFilter Prioritaet", () => {
  it("Prioritaets-Filter reduziert auf gewuenschte Stufe", () => {
    const list = [
      aufgabe({ id: "dr", title: "A", priority: "dringend" }),
      aufgabe({ id: "h", title: "B", priority: "hoch" }),
      aufgabe({ id: "n", title: "C", priority: "normal" }),
      aufgabe({ id: "ni", title: "D", priority: "niedrig" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      prioritaet: "hoch"
    });

    expect(result.map((entry) => entry.id)).toEqual(["h"]);
  });
});

describe("applyAufgabeFilter Suche", () => {
  it("Volltext matcht Titel und Description und CompletionNote", () => {
    const list = [
      aufgabe({ id: "a", title: "Hochstand reparieren", description: "Leiter wackelt" }),
      aufgabe({ id: "b", title: "Kirrung kontrollieren", description: "Mai-Plan" }),
      aufgabe({
        id: "c",
        title: "Foto auswerten",
        description: "Routine",
        status: "erledigt",
        completionNote: "Kein Treffer auf Schwarzwild"
      })
    ];

    expect(
      applyAufgabeFilter(list, {
        ...DEFAULT_AUFGABE_FILTER,
        status: "alle",
        search: "wackelt"
      }).map((entry) => entry.id)
    ).toEqual(["a"]);

    // Search hits completionNote even when status=erledigt
    expect(
      applyAufgabeFilter(list, {
        ...DEFAULT_AUFGABE_FILTER,
        status: "alle",
        search: "schwarzwild"
      }).map((entry) => entry.id)
    ).toEqual(["c"]);
  });
});

describe("sortAufgaben", () => {
  it("'faellig-zuerst' sortiert dueAt ASC und schiebt undefined ans Ende", () => {
    const list = [
      aufgabe({ id: "spaet", title: "A", dueAt: "2026-06-01T10:00:00Z" }),
      aufgabe({ id: "ohne", title: "B" }), // kein dueAt
      aufgabe({ id: "frueh", title: "C", dueAt: "2026-05-15T10:00:00Z" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      sort: "faellig-zuerst"
    });

    expect(result.map((entry) => entry.id)).toEqual(["frueh", "spaet", "ohne"]);
  });

  it("'faellig-zuerst' faellt bei gleichem dueAt auf Prioritaet zurueck", () => {
    const sameDate = "2026-06-01T10:00:00Z";
    const list = [
      aufgabe({ id: "normal", title: "A", dueAt: sameDate, priority: "normal" }),
      aufgabe({ id: "dringend", title: "B", dueAt: sameDate, priority: "dringend" }),
      aufgabe({ id: "hoch", title: "C", dueAt: sameDate, priority: "hoch" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      sort: "faellig-zuerst"
    });

    expect(result.map((entry) => entry.id)).toEqual(["dringend", "hoch", "normal"]);
  });

  it("'prioritaet-hoch' sortiert dringend->hoch->normal->niedrig", () => {
    const list = [
      aufgabe({ id: "n", title: "A", priority: "normal", createdAt: "2026-01-01T00:00:00Z" }),
      aufgabe({ id: "ni", title: "B", priority: "niedrig", createdAt: "2026-01-01T00:00:00Z" }),
      aufgabe({ id: "h", title: "C", priority: "hoch", createdAt: "2026-01-01T00:00:00Z" }),
      aufgabe({ id: "dr", title: "D", priority: "dringend", createdAt: "2026-01-01T00:00:00Z" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      sort: "prioritaet-hoch"
    });

    expect(result.map((entry) => entry.id)).toEqual(["dr", "h", "n", "ni"]);
  });

  it("'neueste-zuerst' nutzt createdAt DESC", () => {
    const list = [
      aufgabe({ id: "alt", title: "A", createdAt: "2026-01-01T00:00:00Z" }),
      aufgabe({ id: "neu", title: "B", createdAt: "2026-04-01T00:00:00Z" }),
      aufgabe({ id: "mit", title: "C", createdAt: "2026-02-15T00:00:00Z" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      sort: "neueste-zuerst"
    });

    expect(result.map((entry) => entry.id)).toEqual(["neu", "mit", "alt"]);
  });

  it("'alphabetisch' nutzt dt-AT-Collator", () => {
    const list = [
      aufgabe({ id: "z", title: "Zaun" }),
      aufgabe({ id: "ae", title: "Ähre" }),
      aufgabe({ id: "a", title: "Anstand" })
    ];

    const result = applyAufgabeFilter(list, {
      ...DEFAULT_AUFGABE_FILTER,
      status: "alle",
      sort: "alphabetisch"
    });

    // Ä sortiert mit A im dt-AT-Collator
    expect(result.map((entry) => entry.id)[0]).toMatch(/^(a|ae)$/);
    expect(result.map((entry) => entry.id).at(-1)).toBe("z");
  });
});

describe("isAufgabeFilterActive", () => {
  it("Default ist nicht aktiv", () => {
    expect(isAufgabeFilterActive(DEFAULT_AUFGABE_FILTER)).toBe(false);
  });

  it("Status-Wechsel auf 'alle' oder 'erledigt' ist aktiv", () => {
    expect(
      isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, status: "alle" })
    ).toBe(true);
    expect(
      isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, status: "erledigt" })
    ).toBe(true);
  });

  it("Prioritaets- oder Sort-Wechsel ist aktiv", () => {
    expect(
      isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, prioritaet: "dringend" })
    ).toBe(true);
    expect(
      isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, sort: "alphabetisch" })
    ).toBe(true);
  });

  it("Whitespace-only Search gilt nicht als aktiv", () => {
    expect(isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, search: "   " })).toBe(false);
    expect(isAufgabeFilterActive({ ...DEFAULT_AUFGABE_FILTER, search: "x" })).toBe(true);
  });
});
