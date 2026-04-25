# Reviermeldungen und Aufgaben v1

## Ziel

Dieser Plan schneidet den nächsten fachlichen Codeblock nach Medien-/Queue-v2. Ziel ist ein kleiner, produktnaher Einstieg in Reviermeldungen und Aufgaben, ohne Nachrichten, Veranstaltungen, WhatsApp oder Google-Maps-SDK in denselben Sprint zu ziehen.

Reviermeldungen sind strukturierte Hinweise aus dem Feld. Aufgaben sind daraus oder manuell erzeugte Arbeitseinheiten im Revier. Beide Ressourcen bleiben pro `revier_id` getrennt und nutzen die bestehende Membership- und Rollenbasis.

## Scope

- Reviermeldungen mit Kategorie, Status, Kurztext, optionalem Standort, optionalen Fotos und Ersteller speichern
- Aufgaben mit Titel, Beschreibung, Status, Priorität, Fälligkeit und Verantwortlichen speichern
- Aufgaben optional aus einer Reviermeldung erzeugen
- Listen und Detailansichten in Web und Mobile lesbar machen
- Mobile-Erfassung für Reviermeldungen als erstes Feld-Feature vorbereiten
- Rechteprüfung auf bestehende Revier-Mitgliedschaft und einfache Rollenentscheidung stützen

## Nicht im Scope

- generischer Chat oder vollständiges Nachrichtenmodul
- Veranstaltungen
- WhatsApp-, Telegram- oder Push-Auslieferung
- Google-Maps-SDK-Integration
- komplexe wiederkehrende Aufgaben
- vollständige Offline-Synchronisierung für Aufgaben
- automatische Workflows oder Eskalationen

## Fachlicher Zuschnitt

### Reviermeldungen

Kategorien:

- `fuetterung`
- `wasserung`
- `reviereinrichtung`
- `schaden`
- `gefahr`
- `sichtung`
- `sonstiges`

Status:

- `neu`
- `geprueft`
- `in_bearbeitung`
- `erledigt`
- `verworfen`
- `archiviert`

Pflichtfelder:

- Kategorie
- Kurztext
- Zeitpunkt
- Revier
- Ersteller

Optionale Felder:

- Standort als Lat/Lng
- Bezug zu `reviereinrichtung`
- Fotos über `media_assets`
- interne Notiz

### Aufgaben

Status:

- `offen`
- `angenommen`
- `in_arbeit`
- `blockiert`
- `erledigt`
- `abgelehnt`
- `archiviert`

Priorität:

- `niedrig`
- `normal`
- `hoch`
- `dringend`

Pflichtfelder:

- Titel
- Revier
- Ersteller
- Status

Optionale Felder:

- Beschreibung
- Verantwortliche Mitgliedschaften
- Fälligkeitsdatum
- Bezug zu `reviermeldung`, `reviereinrichtung`, `fallwild_vorgang`, `sitzung` oder `beschluss`
- Abschlussnotiz

## API-Plan

Erster API-Slice:

- `GET /api/v1/reviermeldungen`
- `POST /api/v1/reviermeldungen`
- `GET /api/v1/reviermeldungen/:id`
- `PATCH /api/v1/reviermeldungen/:id`
- `GET /api/v1/aufgaben`
- `POST /api/v1/aufgaben`
- `GET /api/v1/aufgaben/:id`
- `PATCH /api/v1/aufgaben/:id`

Fehlervertrag:

- `401` ohne gültige Session
- `403` ohne Revier-Mitgliedschaft oder fehlende Rolle
- `404` bei fremdem oder fehlendem Objekt
- `422` bei fachlich ungültigen Feldern
- `500` bei unerwartetem Serverfehler ohne Detail-Leak

## Datenmodell-Plan

Neue Tabellen:

- `reviermeldungen`
- `aufgaben`
- `aufgabe_assignees`

Wiederverwendung:

- `media_assets` für Fotos
- `memberships` für Ersteller und Verantwortliche
- `reviere` für Reviertrennung
- `audit_logs` später für Status- und Verantwortlichkeitsänderungen

Minimalfelder `reviermeldungen`:

