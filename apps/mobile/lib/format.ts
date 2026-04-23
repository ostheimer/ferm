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
