import type { ReviermeldungListItem } from "./api";
import {
  buildReviermeldungPins,
  formatReviermeldungCategoryLabel,
  formatReviermeldungPinSubtitle,
  formatReviermeldungStatusLabel,
  formatRevierResourceTypeLabel
} from "./revierarbeit-map.helpers";
import { describe, expect, it } from "vitest";

function meldung(overrides: Partial<ReviermeldungListItem> = {}): ReviermeldungListItem {
  return {
    id: "meldung-1",
    revierId: "revier-1",
    createdByMembershipId: "member-1",
    category: "schaden",
    status: "neu",
    occurredAt: "2026-05-17T10:00:00+02:00",
    title: "Zaun beschädigt",
    description: "Draht liegt am Weg.",
    location: { lat: 48.3, lng: 16.7, label: "Feldweg Süd" },
    photos: [],
    createdAt: "2026-05-17T10:05:00+02:00",
    updatedAt: "2026-05-17T10:05:00+02:00",
    ...overrides
  };
}

describe("revierarbeit map helpers", () => {
  it("baut nur Pins für Reviermeldungen mit Standort", () => {
    const pins = buildReviermeldungPins([
      meldung(),
      meldung({ id: "meldung-ohne-standort", location: undefined })
    ]);

    expect(pins).toHaveLength(1);
    expect(pins[0]).toMatchObject({
      id: "meldung-1",
      kind: "reviermeldung",
      title: "Zaun beschädigt",
      subtitle: "Schaden · Neu",
      location: { lat: 48.3, lng: 16.7, label: "Feldweg Süd" }
    });
  });

  it("formatiert Kategorie und Status mit sichtbaren Umlauten", () => {
    expect(formatReviermeldungCategoryLabel("fuetterung")).toBe("Fütterung");
    expect(formatReviermeldungCategoryLabel("wasserung")).toBe("Wässerung");
    expect(formatReviermeldungStatusLabel("geprueft")).toBe("Geprüft");
    expect(formatReviermeldungPinSubtitle(meldung({ category: "fuetterung", status: "geprueft" }))).toBe(
      "Fütterung · Geprüft"
    );
  });

  it("formatiert Aufgaben- und Meldungs-Bezüge konsistent", () => {
    expect(formatRevierResourceTypeLabel("reviermeldung")).toBe("Reviermeldung");
    expect(formatRevierResourceTypeLabel("reviereinrichtung")).toBe("Reviereinrichtung");
    expect(formatRevierResourceTypeLabel("fallwild_vorgang")).toBe("Fallwild");
    expect(formatRevierResourceTypeLabel("sitzung")).toBe("Sitzung");
    expect(formatRevierResourceTypeLabel("beschluss")).toBe("Beschluss");
  });
});
