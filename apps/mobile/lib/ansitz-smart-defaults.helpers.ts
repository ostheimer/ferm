import type { AnsitzSession, GeoPoint } from "@hege/domain";

/**
 * Smart-Default-Berechnung fuer das Ansitz-Erfassungs-Formular.
 *
 * Pendant zu `fallwild-smart-defaults.helpers.ts` (M4). Beim Oeffnen
 * der Ansitz-Form sollen Standortname und Position aus der eigenen
 * Historie vorbelegt werden — Jaeger sitzen ueblicherweise auf
 * denselben Hochstaenden, und der haeufig-gewaehlte Standort spart
 * mehrere Tipper.
 */

export interface AnsitzSmartDefaults {
  standortName: string | undefined;
  location: GeoPoint | undefined;
}

/**
 * Berechnet Smart-Defaults aus einer Liste vergangener Ansitze.
 *
 * - `standortName`: der **haeufigste** Standort in den eigenen Ansitzen
 *   der letzten Tage (per-membership-Filter optional). Ties werden
 *   durch zuletzt-verwendet gebrochen.
 * - `location`: die zuletzt verwendete Position fuer diesen
 *   Standortnamen. Wenn der Standort schon zu unterschiedlichen
 *   Positionen genutzt wurde (mobile GPS-Drift), nimmt der die
 *   Position des neuesten Eintrags.
 *
 * Fallback bei leerer Historie: gibt `undefined` zurueck, der Aufrufer
 * laesst dann die DEFAULT_FORM-Werte (Mock-Koordinaten) stehen.
 *
 * Membership-Filter (`membershipId`) ist optional: in einem Mehr-Jaeger-
 * Revier will man die eigenen Ansitze priorisieren statt das globale
 * Set. Default ist "alle Ansitze", weil das mobile Form nicht immer
 * leicht an die aktive Membership-ID kommt.
 */
export function computeAnsitzSmartDefaults(
  history: ReadonlyArray<AnsitzSession>,
  options: { lookbackDays?: number; membershipId?: string; now?: Date } = {}
): AnsitzSmartDefaults {
  const { lookbackDays = 30, membershipId, now = new Date() } = options;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const filtered = history
    .filter((entry) => {
      if (new Date(entry.startedAt) < cutoff) return false;
      if (membershipId && entry.membershipId !== membershipId) return false;
      return true;
    })
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));

  if (filtered.length === 0) {
    // Fallback: ohne Lookback-Filter nehmen wir den globalen
    // neuesten Eintrag — besser irgendetwas vorbelegen als ein leeres
    // Formular.
    const newest = [...history].sort((left, right) =>
      right.startedAt.localeCompare(left.startedAt)
    )[0];

    return {
      standortName: newest?.standortName,
      location: newest?.location
    };
  }

  const mostUsedStandort = mostFrequentStandort(filtered);
  // Position des neuesten Eintrags fuer den am haeufigsten genutzten
  // Standort. Wenn der Standortname nicht trifft (kann nicht passieren,
  // weil mostFrequentStandort aus filtered kommt), faellt es auf
  // filtered[0] zurueck.
  const matchingForLocation = filtered.find(
    (entry) => entry.standortName === mostUsedStandort
  );

  return {
    standortName: mostUsedStandort,
    location: matchingForLocation?.location ?? filtered[0]?.location
  };
}

function mostFrequentStandort(entries: ReadonlyArray<AnsitzSession>): string | undefined {
  if (entries.length === 0) {
    return undefined;
  }

  const counts = new Map<string, number>();
  for (const entry of entries) {
    counts.set(entry.standortName, (counts.get(entry.standortName) ?? 0) + 1);
  }

  let best: string | undefined;
  let bestCount = 0;
  for (const [name, count] of counts.entries()) {
    if (count > bestCount) {
      best = name;
      bestCount = count;
    }
  }

  return best;
}
