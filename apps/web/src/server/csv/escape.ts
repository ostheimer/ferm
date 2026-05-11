/**
 * CSV-Cell-Escape nach RFC 4180. Felder mit Komma, Doppelter Anfuehrungs-
 * zeichen oder Zeilenumbruch werden in `"..."` eingeschlossen, dabei
 * werden alle `"` zu `""` verdoppelt.
 *
 * Wird von allen CSV-Exporten verwendet — Fallwild, Ansitze und
 * Reviereinrichtungen (W3). Vorher dupliziert in jedem Modul; jetzt
 * zentral, damit eine Verhaltensaenderung an einer Stelle reicht.
 */
export function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}

/**
 * Baut eine ganze CSV aus einer Header-Zeile und Datenzeilen. Cell-Werte
 * koennen `null`/`undefined` sein und werden zu Leerstring.
 */
export function buildCsv(
  header: ReadonlyArray<string>,
  rows: ReadonlyArray<ReadonlyArray<string | number | null | undefined>>
): string {
  const lines = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map((cell) => escapeCsvCell(cell == null ? "" : String(cell))).join(","))
  ];

  return lines.join("\n");
}
