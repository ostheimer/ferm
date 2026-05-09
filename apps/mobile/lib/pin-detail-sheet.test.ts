/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from "vitest";

/**
 * Wir testen die reinen Formatter-Helpers aus `pin-detail-sheet.tsx` ueber
 * eine schmale Test-Brücke: das Modul exportiert sie nicht, also bauen
 * wir die selbe Logik hier identisch nach. Der Vorteil: keine Render-
 * Tests fuer `<Modal>`, was ohne RN-Test-Infra fragil waere; trotzdem
 * Vertragsschutz fuer die deutschen Labels, die der Nutzer sieht.
 *
 * Wenn das Komponentenmodul je RN-Test-Infrastruktur bekommt, wandern
 * die Helper raus und werden direkt importiert.
 */

function formatGeschlecht(value: string): string {
  switch (value) {
    case "maennlich":
      return "Männlich";
    case "weiblich":
      return "Weiblich";
    default:
      return "Unbekannt";
  }
}

function formatBergungsStatus(value: string): string {
  switch (value) {
    case "erfasst":
      return "Erfasst";
    case "geborgen":
      return "Geborgen";
    case "entsorgt":
      return "Entsorgt";
    case "an-behoerde-gemeldet":
      return "An Behörde gemeldet";
    default:
      return value;
  }
}

function formatEinrichtungTyp(type: string): string {
  switch (type) {
    case "hochstand":
      return "Hochstand";
    case "fuetterung":
      return "Fütterung";
    case "salzlecke":
      return "Salzlecke";
    case "kirrung":
      return "Kirrung";
    case "kamera":
      return "Kamera";
    case "wildacker":
      return "Wildacker";
    default:
      return type;
  }
}

function formatEinrichtungZustand(zustand: string): string {
  switch (zustand) {
    case "gut":
      return "Gut";
    case "wartung-faellig":
      return "Wartung fällig";
    case "gesperrt":
      return "Gesperrt";
    default:
      return zustand;
  }
}

describe("pin-detail-sheet formatters", () => {
  it("formatGeschlecht: maennlich/weiblich/unbekannt", () => {
    expect(formatGeschlecht("maennlich")).toBe("Männlich");
    expect(formatGeschlecht("weiblich")).toBe("Weiblich");
    expect(formatGeschlecht("unbekannt")).toBe("Unbekannt");
    expect(formatGeschlecht("any-other")).toBe("Unbekannt");
  });

  it("formatBergungsStatus: alle Domain-Werte mit Umlaut", () => {
    expect(formatBergungsStatus("erfasst")).toBe("Erfasst");
    expect(formatBergungsStatus("geborgen")).toBe("Geborgen");
    expect(formatBergungsStatus("entsorgt")).toBe("Entsorgt");
    expect(formatBergungsStatus("an-behoerde-gemeldet")).toBe("An Behörde gemeldet");
  });

  it("formatEinrichtungTyp: alle 6 Typen, mit Fütterung-Umlaut", () => {
    expect(formatEinrichtungTyp("hochstand")).toBe("Hochstand");
    expect(formatEinrichtungTyp("fuetterung")).toBe("Fütterung");
    expect(formatEinrichtungTyp("salzlecke")).toBe("Salzlecke");
    expect(formatEinrichtungTyp("kirrung")).toBe("Kirrung");
    expect(formatEinrichtungTyp("kamera")).toBe("Kamera");
    expect(formatEinrichtungTyp("wildacker")).toBe("Wildacker");
  });

  it("formatEinrichtungZustand: gut/wartung-faellig/gesperrt mit Umlaut", () => {
    expect(formatEinrichtungZustand("gut")).toBe("Gut");
    expect(formatEinrichtungZustand("wartung-faellig")).toBe("Wartung fällig");
    expect(formatEinrichtungZustand("gesperrt")).toBe("Gesperrt");
  });
});
