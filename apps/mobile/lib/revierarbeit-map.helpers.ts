import type {
  ReviermeldungKategorie,
  ReviermeldungStatus,
  RevierResourceType
} from "@hege/domain";
import type { EntityPin } from "../components/entity-map";
import type { ReviermeldungListItem } from "./api";

export const REVIERMELDUNG_CATEGORY_LABELS: Record<ReviermeldungKategorie, string> = {
  schaden: "Schaden",
  gefahr: "Gefahr",
  sichtung: "Sichtung",
  reviereinrichtung: "Einrichtung",
  fuetterung: "Fütterung",
  wasserung: "Wässerung",
  sonstiges: "Sonstiges"
};

export const REVIERMELDUNG_STATUS_LABELS: Record<ReviermeldungStatus, string> = {
  neu: "Neu",
  geprueft: "Geprüft",
  in_bearbeitung: "In Bearbeitung",
  erledigt: "Erledigt",
  verworfen: "Verworfen",
  archiviert: "Archiviert"
};

export function buildReviermeldungPins(
  meldungen: ReadonlyArray<ReviermeldungListItem>
): EntityPin[] {
  return meldungen.flatMap((meldung) => {
    if (!meldung.location) {
      return [];
    }

    return [
      {
        id: meldung.id,
        kind: "reviermeldung",
        location: meldung.location,
        title: meldung.title,
        subtitle: formatReviermeldungPinSubtitle(meldung)
      }
    ];
  });
}

export function formatReviermeldungPinSubtitle(meldung: ReviermeldungListItem): string {
  return `${formatReviermeldungCategoryLabel(meldung.category)} · ${formatReviermeldungStatusLabel(meldung.status)}`;
}

export function formatReviermeldungCategoryLabel(value: ReviermeldungKategorie): string {
  return REVIERMELDUNG_CATEGORY_LABELS[value] ?? value;
}

export function formatReviermeldungStatusLabel(value: ReviermeldungStatus): string {
  return REVIERMELDUNG_STATUS_LABELS[value] ?? value;
}

export function formatRevierResourceTypeLabel(value: RevierResourceType): string {
  switch (value) {
    case "reviermeldung":
      return "Reviermeldung";
    case "reviereinrichtung":
      return "Reviereinrichtung";
    case "fallwild_vorgang":
      return "Fallwild";
    case "sitzung":
      return "Sitzung";
    case "beschluss":
      return "Beschluss";
    default:
      return value;
  }
}
