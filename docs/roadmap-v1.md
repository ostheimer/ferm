# Roadmap v1

## Ziel

Diese Roadmap beschreibt die Ausbaustufen vom Repository-Grundgeruest zur ersten produktiven Version fuer Schriftfuehrer und Jaeger.

## Aktueller Status

- `Sprint 0` ist abgeschlossen. Auth, Session, Revier-Scope, Rollenpruefung, Drizzle-Migrationen, Seeds und produktive Route Handler liegen in `apps/web`.
- `Sprint 1` ist in Abschluss-Haertung. Dashboard, Reviereinrichtungen, Protokolle, Sitzungen, Freigabe/PDF-Basis, Preview-Smoke und blockierender Release-Check fuer Production sind umgesetzt; offen sind vor allem Doku und manuelle Abnahme.
- `Sprint 1.5` ist weit fortgeschritten. Public Landing, Auth-Redirects und Registrierungsfluss sind browserseitig abgesichert; der Preview-Smoke deckt inzwischen Einstieg, Session-Grundvertrag und zentrale App-Read-Pfade ab.
- `Sprint 2` ist teilweise umgesetzt. Mobile Login, Session-Restore, Dashboard, Ansitz- und Fallwild-Formulare, Reviereinrichtungen und Protokolle lesen bereits dieselbe API.
- `Sprint 3` ist aktiv. Fallwild anlegen, exportieren und offline vormerken funktioniert schon; Foto-Upload, Medien-Storage und Queue v2 sind der aktuelle Ausbau.

## Sprint 0: Fundament

Status: abgeschlossen

Geliefert:

- PostgreSQL/PostGIS ueber Drizzle an `apps/web` angebunden
- Authentifizierung, Refresh und `GET /api/v1/me`
- aktiver Revier-Kontext und serverseitige Rollenpruefung
- Seed-Daten fuer lokales Entwicklungsrevier
- produktive Route Handler fuer Dashboard, Ansitze, Fallwild, Reviereinrichtungen, Protokolle und Sitzungen
- Dokument- und PDF-Download-Basis

Ergebnis:

- persistente API-Basis mit echten Benutzern, Revieren und Mitgliedschaften

## Sprint 1: Schriftfuehrer-Backend

Status: in Abschluss-Haertung

Geliefert:

- Dashboard mit offenen Entwuerfen und Revierlage
- Sitzungsliste und Sitzungsdetail
- Protokollversionen, Freigabe-Flow und PDF-Grundlage
- Protokoll-Leseansicht und Dokument-Download
- Web-E2E fuer Public Web, Auth, Rollen, Sitzungen, Dashboard, Reviereinrichtungen, Protokolle und Dokument-Download
- Preview-Smoke fuer Public Web, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download
- GitHub-Workflow fuer den Preview-Smoke bei erfolgreichen Preview-Deployments und manuellen `workflow_dispatch`
- Release-Check fuer produktive Deployments mit separatem Workflow bei erfolgreichen Production-Deployments und manuellem `workflow_dispatch`

Restblock:

- Dokumentation und manuelle Abnahme auf denselben Stand bringen

Ergebnis:

- Sitzungen koennen von der Anlage bis zur Veroeffentlichung durchlaufen werden, der Restfokus liegt auf Haertung und Regressionen

## Sprint 1.5: Public Web und Onboarding

Status: in Härtung

Geliefert:

- Public Landing auf `/` mit Pricing und Produktfokus
- Pricing-CTAs auf `/login` und `/registrieren`
- Login-Redirect auf `/app`
- Setup- und Post-Auth-Redirects ueber die Server-Guards
- Playwright fuer Public Landing, Login-Redirect, Guard-Redirects und den Registrierungsfluss
- Preview-Smoke fuer Public Landing, Login, Registrierung, `POST /api/v1/auth/login`, `GET /api/v1/me`, den authentifizierten Redirect von `/login` sowie die zentralen App-Read-Pfade

Restblock:

- Setup-Abschluss in den reproduzierbaren Preview-/CI-Abnahmerahmen ziehen
- Registrierungs- und App-Redirects in die finale Dokumentation und manuelle Browser-Abnahme ziehen

Ergebnis:

- neue Nutzer sehen zuerst die oeffentliche Produktseite und steigen danach kontrolliert in den App-Block ein

## Sprint 2: Jaeger-App Kern

Status: teilweise umgesetzt

Geliefert:

- Login und Session-Restore
- Heute-im-Revier-Screen mit Queue-Anzeige
- Ansitz-Formular mit Queue-Fallback
- Fallwild-Formular mit Queue-Fallback
- freigegebene Protokolle und Reviereinrichtungen lesend in der App

Restblock:

