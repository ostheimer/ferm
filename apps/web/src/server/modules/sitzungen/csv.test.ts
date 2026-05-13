import type { Sitzung } from "@hege/domain";
import { describe, expect, it } from "vitest";

import { buildCsv } from "../../csv/escape";
import { SITZUNGEN_CSV_HEADER, toSitzungCsvRow } from "./queries";

/**
 * Vertrags-Test fuer den Sitzungen-CSV-Export. Wir testen `toSitzungCsvRow`
 * direkt zusammen mit `buildCsv`, statt `exportSitzungenCsv` durchzulaufen,
 * weil letzteres ueber `listSitzungen` an `getRequestContext`/DB haengt.
 * Das Risiko, das wir absichern wollen: Header-Reihenfolge und Zellen-
 * Belegung sollen stabil bleiben, damit Excel-Vorlagen (Schriftfuehrung)
 * nicht silently brechen.
 */

function sitzung(overrides: Partial<Sitzung> & { id: string }): Sitzung {
  return {
    id: overrides.id,
    revierId: overrides.revierId ?? "revier-1",
    title: overrides.title ?? "Jahreshauptversammlung",
    scheduledAt: overrides.scheduledAt ?? "2026-04-12T19:00:00Z",
    locationLabel: overrides.locationLabel ?? "Jagdhaus Gänserndorf",
    status: overrides.status ?? "entwurf",
    participants: overrides.participants ?? [],
    versions: overrides.versions ?? [],
    publishedDocument: overrides.publishedDocument
  };
}

describe("Sitzungen-CSV-Export Vertrag", () => {
  it("Header enthaelt id, titel, status und Counts in stabiler Reihenfolge", () => {
    expect(SITZUNGEN_CSV_HEADER).toEqual([
      "id",
      "titel",
      "termin",
      "ort",
      "status",
      "teilnehmer_anwesend",
      "teilnehmer_gesamt",
      "anzahl_versionen",
      "anzahl_beschluesse",
      "letztes_update_am",
      "freigegebenes_dokument_am"
    ]);
  });

  it("Leere Sitzung ohne Teilnehmer + Versionen rendert Counts als 0 und Termine als Leerzelle", () => {
    const row = toSitzungCsvRow(sitzung({ id: "s1" }));
    expect(row).toEqual([
      "s1",
      "Jahreshauptversammlung",
      "2026-04-12T19:00:00Z",
      "Jagdhaus Gänserndorf",
      "entwurf",
      0,
      0,
      0,
      0,
      "",
      ""
    ]);
  });

  it("Teilnehmer-Anwesenheit zaehlt nur `anwesend: true`", () => {
    const row = toSitzungCsvRow(
      sitzung({
        id: "s2",
        participants: [
          { membershipId: "m1", anwesend: true },
          { membershipId: "m2", anwesend: false },
          { membershipId: "m3", anwesend: true }
        ]
      })
    );

    // Index 5 = teilnehmer_anwesend, Index 6 = teilnehmer_gesamt.
    expect(row[5]).toBe(2);
    expect(row[6]).toBe(3);
  });

  it("Beschluss-Anzahl summiert ueber ALLE Versionen", () => {
    const row = toSitzungCsvRow(
      sitzung({
        id: "s3",
        versions: [
          {
            id: "v2",
            createdAt: "2026-04-13T08:00:00Z",
            createdByMembershipId: "m1",
            summary: "Final",
            agenda: [],
            beschluesse: [
              { id: "b1", title: "TOP 1", decision: "Beschlossen" },
              { id: "b2", title: "TOP 2", decision: "Beschlossen" }
            ],
            attachments: []
          },
          {
            id: "v1",
            createdAt: "2026-04-12T20:00:00Z",
            createdByMembershipId: "m1",
            summary: "Entwurf",
            agenda: [],
            beschluesse: [{ id: "b0", title: "Vorbereitend", decision: "Vorbereitung" }],
            attachments: []
          }
        ]
      })
    );

    // anzahl_versionen, anzahl_beschluesse
    expect(row[7]).toBe(2);
    expect(row[8]).toBe(3);
    // letztes_update_am = createdAt der ersten Version (Service liefert DESC sortiert)
    expect(row[9]).toBe("2026-04-13T08:00:00Z");
  });

  it("Freigegebenes Dokument wird mit createdAt exportiert", () => {
    const row = toSitzungCsvRow(
      sitzung({
        id: "s4",
        status: "freigegeben",
        publishedDocument: {
          id: "doc-1",
          title: "Protokoll",
          fileName: "protokoll.pdf",
          contentType: "application/pdf",
          createdAt: "2026-04-20T10:00:00Z",
          url: "/api/v1/documents/doc-1/download"
        }
      })
    );

    expect(row[4]).toBe("freigegeben");
    expect(row[10]).toBe("2026-04-20T10:00:00Z");
  });

  it("CSV-Output enthaelt weder 'undefined' noch 'null' bei minimaler Sitzung", () => {
    const csv = buildCsv([...SITZUNGEN_CSV_HEADER], [toSitzungCsvRow(sitzung({ id: "s5" }))]);
    expect(csv).not.toContain("undefined");
    expect(csv).not.toContain("null");
  });
});
