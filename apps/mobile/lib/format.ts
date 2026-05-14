const dateTimeFormatter = new Intl.DateTimeFormat("de-AT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const timeFormatter = new Intl.DateTimeFormat("de-AT", {
  hour: "2-digit",
  minute: "2-digit"
});

export function formatDateTime(value: string) {
  const date = parseDate(value);

  return date ? dateTimeFormatter.format(date) : "Nicht verfügbar";
}

export function formatTime(value: string) {
  const date = parseDate(value);

  return date ? timeFormatter.format(date) : "Nicht verfügbar";
}

function parseDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formatiert eine API-Fehlermeldung für StateView-Descriptions: erste
 * Zeile ist die rohe Fehlermeldung mit garantiertem Satzzeichen am
 * Ende, dann eine Leerzeile, dann der Aktualisieren-Hint. Ohne das
 * Trim/Period laeuft "Network request failed" naht­los in "Tippe auf
 * …" hinein und liest sich als ein einziger Satz.
 */
export function formatApiErrorDescription(error: string): string {
  // Trailing Whitespace, Satzzeichen (.!?), Auslassungspunkte (… und ...)
  // alle abschneiden — wir normalisieren auf einen einheitlichen Punkt.
  const cleaned = error.trim().replace(/(?:\.{3}|[.!?…])+$/, "");
  return `${cleaned}.\n\nTippe auf „Aktualisieren", sobald die Verbindung wieder steht.`;
}
