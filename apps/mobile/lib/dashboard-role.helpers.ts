import type { DashboardResponse, Role } from "@hege/domain";

/**
 * Rollen-spezifische Dashboard-Konfiguration fuer den Heute-Tab (P2.2).
 *
 * Idee: Jede Rolle bekommt eine eigene Headline-Card (mit handlungs-
 * orientiertem Text und optionaler CTA-Route) und eine eigene Auswahl
 * der drei wichtigsten Tiles. Der Aktivitäts-Feed bleibt rollenneutral
 * — der ist fuer alle gleich wertvoll als Newsfeed.
 */

export interface RoleHeadline {
  /** Eyebrow-Label, z.B. "Schriftfuehrung", "Mein Beitrag", "Lagebild". */
  eyebrow: string;
  /** Headline-Text, dynamisch aus Snapshot-Daten. */
  title: string;
  /** Erklaerender Satz unter dem Headline-Text. */
  subtitle: string;
  /** Optionale Primaer-Aktion (z.B. Tap auf Card -> Route). */
  cta?: { label: string; route: string };
}

export interface RoleTile {
  label: string;
  value: number | string;
  detail: string;
}

export interface RoleDashboard {
  headline: RoleHeadline;
  tiles: RoleTile[];
}

/**
 * Berechnet die Headline + die drei wichtigsten Tiles fuer die uebergebene
 * Rolle. Wenn die Rolle unbekannt ist, fallen wir auf "ausgeher" zurueck
 * (allgemeines Lagebild) — der haerteste Fallback ist der mit dem
 * geringsten Privileg-Bias.
 */
export function computeRoleDashboard(
  role: Role,
  snapshot: DashboardResponse
): RoleDashboard {
  switch (role) {
    case "schriftfuehrer":
      return buildSchriftfuehrerDashboard(snapshot);
    case "revier-admin":
    case "platform-admin":
      return buildRevierAdminDashboard(snapshot);
    case "jaeger":
      return buildJaegerDashboard(snapshot);
    case "ausgeher":
    default:
      return buildAusgeherDashboard(snapshot);
  }
}

function buildSchriftfuehrerDashboard(snapshot: DashboardResponse): RoleDashboard {
  const drafts = snapshot.overview.unveroeffentlichteProtokolle;
  const nextSitzung = snapshot.overview.naechsteSitzung;
  const tagesDelta = nextSitzung ? computeTagesDelta(nextSitzung.scheduledAt) : null;

  const headlineTitle =
    drafts > 0
      ? drafts === 1
        ? "1 Protokoll wartet auf Freigabe."
        : `${drafts} Protokolle warten auf Freigabe.`
      : nextSitzung
        ? "Sitzungs-Pipeline laeuft sauber."
        : "Keine Sitzung in Sicht.";

  const subtitle = nextSitzung
    ? tagesDelta !== null && tagesDelta >= 0
      ? `Naechste Sitzung „${nextSitzung.title}" in ${formatTagesDelta(tagesDelta)}.`
      : `Letzte Sitzung „${nextSitzung.title}" liegt zurueck — Protokoll nachziehen?`
    : "Sobald die naechste Sitzung im Kalender steht, taucht sie hier auf.";

  return {
    headline: {
      eyebrow: "Schriftfuehrung",
      title: headlineTitle,
      subtitle
    },
    tiles: [
      {
        label: "In Freigabe",
        value: drafts,
        detail: "Protokoll-Entwuerfe"
      },
      {
        label: "Naechste Sitzung",
        value: tagesDelta !== null ? formatTagesDeltaShort(tagesDelta) : "–",
        detail: nextSitzung?.title ?? "Keine Termine geplant"
      },
      {
        label: "Aufgaben",
        value: snapshot.overview.offeneAufgaben,
        detail: "Offene Arbeiten im Revier"
      }
    ]
  };
}

function buildRevierAdminDashboard(snapshot: DashboardResponse): RoleDashboard {
  const wartungen = snapshot.overview.offeneWartungen;
  const ansitze = snapshot.overview.aktiveAnsitze;
  const aufgaben = snapshot.overview.offeneAufgaben;
  const konflikt = snapshot.overview.ansitzeMitKonflikt;

  const headlineTitle =
    konflikt > 0
      ? konflikt === 1
        ? "1 Ansitz hat einen Konflikt."
        : `${konflikt} Ansitze haben Konflikte.`
      : wartungen > 0
        ? `${wartungen} offene Wartungen im Revier.`
        : "Revier ist heute ruhig.";

  const subtitle =
    konflikt > 0
      ? "Bitte kurz pruefen und klaeren — Schriftfuehrung weiss sonst nichts davon."
      : wartungen > 0
        ? 'Hochstaende und Fuetterungen warten auf Termin. Liste in „Mehr → Reviereinrichtungen".'
        : `${ansitze} aktive Ansitze, ${aufgaben} offene Aufgaben. Routine.`;

  return {
    headline: {
      eyebrow: "Revier-Admin",
      title: headlineTitle,
      subtitle
    },
    tiles: [
      {
        label: "Wartungen",
        value: wartungen,
        detail: "Offene Reviereinrichtungen"
      },
      {
        label: "Aktive Ansitze",
        value: ansitze,
        detail: konflikt > 0 ? `${konflikt} mit Konflikt` : "Aktuell im Revier"
      },
      {
        label: "Aufgaben",
        value: aufgaben,
        detail: "Aktive Revierarbeiten"
      }
    ]
  };
}

