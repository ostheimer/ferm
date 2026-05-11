import type { FallwildVorgang, GeoPoint, Wildart } from "@hege/domain";

/**
 * Smart-Default-Berechnung fuer das Fallwild-Erfassungs-Formular (M4).
 *
 * Ziel: Beim Oeffnen des Formulars sollen Wildart und Standort
 * sinnvoll vorbelegt sein, statt einen leeren Form zu zeigen. Wir
 * leiten die Vorschlaege rein aus der bisherigen Historie ab, ohne
 * neue API-Calls — die Daten sind im Tab ohnehin schon geladen.
 */

export interface FallwildSmartDefaults {
  wildart: Wildart | undefined;
  location: GeoPoint | undefined;
  gemeinde: string | undefined;
}

/**
 * Berechnet Smart-Defaults aus einer Liste vergangener Fallwild-
 * Vorgaenge. Filterung kann optional auf die letzten N Tage und/oder
 * eine bestimmte Gemeinde eingeschraenkt werden.
 *
 * - `wildart`: haeufigste Wildart in der gefilterten Liste (Ties brechen
 *   durch zuletzt-verwendet, weil die Liste schon recordedAt-sortiert
 *   ist)
 * - `location`: die zuletzt verwendete Position (uebernimmt lat/lng vom
 *   neuesten Eintrag). Genau das, was Jaeger im Feld brauchen — sie
 *   sind oft am gleichen Hotspot.
 * - `gemeinde`: die zuletzt verwendete Gemeinde, gleichermassen.
 */
export function computeFallwildSmartDefaults(
  history: ReadonlyArray<FallwildVorgang>,
  options: { lookbackDays?: number; gemeinde?: string; now?: Date } = {}
): FallwildSmartDefaults {
  const { lookbackDays = 30, gemeinde, now = new Date() } = options;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const filtered = history
    .filter((entry) => {
      if (new Date(entry.recordedAt) < cutoff) return false;
      if (gemeinde && entry.gemeinde !== gemeinde) return false;
      return true;
    })
    .sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));

  if (filtered.length === 0) {
    // Fallback: nimm einfach den neuesten globalen Eintrag (ignorier Lookback),
    // dann hat der User wenigstens "irgendwas" zum Anpassen.
    const newest = [...history].sort((left, right) =>
      right.recordedAt.localeCompare(left.recordedAt)
    )[0];

    return {
      wildart: newest?.wildart,
      location: newest?.location,
      gemeinde: newest?.gemeinde
    };
  }

  // `filtered[0]` ist jetzt der neueste Eintrag im Lookback.
  return {
    wildart: mostFrequentWildart(filtered),
    location: filtered[0]?.location,
    gemeinde: filtered[0]?.gemeinde
  };
}

function mostFrequentWildart(entries: ReadonlyArray<FallwildVorgang>): Wildart | undefined {
  if (entries.length === 0) {
    return undefined;
  }

  const counts = new Map<Wildart, number>();
  for (const entry of entries) {
    counts.set(entry.wildart, (counts.get(entry.wildart) ?? 0) + 1);
  }

  let best: Wildart | undefined;
  let bestCount = 0;
  for (const [wildart, count] of counts.entries()) {
    if (count > bestCount) {
      best = wildart;
      bestCount = count;
    }
  }

  return best;
}