- nativer iPhone-/iOS-Simulator-Smoke als kanonischer Geraetetest fuer den aktuellen Mac-Workflow
- Android-Emulator-Smoke optional als Zweitpfad fuer spaetere Plattformabdeckung

Ergebnis:

- Jaeger sehen die Lage im Revier und koennen Ansitze sowie Fallwild bereits mobil erfassen

## Sprint 3: Fallwild und Medien

Status: aktiv

Lieferumfang dieses Blocks:

- `GET /api/v1/fallwild/:id`
- `POST /api/v1/fallwild/:id/fotos`
- S3-kompatible Storage-Schicht fuer MinIO lokal und R2 in Preview/Production
- `media_assets` als generische Medienbasis
- Queue v2 mit separaten Foto-Uploads, Retry und Konfliktstatus
- Fotoauswahl aus der Bibliothek in der App

Ergebnis:

- Fallwild kann draussen erfasst, mit Fotos vorgemerkt und spaeter synchronisiert werden

## Sprint 4: Reviereinrichtungen und Haertung

Status: geplant

Lieferumfang:

- Reviereinrichtungen lesend und spaeter mit Kontrollhinweisen in der App
- Audit-Log, Monitoring und Logging
- Fehlerbehandlung, Rechtepruefung und Abnahmeverfahren komplett

Ergebnis:

- stabile v1 mit klaren Kernablaeufen fuer Schriftfuehrer und Jaeger

## Ausbaustufe nach v1: Kommunikation, Aufgaben und Veranstaltungen

Ziel: interne Zusammenarbeit und Feldrueckmeldungen strukturiert in `hege` abbilden

Lieferumfang:

- flexible Rollen- und Empfaengergruppen fuer Sichtbarkeit und Kommunikation
- Reviermeldungen aus dem Feld zu Fuetterungen, Wasserungen und Hochstaenden mit Fotos und Kurztext
- Aufgaben aus Protokollen, Beschluessen oder manueller Planung
- Aufgabenlisten und Kalenderansicht pro Benutzer in der mobilen App
- Veranstaltungen mit Ankuendigung, Treffpunkt, Erinnerungen und optionaler Teilnahmebestaetigung
- WhatsApp- und spaeter Telegram-Anstoss aus der App heraus mit vorbereitetem Nachrichtentext
- auditierbare Zuordnung zwischen interner Nachricht, Aufgabe, Veranstaltung und externem Messenger-Anstoss

Ergebnis:

- Kommunikation, Organisation und Feldrueckmeldungen laufen nachvollziehbar ueber `hege`

## Querschnittsthemen

### Qualitaet

- API-Contract-Tests starteten in Sprint 0 und werden in Sprint 1/3 weitergezogen
- Web-E2E und visuelle Regressionstests sichern Desktop und Mobile-Viewport ab
- Mobile-Smokes werden zuerst auf iPhone/iOS-Simulator reproduzierbar gemacht; Android-Emulator bleibt ein optionaler Zweitpfad ohne physisches Android-Geraet
- Preview-Smoke dient als Standard-Check zwischen Local und Production

### Sprache und Lokalisierung

- v1 ist fachlich und redaktionell auf Deutsch fuer Oesterreich (`de-AT`) ausgelegt
- Web und Mobile sollen Texte so strukturieren, dass spaetere weitere Sprachen moeglich bleiben
- eine verpflichtende zweisprachige Auslieferung ist nicht Teil von v1

## Abnahmekriterien fuer v1

- Schriftfuehrer kann eine Sitzung anlegen, bearbeiten und zur Freigabe bringen
- Revier Admin kann ein Protokoll freigeben und veroeffentlichen
- Jaeger kann einen Ansitz starten und beenden
- Jaeger kann Fallwild auch mit Fotos offline erfassen und spaeter synchronisieren
- freigegebene Protokolle sind mobil lesbar
- alle Daten sind pro Revier getrennt
- kritische Aktionen sind nachvollziehbar protokolliert

## Empfohlene naechste Umsetzung

Wenn unmittelbar weiterentwickelt wird, ist die sinnvollste Reihenfolge:

1. Web-Abnahme und Dokumentation auf den tatsaechlichen Implementierungsstand ziehen
2. iPhone-/iOS-Simulator-Smoke und manuelle Device-Abnahme standardisieren
3. optionalen Android-Emulator-Smoke fuer spaetere Plattformabdeckung vorbereiten
4. danach Rollen-, Aufgaben-, Nachrichten- und Veranstaltungslogik auf die bestehende Rechtebasis setzen

## Detaillierte Sprint-Backlogs

- [Umsetzungsbacklog](./umsetzungsbacklog.md)
- [Sprint 0 Backlog](./sprint-0-backlog.md)
- [Sprint 1 Backlog](./sprint-1-backlog.md)
