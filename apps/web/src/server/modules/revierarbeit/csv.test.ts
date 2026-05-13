import type { Reviermeldung } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { buildCsv } from "../../csv/escape";
import { REVIERMELDUNGEN_CSV_HEADER, toReviermeldungCsvRow } from "./queries";

/**
 * Vertrags-Test fuer den Reviermeldungen-CSV-Export. Testet
 * `toReviermeldungCsvRow` direkt + buildCsv, statt
 * `exportReviermeldungenCsv` durch DB/Demo-Store zu schicken. Mit
 * gleicher Begruendung wie bei Sitzungen-CSV (#88): Zellen-Belegung
 * ist trivial, Header-Drift soll früh sichtbar werden.
 */

function meldung(overrides: Partial<Reviermeldung> & { id: string }): Reviermeldung {
  return {
    id: overrides.id,
    revierId: overrides.revierId ?? "r1",
    createdByMembershipId: overrides.createdByMembershipId ?? "m1",
    category: overrides.category ?? "schaden",
    status: overrides.status ?? "neu",
    occurredAt: overrides.occurredAt ?? "2026-05-13T10:00:00Z",
    title: overrides.title ?? "Zaun beschädigt",
    description: overrides.description,
    location: overrides.location,
    relatedType: overrides.relatedType,
    relatedId: overrides.relatedId,
    photos: overrides.photos ?? [],
    createdAt: overrides.createdAt ?? "2026-05-13T10:05:00Z",
    updatedAt: overrides.updatedAt ?? "2026-05-13T10:05:00Z"
  };
}

describe("Reviermeldungen-CSV-Export Vertrag", () => {
  it("Header in stabiler Reihenfolge", () => {
    expect(REVIERMELDUNGEN_CSV_HEADER).toEqual([
      "id",
      "occurred_at",
      "kategorie",
      "status",
      "titel",
      "beschreibung",
      "location_label",
      "lat",
      "lng",
      "related_type",
      "related_id",
      "fotos_anzahl",
      "created_at",
      "updated_at"
    ]);
  });

  it("Minimale Meldung ohne Location/Beschreibung/Fotos rendert Leer-Zellen + 0", () => {
    const row = toReviermeldungCsvRow(meldung({ id: "m1" }));

    expect(row).toEqual([
      "m1",
      "2026-05-13T10:00:00Z",
      "schaden",
      "neu",
      "Zaun beschädigt",
      "",
      "",
      "",
      "",
      "",
      "",
      0,
      "2026-05-13T10:05:00Z",
      "2026-05-13T10:05:00Z"
    ]);
  });

  it("Location mit Label exportiert Label + lat/lng als Zahlen", () => {
    const row = toReviermeldungCsvRow(
      meldung({
        id: "m2",
        location: { lat: 48.123, lng: 16.456, label: "Feldweg Süd" }
      })
    );

    // location_label, lat, lng
    expect(row[6]).toBe("Feldweg Süd");
    expect(row[7]).toBe(48.123);
    expect(row[8]).toBe(16.456);
  });

  it("relatedType/Id und photos.length werden exportiert", () => {
    const row = toReviermeldungCsvRow(
      meldung({
        id: "m3",
        relatedType: "reviereinrichtung",
        relatedId: "eq-1",
        photos: [
          {
            id: "p1",
            title: "Foto 1",
            url: "/api/foto-1",
            createdAt: "2026-05-13T10:01:00Z"
          },
          {
            id: "p2",
            title: "Foto 2",
            url: "/api/foto-2",
            createdAt: "2026-05-13T10:02:00Z"
          }
        ]
      })
    );

    expect(row[9]).toBe("reviereinrichtung");
    expect(row[10]).toBe("eq-1");
    expect(row[11]).toBe(2);
  });

  it("CSV-Output enthaelt weder 'undefined' noch 'null' bei minimaler Meldung", () => {
    const csv = buildCsv(
      [...REVIERMELDUNGEN_CSV_HEADER],
      [toReviermeldungCsvRow(meldung({ id: "m4" }))]
    );
    expect(csv).not.toContain("undefined");
    expect(csv).not.toContain("null");
  });
});