function buildJaegerDashboard(snapshot: DashboardResponse): RoleDashboard {
  const myMembershipId = snapshot.membership.id;
  const myActiveAnsitze = snapshot.activeAnsitze.filter(
    (entry) => entry.membershipId === myMembershipId
  );
  const myFallwildToday = snapshot.recentFallwild.filter(
    (entry) =>
      entry.reportedByMembershipId === myMembershipId &&
      isToday(entry.recordedAt)
  ).length;

  const headlineTitle =
    myActiveAnsitze.length > 0
      ? `Du sitzt auf „${myActiveAnsitze[0].standortName}".`
      : myFallwildToday > 0
        ? `Heute schon ${formatBeitrag(myFallwildToday)} erfasst.`
        : "Bereit fuer Revier-Einsatz.";

  const subtitle =
    myActiveAnsitze.length > 0
      ? "Beim Beenden den Ansitz im Ansitze-Tab abschliessen — auch offline moeglich."
      : 'Tipp auf „+ Erfassen" oder den Fallwild-Tab, sobald draussen etwas zu melden ist.';

  return {
    headline: {
      eyebrow: "Mein Beitrag",
      title: headlineTitle,
      subtitle
    },
    tiles: [
      {
        label: "Mein Ansitz",
        value: myActiveAnsitze.length,
        detail: myActiveAnsitze.length > 0 ? myActiveAnsitze[0].standortName : "Aktuell keiner"
      },
      {
        label: "Mein Fallwild",
        value: myFallwildToday,
        detail: "Heute erfasste Eintraege"
      },
      {
        label: "Aufgaben",
        value: snapshot.overview.offeneAufgaben,
        detail: "Im Revier offen"
      }
    ]
  };
}

function buildAusgeherDashboard(snapshot: DashboardResponse): RoleDashboard {
  const ansitze = snapshot.overview.aktiveAnsitze;
  const fallwildHeute = snapshot.overview.heutigeFallwildBergungen;
  const wartungen = snapshot.overview.offeneWartungen;

  const headlineTitle =
    ansitze > 0
      ? `${ansitze} aktive Ansitze im Revier.`
      : fallwildHeute > 0
        ? `${fallwildHeute} Fallwild-Vorgaenge heute.`
        : "Lagebild ruhig.";

  const subtitle = `Heute ${fallwildHeute} Fallwild, ${wartungen} offene Wartungen. Karte zeigt aktuelle Pins.`;

  return {
    headline: {
      eyebrow: "Lagebild",
      title: headlineTitle,
      subtitle
    },
    tiles: [
      {
        label: "Aktive Ansitze",
        value: ansitze,
        detail: "Aktuell im Revier"
      },
      {
        label: "Fallwild heute",
        value: fallwildHeute,
        detail: "Heute erfasste Eintraege"
      },
      {
        label: "Wartungen",
        value: wartungen,
        detail: "Offene Reviereinrichtungen"
      }
    ]
  };
}

/**
 * Tagesdifferenz zwischen `iso` und `now`. Positive Zahl = in der
 * Zukunft (z.B. 3 = in 3 Tagen). Negative = vergangen.
 */
function computeTagesDelta(iso: string, now: Date = new Date()): number {
  const target = new Date(iso);
  const targetDay = startOfDay(target).getTime();
  const todayDay = startOfDay(now).getTime();
  const deltaMs = targetDay - todayDay;
  return Math.round(deltaMs / 86_400_000);
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function formatTagesDelta(delta: number): string {
  if (delta === 0) return "heute";
  if (delta === 1) return "1 Tag";
  return `${delta} Tagen`;
}

function formatTagesDeltaShort(delta: number): string {
  if (delta < 0) return "–";
  if (delta === 0) return "heute";
  return `+${delta} Tage`;
}

function isToday(iso: string, now: Date = new Date()): boolean {
  const date = new Date(iso);
  return startOfDay(date).getTime() === startOfDay(now).getTime();
}

function formatBeitrag(count: number): string {
  return count === 1 ? "1 Eintrag" : `${count} Eintraege`;
}