- `id`
- `revier_id`
- `created_by_membership_id`
- `category`
- `status`
- `occurred_at`
- `title`
- `description`
- `latitude`
- `longitude`
- `related_type`
- `related_id`
- `created_at`
- `updated_at`

Minimalfelder `aufgaben`:

- `id`
- `revier_id`
- `created_by_membership_id`
- `source_type`
- `source_id`
- `title`
- `description`
- `status`
- `priority`
- `due_at`
- `completed_at`
- `completion_note`
- `created_at`
- `updated_at`

## Web-Schnitt

Erster sichtbarer Web-Slice:

- Liste `Reviermeldungen` mit Kategorie, Status, Zeitpunkt und Ersteller
- Detailseite mit Fotos, Standortdaten als Text und Aufgabenbezug
- Aktion `Aufgabe erstellen` aus einer Reviermeldung
- Aufgabenliste mit Status, Priorität, Fälligkeit und Verantwortlichen
- einfache Statusänderung für berechtigte Rollen

## Mobile-Schnitt

Erster sichtbarer Mobile-Slice:

- Dashboard-Hinweis auf eigene offene Aufgaben
- Reviermeldung erfassen mit Kategorie, Kurztext, optionalem Foto und optionaler Position
- eigene Aufgaben lesen und Status ändern
- keine neue komplexe Offline-Engine; Reviermeldungen können später an Queue v2 angeschlossen werden

## Rechte und Sichtbarkeit

Startregel für v1:

- Revier Admins sehen und ändern alle Reviermeldungen und Aufgaben ihres Reviers.
- Schriftführer sehen Reviermeldungen und Aufgaben, die Sitzungen, Beschlüsse oder Protokolle betreffen.
- Jäger sehen Reviermeldungen mit Revier-Sichtbarkeit und Aufgaben, die ihnen zugeordnet sind.
- Ersteller sehen ihre eigenen Meldungen.

Diese Regeln reichen für den ersten Slice. Feingranulare Empfängergruppen folgen im späteren Nachrichten-/Rollenblock.

## Implementierungsreihenfolge

1. Domain-Typen und Validierung für Reviermeldungen und Aufgaben ergänzen.
2. Drizzle-Schema und Migrationen für `reviermeldungen`, `aufgaben` und `aufgabe_assignees` anlegen.
3. Web-Servermodule mit Revier-Scope, Rollenprüfung und API-Contract-Tests bauen.
4. Web-Listen und einfache Detail-/Statusaktionen anschließen.
5. Mobile-Lesepfade und Reviermeldung-Erfassung ohne große E2E-Infrastruktur anschließen.
6. iPhone-Smoke um Reviermeldung-Erfassung und Aufgabenliste erweitern.

## Akzeptanzkriterien

- Reviermeldungen werden pro Revier getrennt gespeichert und gelesen.
- Ein Jäger kann eine Reviermeldung mit Kurztext und optionalem Foto anlegen.
- Ein berechtigter Nutzer kann aus einer Reviermeldung eine Aufgabe erstellen.
- Verantwortliche sehen ihre Aufgaben in Web und Mobile.
- Statusänderungen sind gegen ungültige Übergänge und fremde Reviere abgesichert.
- Bestehende Fallwild-, Medien- und Queue-v2-Pfade bleiben unverändert grün.

## Testplan

- `pnpm --filter @hege/domain build`
- `pnpm --filter @hege/web test`
- `pnpm --filter @hege/web build`
- `pnpm --filter @hege/mobile test`
- `pnpm --filter @hege/mobile typecheck`
- `pnpm --filter @hege/mobile build`
- iPhone-/iOS-Simulator-Smoke nach [iOS-Smoke-Runbook](./mobile-smoke-ios.md), erweitert um Reviermeldung und Aufgabenliste

## Anschlussentscheidungen

- Google Maps bleibt Zielrichtung für spätere Standortauswahl; v1 speichert Lat/Lng und zeigt Standort zunächst textlich oder über bestehende UI an.
- WhatsApp bleibt externer Folgekanal und wird erst nach internem Aufgaben-/Nachrichtenmodell betrachtet.
- Veranstaltungen folgen erst, wenn Aufgaben und Empfängergruppen stabil sind.
