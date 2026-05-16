import { describe, expect, it } from "vitest";

import { summarizeMarkers } from "./territory-map";

describe("summarizeMarkers", () => {
  it("liefert einen leeren String, wenn keine Marker übergeben sind", () => {
    expect(summarizeMarkers([])).toBe("");
  });

  it("zählt Marker pro Typ und überspringt leere Kategorien", () => {
    const summary = summarizeMarkers([
      { id: "a", type: "Einrichtung", title: "Hochstand", position: { lat: 47, lng: 13 } },
      { id: "b", type: "Einrichtung", title: "Fütterung", position: { lat: 47, lng: 13 } },
      { id: "c", type: "Ansitz", title: "Ansitz Wald", position: { lat: 47, lng: 13 } }
    ]);

    expect(summary).toBe("2× Einrichtung, 1× Ansitz");
  });

  it("listet alle drei Typen, wenn alle vertreten sind", () => {
    const summary = summarizeMarkers([
      { id: "a", type: "Einrichtung", title: "x", position: { lat: 47, lng: 13 } },
      { id: "b", type: "Ansitz", title: "y", position: { lat: 47, lng: 13 } },
      { id: "c", type: "Fallwild", title: "z", position: { lat: 47, lng: 13 } }
    ]);

    expect(summary).toBe("1× Einrichtung, 1× Ansitz, 1× Fallwild");
  });

  it("berücksichtigt Reviermeldungen als eigene Markerkategorie", () => {
    const summary = summarizeMarkers([
      { id: "a", type: "Reviermeldung", title: "Gefahr", position: { lat: 47, lng: 13 } },
      { id: "b", type: "Fallwild", title: "Reh", position: { lat: 47, lng: 13 } }
    ]);

    expect(summary).toBe("1× Fallwild, 1× Reviermeldung");
  });
});
