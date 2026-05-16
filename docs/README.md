# Dokumentation

Diese Dokumentation beschreibt den aktuellen Stand des Repositories und den geplanten Ausbau zur ersten produktiven Version von `hege`.

## Einstieg

- [Gesamtplan](./reviermanagement-plan.md)
- [Autonomer Umsetzungsplan ab 2026-05-17](./autonomer-umsetzungsplan-2026-05.md)
- [Architektur](./architektur.md)
- [Backend v1 für Schriftführer](./backend-schriftfuehrer-v1.md)
- [Mobile App v1 für Jäger](./mobile-jaeger-v1.md)
- [API v1](./api-v1.md)
- [Roadmap und Sprints](./roadmap-v1.md)
- [iOS-Smoke-Runbook](./mobile-smoke-ios.md)
- [Android-Smoke-Runbook](./mobile-smoke-android.md)
- [Google-Maps-Ausrichtung](./maps-google-v1.md)
- [GIP-Straßenkilometer v1](./gip-strassenkilometer-v1.md)
- [Passkeys und Face ID v1](./passkeys-faceid-v1.md)
- [Rollen, Aufgaben und Nachrichten v1](./rollen-aufgaben-nachrichten-v1.md)
- [Reviermeldungen und Aufgaben v1](./reviermeldungen-aufgaben-v1-plan.md)
- [UI-Audit 2026-05-07](./ui-audit-2026-05-07.md)
- [Design-System v1](./design-system-v1.md)
- [UX-Roadmap v2](./ux-roadmap-v2.md)
- [Test-Accounts und Rollen-Übersicht](./test-accounts.md)
- [Umsetzungsbacklog](./umsetzungsbacklog.md)
- [Sprint 0 Backlog](./sprint-0-backlog.md)
- [Sprint 1 Backlog](./sprint-1-backlog.md)
- [Agent-Workstreams Sprint 0](./agent-workstreams-sprint-0.md)
- [Agent-Workstreams Sprint 1](./agent-workstreams-sprint-1.md)

## Lesereihenfolge

1. Gesamtplan für Produktziel und fachlichen Zuschnitt
2. Architektur für Systemgrenzen, Infrastruktur und technische Leitplanken
3. Backend v1 und Mobile App v1 für die sichtbaren ersten Produktversionen
4. API v1 für Ressourcen und Schnittstellen
5. Roadmap für die konkrete Umsetzung in Stufen
6. Umsetzungsbacklog und Sprint-Details für direkte Ticketplanung
7. Agent-Workstreams für sichere Parallelisierung mehrerer Implementierer

## Aktueller Implementierungsstand

Das Repository enthält bereits ein produktiv orientiertes Monorepo mit:

- Next.js-Backoffice in `apps/web` inklusive produktivem API-Slice über Route Handler und Drizzle
- Expo-Mobile-App mit Login, lokalem Face-ID-/Geräte-Entsperren, Dashboard, Ansitz, Fallwild, Reviereinrichtungen und Protokollen gegen denselben API-Slice
- Shared Domain Package für Typen, Demo-Daten und Fachregeln
- Route Handler für `auth`, `me`, `dashboard`, `ansitze`, `fallwild`, `reviereinrichtungen`, `protokolle`, `sitzungen`, `documents`, `geo` und `contact-lists`
- Kontaktlisten in Web und Mobile: automatische Mitgliederliste aus registrierten Reviermitgliedern, frei pflegbare Listen für Reviernachbarn, Weidkameraden, Notrufnummern und weitere Kontakte
- Fallwild-Detail, Foto-Upload und S3-kompatible Storage-Schicht für MinIO lokal und R2 inklusive best-effort Rollback bei Medien-Insert-Fehlern
- Fallwild-Standort v1 über `POST /api/v1/geo/fallwild-location`, Mobile-GPS, serverseitige Google-Adressauflösung, GIP-Index-/Endpoint-Resolver, Mock-Provider für Gänserndorf-Testdaten und gespeicherte Standort-/Straßenkilometer-Metadaten
- Mobile Offline-Queue v2 für Ansitz und Fallwild inklusive separater Foto-Upload-Operationen, Retry-Backoff, Konfliktstatus, manuellem Retry und Verwerfen problematischer Einträge
- Mobile Vitest-Abdeckung für Foto-Normalisierung, Foto-Limit, Submission-Fallback, Standortauflösung und Queue-Retry-Policy
- automatisierten Web-Tests mit Vitest für Route Handler, Services und Queries
- Playwright-E2E- und Visual-Regression-Tests für Public Web, Auth, Ansitze, Fallwild, Dashboard, Reviereinrichtungen, Protokolle und Sitzungen auf Desktop und Mobile
- Preview-Smoke für Public Web, Session-Grundvertrag und die wichtigsten App-Read-Pfade
- Release-Check für produktive Deployments mit separatem Workflow bei erfolgreichen Production-Deployments und manuellem `workflow_dispatch`
- neues `hege`-Logo in Web und iOS-App; Landing, Login, Registrierung und Setup-Flow sind auf `https://hege.app` visuell geprüft
- lokales Face-ID-/Touch-ID-Entsperren gespeicherter Mobile-Sessions; der iPhone-Flow wurde am 2026-05-06 auf dem angeschlossenen Gerät bestätigt
- abgeschlossener iPhone-/iOS-Simulator-Smoke als primärer nativer Expo-Abnahmepfad; der Lauf vom 2026-04-26 bestätigt Queue-v2-Fehleranzeigen, R2-Storage ist in Production aktiv und ein direkter Fallwild-Foto-Upload gegen `hege.app` ist verifiziert
- `apps/api` bleibt als Referenz- und Übergangspfad im Repository
- Rollen, Aufgaben, Kontakte und Nachrichten werden als nächste Planungsstufe vorbereitet, inklusive späterer WhatsApp-/Telegram-Kanäle

Kartenfunktionen werden projektweit auf Google Maps ausgerichtet; das stabile Ziel ist [Google-Maps-Ausrichtung](./maps-google-v1.md).

Die fachliche Dokumentation beschreibt bereits die nächste Ausbaustufe mit echter Persistenz, Authentifizierung, Rollenprüfung und produktionsreifen Workflows.

Der aktuelle Entwicklungsfokus liegt auf dem iPhone-/iOS-Geräte-Smoke mit erfolgreichem Foto-Upload, Fallwild-Standortauflösung, leerer Queue und den neuen Kontaktlisten. Google Reverse Geocoding ist für Preview/Production vorbereitet; GIP-Straßenkilometer können über einen HTTP-Resolver, einen kompakten OGD-BEPU-JSON-Index oder den gebündelten regionalen Gänserndorf-Index angebunden werden. Danach folgen Mobile-E2E-Strategie und der weitere Ausbau von Reviermeldungen/Aufgaben.

Für den aktuellen Status sind [ROADMAP.md](../ROADMAP.md), [Roadmap v1](./roadmap-v1.md) und [TODO.md](../TODO.md) maßgeblich. Die Sprint-0/1-Backlogs und Agent-Workstreams bleiben als Planungsartefakte der zuletzt geschnittenen Arbeitsblöcke erhalten.

## Pflegehinweis

Wenn sich der tatsaechliche Projektstatus aendert, sollten diese Dokumente gemeinsam aktualisiert werden:

- [ROADMAP.md](../ROADMAP.md)
- [docs/README.md](./README.md)
- [docs/reviermanagement-plan.md](./reviermanagement-plan.md)
