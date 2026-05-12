import { describe, expect, it } from "vitest";

import {
  computeProgress,
  getStepIndex,
  isFinalStep,
  isFirstStep,
  nextStep,
  previousStep,
  validateRevierForm,
  WIZARD_STEPS
} from "./setup-wizard.helpers";

describe("Wizard-Navigation", () => {
  it("WIZARD_STEPS hat genau vier Schritte in der richtigen Reihenfolge", () => {
    expect(WIZARD_STEPS).toEqual(["revier", "einrichtung", "einladung", "fertig"]);
  });

  it("getStepIndex liefert den Index in WIZARD_STEPS", () => {
    expect(getStepIndex("revier")).toBe(0);
    expect(getStepIndex("einrichtung")).toBe(1);
    expect(getStepIndex("einladung")).toBe(2);
    expect(getStepIndex("fertig")).toBe(3);
  });

  it("nextStep waehlt den naechsten Schritt", () => {
    expect(nextStep("revier")).toBe("einrichtung");
    expect(nextStep("einrichtung")).toBe("einladung");
    expect(nextStep("einladung")).toBe("fertig");
  });

  it("nextStep bleibt auf 'fertig' (kein Overflow)", () => {
    expect(nextStep("fertig")).toBe("fertig");
  });

  it("previousStep geht eine Stufe zurueck", () => {
    expect(previousStep("fertig")).toBe("einladung");
    expect(previousStep("einladung")).toBe("einrichtung");
    expect(previousStep("einrichtung")).toBe("revier");
  });

  it("previousStep bleibt auf 'revier' (kein Underflow)", () => {
    expect(previousStep("revier")).toBe("revier");
  });

  it("isFirstStep / isFinalStep", () => {
    expect(isFirstStep("revier")).toBe(true);
    expect(isFirstStep("einrichtung")).toBe(false);
    expect(isFinalStep("fertig")).toBe(true);
    expect(isFinalStep("einladung")).toBe(false);
  });
});

describe("validateRevierForm", () => {
  const valid = {
    revierName: "Jagdgesellschaft Test",
    bundesland: "Niederösterreich",
    bezirk: "Gänserndorf",
    flaecheHektar: "150"
  };

  it("liefert null bei gueltigen Daten", () => {
    expect(validateRevierForm(valid)).toBeNull();
  });

  it("Reviername leer", () => {
    expect(validateRevierForm({ ...valid, revierName: "  " })).toMatch(/Reviernamen/i);
  });

  it("Bundesland leer", () => {
    expect(validateRevierForm({ ...valid, bundesland: "" })).toMatch(/Bundesland/i);
  });

  it("Bezirk leer", () => {
    expect(validateRevierForm({ ...valid, bezirk: "" })).toMatch(/Bezirk/i);
  });

  it("Flaeche kleiner-gleich 0", () => {
    expect(validateRevierForm({ ...valid, flaecheHektar: "0" })).toMatch(/Fläche/i);
    expect(validateRevierForm({ ...valid, flaecheHektar: "-5" })).toMatch(/Fläche/i);
  });

  it("Flaeche keine Zahl", () => {
    expect(validateRevierForm({ ...valid, flaecheHektar: "abc" })).toMatch(/Fläche/i);
  });
});

describe("computeProgress", () => {
  it("startet bei 0% auf 'revier'", () => {
    expect(computeProgress("revier")).toBe(0);
  });

  it("steigt linear", () => {
    expect(computeProgress("einrichtung")).toBe(33);
    expect(computeProgress("einladung")).toBe(67);
  });

  it("endet bei 100% auf 'fertig'", () => {
    expect(computeProgress("fertig")).toBe(100);
  });
});
