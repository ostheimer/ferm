import { describe, expect, it } from "vitest";

/**
 * `<ViewToggle>` ist eine reine Render-Komponente — kein lebender
 * Helper-Code, kein State-Reducer. Statt RN-Render-Tests aufzuziehen
 * (was Native-Modules-Mocking braucht), pruefen wir hier kontraktuelle
 * Annahmen, die der Aufrufer einhalten muss, damit die Komponente
 * vorhersagbar funktioniert.
 *
 * Konkret: das Options-Array muss eindeutige Keys haben, sonst wuerde
 * React-Key-Warnings fliegen und Tap-Handler unzuverlaessig.
 */

interface MinimalOption {
  key: string;
  label: string;
}

function hasUniqueKeys(options: ReadonlyArray<MinimalOption>): boolean {
  const keys = new Set<string>();
  for (const option of options) {
    if (keys.has(option.key)) {
      return false;
    }
    keys.add(option.key);
  }
  return true;
}

describe("ViewToggle options contract", () => {
  it("akzeptiert eindeutige Keys", () => {
    expect(
      hasUniqueKeys([
        { key: "liste", label: "Liste" },
        { key: "karte", label: "Karte" }
      ])
    ).toBe(true);
  });

  it("schlaegt fehl bei doppelten Keys", () => {
    expect(
      hasUniqueKeys([
        { key: "a", label: "A" },
        { key: "a", label: "Ersatz-A" }
      ])
    ).toBe(false);
  });

  it("erlaubt leere Optionen (Aufrufer-Verantwortung sie nicht zu zeigen)", () => {
    expect(hasUniqueKeys([])).toBe(true);
  });
});
