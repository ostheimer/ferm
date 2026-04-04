import type { Sitzung } from "@hege/domain";

export function renderSitzungPdf(sitzung: Sitzung) {
  const lines = buildPdfLines(sitzung);
  const contentStream = [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    ...lines.flatMap((line, index) => [
      `${index === 0 ? "" : "0 -16 Td " }(${escapePdfText(line)}) Tj`
    ]),
    "ET"
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj",
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream\nendobj`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj"
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");

  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function buildPdfLines(sitzung: Sitzung) {
  const latestVersion = sitzung.versions[0];
  const agenda = latestVersion?.agenda ?? [];
  const beschluesse = latestVersion?.beschluesse ?? [];

  return [
    `Protokoll: ${sitzung.title}`,
    `Termin: ${formatDateTime(sitzung.scheduledAt)}`,
    `Ort: ${sitzung.locationLabel}`,
    `Status: ${sitzung.status}`,
    "",
    "Zusammenfassung",
    latestVersion?.summary ?? "Noch keine Protokollversion vorhanden.",
    "",
    "Agenda",
    ...(agenda.length > 0 ? agenda.map((entry, index) => `${index + 1}. ${entry}`) : ["Keine Agenda hinterlegt."]),
    "",
    "Beschluesse",
    ...(beschluesse.length > 0
      ? beschluesse.map((entry, index) => `${index + 1}. ${entry.title}: ${entry.decision}`)
      : ["Keine Beschluesse hinterlegt."])
  ];
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}

function escapePdfText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(/\r?\n/g, " ");
}
