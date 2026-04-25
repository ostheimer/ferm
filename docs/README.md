# Dokumentation

Diese Dokumentation beschreibt den aktuellen Stand des Repositories und den geplanten Ausbau zur ersten produktiven Version von `hege`.

## Einstieg

- [Gesamtplan](./reviermanagement-plan.md)
- [Architektur](./architektur.md)
- [Backend v1 fuer Schriftfuehrer](./backend-schriftfuehrer-v1.md)
- [Mobile App v1 fuer Jaeger](./mobile-jaeger-v1.md)
- [API v1](./api-v1.md)
- [Roadmap und Sprints](./roadmap-v1.md)
- [iOS-Smoke-Runbook](./mobile-smoke-ios.md)
- [Android-Smoke-Runbook](./mobile-smoke-android.md)
- [Google-Maps-Ausrichtung](./maps-google-v1.md)
- [Rollen, Aufgaben und Nachrichten v1](./rollen-aufgaben-nachrichten-v1.md)
- [Reviermeldungen und Aufgaben v1](./reviermeldungen-aufgaben-v1-plan.md)
- [Umsetzungsbacklog](./umsetzungsbacklog.md)
- [Sprint 0 Backlog](./sprint-0-backlog.md)
- [Sprint 1 Backlog](./sprint-1-backlog.md)
- [Agent-Workstreams Sprint 0](./agent-workstreams-sprint-0.md)
- [Agent-Workstreams Sprint 1](./agent-workstreams-sprint-1.md)

## Lesereihenfolge

1. Gesamtplan fuer Produktziel und fachlichen Zuschnitt
2. Architektur fuer Systemgrenzen, Infrastruktur und technische Leitplanken
3. Backend v1 und Mobile App v1 fuer die sichtbaren ersten Produktversionen
4. API v1 fuer Ressourcen und Schnittstellen
5. Roadmap fuer die konkrete Umsetzung in Stufen
6. Umsetzungsbacklog und Sprint-Details fuer direkte Ticketplanung
7. Agent-Workstreams fuer sichere Parallelisierung mehrerer Implementierer

## Aktueller Implementierungsstand

Das Repository enthaelt bereits ein produktiv orientiertes Monorepo mit:

- Next.js-Backoffice in `apps/web` inklusive produktivem API-Slice ueber Route Handler und Drizzle
- Expo-Mobile-App mit Login, Dashboard, Ansitz, Fallwild, Reviereinrichtungen und Protokollen gegen denselben API-Slice
- Shared Domain Package fuer Typen, Demo-Daten und Fachregeln
- Route Handler fuer `auth`, `me`, `dashboard`, `ansitze`, `fallwild`, `reviereinrichtungen`, `protokolle`, `sitzungen` und `documents`
- Fallwild-Detail, Foto-Upload und S3-kompatible Storage-Schicht fuer MinIO lokal und spaeteres R2 inklusive best-effort Rollback bei Medien-Insert-Fehlern
- Mobile Offline-Queue v2 fuer Ansitz und Fallwild inklusive separater Foto-Upload-Operationen, Retry-Backoff, Konfliktstatus, manuellem Retry und Verwerfen problematischer Eintraege
- Mobile Vitest-Abdeckung fuer Foto-Normalisierung, Foto-Limit, Submission-Fallback und Queue-Retry-Policy
- automatisierten Web-Tests mit Vitest fuer Route Handler, Services und Queries
- Playwright-E2E- und Visual-Regression-Tests fuer Public Web, Auth, Ansitze, Fallwild, Dashboard, Reviereinrichtungen, Protokolle und Sitzungen auf Desktop und Mobile
- Preview-Smoke fuer Public Web, Session-Grundvertrag und die wichtigsten App-Read-Pfade
- GitHub-Workflow fuer den Preview-Smoke bei erfolgreichen Preview-Deployments und manuellen `workflow_dispatch`
- Release-Check fuer produktive Deployments mit separatem Workflow bei erfolgreichen Production-Deployments und manuellem `workflow_dispatch`
- abgeschlossener iPhone-/iOS-Simulator-Smoke als primärer nativer Expo-Abnahmepfad; Android-Emulator bleibt als optionaler Zweitpfad möglich
- `apps/api` bleibt als Referenz- und Uebergangspfad im Repository
- Rollen, Aufgaben und Nachrichten werden als naechste Planungsstufe vorbereitet, inklusive spaeterer WhatsApp-/Telegram-Kanaele

Kartenfunktionen werden projektweit auf Google Maps ausgerichtet; das stabile Ziel ist [Google-Maps-Ausrichtung](./maps-google-v1.md).

Die fachliche Dokumentation beschreibt bereits die naechste Ausbaustufe mit echter Persistenz, Authentifizierung, Rollenpruefung und produktionsreifen Workflows.

Der aktuelle Entwicklungsfokus liegt auf der erneuten iPhone-/iOS-Simulator-Abnahme des gehaerteten Medien-/Queue-v2-Pfads, der Mobile-E2E-Strategie, dem optionalen Android-Emulator-Smoke und dem Zuschnitt von Reviermeldungen und Aufgaben v1. Google-Maps-Ausrichtung, Rollen, Nachrichten, Veranstaltungen und externe Messenger-Anstoesse bleiben vorbereitete Folgeblöcke.

Fuer den aktuellen Status sind [ROADMAP.md](../ROADMAP.md), [Roadmap v1](./roadmap-v1.md) und [TODO.md](../TODO.md) massgeblich. Die Sprint-0/1-Backlogs und Agent-Workstreams bleiben als Planungsartefakte der zuletzt geschnittenen Arbeitsbloecke erhalten.

## Pflegehinweis

Wenn sich der tatsaechliche Projektstatus aendert, sollten diese Dokumente gemeinsam aktualisiert werden:

- [ROADMAP.md](../ROADMAP.md)
- [docs/README.md](./README.md)
- [docs/reviermanagement-plan.md](./reviermanagement-plan.md)
