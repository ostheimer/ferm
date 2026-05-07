import { describe, expect, it } from "vitest";

import { summarizeMarkers } from "./territory-map";

describe("summarizeMarkers", () => {
  it("liefert einen leeren String, wenn keine Marker uebergeben sind", () => {
    expect(summarizeMarkers([])).toBe("");
  });

  it("zaehlt Marker pro Typ und ueberspringt leere Kategorien", () => {
    const summary = summarizeMarkers([
      { id: "a", type: "Einrichtung", title: "Hochstand", position: { lat: 47, lng: 13 } },
      { id: "b", type: "Einrichtung", title: "Fuetterung", position: { lat: 47, lng: 13 } },
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
});
