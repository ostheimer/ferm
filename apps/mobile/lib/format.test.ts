import { describe, expect, it } from "vitest";

import { formatApiErrorDescription } from "./format";

describe("formatApiErrorDescription", () => {
  it("haengt einen Punkt an, wenn die Fehlermeldung keinen Satz-End hat", () => {
    const result = formatApiErrorDescription("Network request failed");
    expect(result).toContain("Network request failed.");
    expect(result).toContain("Tippe auf „Aktualisieren\"");
  });

  it("entfernt vorhandene End-Punctuation und ersetzt durch einheitlichen Punkt", () => {
    // Sonst haetten wir z.B. "Fehler!. Tippe auf ..." mit doppelter Punctuation.
    const result = formatApiErrorDescription("Server-Fehler!");
    expect(result.startsWith("Server-Fehler.\n")).toBe(true);
    expect(result).not.toContain("Server-Fehler!.");
  });

  it("normalisiert auch Auslassungspunkte (… und ...) zu einem Punkt", () => {
    expect(formatApiErrorDescription("Timeout… ").startsWith("Timeout.\n")).toBe(true);
    expect(formatApiErrorDescription("Timeout...").startsWith("Timeout.\n")).toBe(true);
  });

  it("zwei Absaetze: Error + Hint sind durch Leerzeile getrennt", () => {
    const result = formatApiErrorDescription("Boom");
    expect(result).toMatch(/^Boom\.\n\nTippe auf/);
  });
});
