const LEGACY_VISIBLE_TEXT_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ["Oberoesterreich", "Oberösterreich"],
  ["Voecklabruck", "Vöcklabruck"],
  ["Winterfuetterung", "Winterfütterung"],
  ["Fruehjahrsbesprechung", "Frühjahrsbesprechung"],
  ["Fruehjahrsputz", "Frühjahrsputz"],
  ["Fruehansitz", "Frühansitz"],
  ["Protokoll veroeffentlicht", "Protokoll veröffentlicht"],
  ["veroeffentlicht", "veröffentlicht"],
  ["Fuetterung", "Fütterung"],
  ["fuetterung", "fütterung"],
  ["Forststrasse", "Forststraße"],
  ["Strasse", "Straße"],
  ["Nachfuellung", "Nachfüllung"],
  ["Begruessung", "Begrüßung"],
  ["Hochstaende", "Hochstände"],
  ["Leiterstaende", "Leiterstände"],
  ["Beschluesse", "Beschlüsse"],
  ["abschliessen", "abschließen"],
  ["Rueckblick", "Rückblick"],
  ["Maerz", "März"],
  ["fuer", "für"]
];

export function normalizeDeAtVisibleText<T extends string | null | undefined>(value: T): T {
  if (typeof value !== "string") {
    return value;
  }

  let normalized: string = value;

  for (const [legacy, replacement] of LEGACY_VISIBLE_TEXT_REPLACEMENTS) {
    normalized = normalized.split(legacy).join(replacement);
  }

  return normalized as T;
}
