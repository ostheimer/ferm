/**
 * Generische Such- und Filter-Helpers fuer Web-Listen (Fallwild,
 * Sitzungen, Mitglieder, ...).
 *
 * Pattern bewusst flach gehalten: jede Liste definiert eine Funktion
 * `toHaystack(entry) -> string`, die alle suchbaren Felder zu einem
 * kleinbuchstabigen String zusammenfuegt. Die Such-Funktion tokenisiert
 * die Eingabe und prueft AND-Semantik (alle Tokens muessen vorkommen).
 */

export function tokenizeSearch(raw: string): string[] {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Wendet eine Volltext-Suche auf eine Liste an. Die `toHaystack`-Funktion
 * wird pro Eintrag aufgerufen und liefert den durchsuchbaren Text.
 * Whitespace wird normalisiert.
 */
export function filterBySearch<T>(
  entries: ReadonlyArray<T>,
  search: string,
  toHaystack: (entry: T) => string
): T[] {
  const tokens = tokenizeSearch(search);

  if (tokens.length === 0) {
    return [...entries];
  }

  return entries.filter((entry) => {
    const haystack = toHaystack(entry).toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}

/**
 * Hilfsfunktion: gibt true zurueck, wenn der Such-Term Token enthaelt.
 * Wird vom UI genutzt, um "Suche zuruecksetzen"-Affordances anzuzeigen.
 */
export function hasActiveSearch(search: string): boolean {
  return tokenizeSearch(search).length > 0;
}
