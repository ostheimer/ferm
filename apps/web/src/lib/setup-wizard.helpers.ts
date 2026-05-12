/**
 * State-Helper fuer den Setup-Wizard (P2.5 Onboarding).
 *
 * Reine Funktionen: Step-Navigation, Validierung, Final-Detection.
 * Render-State lebt im Wizard-Component.
 */

export type WizardStepKey = "revier" | "einrichtung" | "einladung" | "fertig";

export const WIZARD_STEPS: ReadonlyArray<WizardStepKey> = [
  "revier",
  "einrichtung",
  "einladung",
  "fertig"
];

export interface WizardStepMeta {
  key: WizardStepKey;
  label: string;
  /** Pflicht-Step (kein Skip moeglich)? */
  required: boolean;
}

export const WIZARD_STEP_META: Record<WizardStepKey, WizardStepMeta> = {
  revier: { key: "revier", label: "Revier", required: true },
  einrichtung: { key: "einrichtung", label: "Einrichtung", required: false },
  einladung: { key: "einladung", label: "Einladung", required: false },
  fertig: { key: "fertig", label: "Fertig", required: false }
};

export function getStepIndex(step: WizardStepKey): number {
  const index = WIZARD_STEPS.indexOf(step);
  return index < 0 ? 0 : index;
}

export function nextStep(step: WizardStepKey): WizardStepKey {
  const index = getStepIndex(step);
  if (index >= WIZARD_STEPS.length - 1) {
    return step;
  }
  return WIZARD_STEPS[index + 1] as WizardStepKey;
}

export function previousStep(step: WizardStepKey): WizardStepKey {
  const index = getStepIndex(step);
  if (index <= 0) {
    return step;
  }
  return WIZARD_STEPS[index - 1] as WizardStepKey;
}

export function isFinalStep(step: WizardStepKey): boolean {
  return step === "fertig";
}

export function isFirstStep(step: WizardStepKey): boolean {
  return step === "revier";
}

/**
 * Validiert die Revier-Daten aus Step 1. Liefert eine Fehlermeldung,
 * wenn etwas fehlt — sonst `null`.
 */
export interface RevierFormValues {
  revierName: string;
  bundesland: string;
  bezirk: string;
  flaecheHektar: string;
}

export function validateRevierForm(values: RevierFormValues): string | null {
  if (values.revierName.trim().length === 0) {
    return "Bitte einen Reviernamen eintragen.";
  }
  if (values.bundesland.trim().length === 0) {
    return "Bundesland fehlt.";
  }
  if (values.bezirk.trim().length === 0) {
    return "Bezirk fehlt.";
  }
  const flaeche = Number(values.flaecheHektar);
  if (Number.isNaN(flaeche) || flaeche <= 0) {
    return "Fläche muss größer als 0 Hektar sein.";
  }
  return null;
}

/**
 * Berechnet den Fortschritt in Prozent (0..100) fuer die Wizard-
 * Progress-Bar. Final-Step ist 100%, Step 1 startet bei 0%.
 */
export function computeProgress(step: WizardStepKey): number {
  const index = getStepIndex(step);
  const total = WIZARD_STEPS.length - 1;
  return Math.round((index / total) * 100);
}
