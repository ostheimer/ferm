import { describe, expect, it } from "vitest";

import { normalizeDeAtVisibleText } from "./de-at";

describe("normalizeDeAtVisibleText", () => {
  it("normalisiert alte sichtbare Testdaten auf de-AT-Umlaute", () => {
    expect(
      normalizeDeAtVisibleText(
        "Oberoesterreich | Voecklabruck | Protokoll veroeffentlicht | Fruehjahrsputz fuer Hochstaende und Beschluesse"
      )
    ).toBe("Oberösterreich | Vöcklabruck | Protokoll veröffentlicht | Frühjahrsputz für Hochstände und Beschlüsse");
  });

  it("lässt fehlende optionale Werte unverändert", () => {
    expect(normalizeDeAtVisibleText(undefined)).toBeUndefined();
    expect(normalizeDeAtVisibleText(null)).toBeNull();
  });
});
