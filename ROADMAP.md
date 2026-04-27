# Roadmap

Diese Datei ist der schlanke Einstiegspunkt im Repo-Root. Die vollstaendige Roadmap liegt in [docs/roadmap-v1.md](./docs/roadmap-v1.md).

## Aktueller Status

- `Sprint 0` ist technisch abgeschlossen: Auth, Revier-Scope, Rollenpruefung, Drizzle-Schema, Seeds und produktive Route Handler laufen in `apps/web`.
- `Sprint 1` ist in Abschluss-Haertung: Dashboard, Reviereinrichtungen, Protokolle, Sitzungen, Freigabe/PDF-Basis, Preview-Smoke und blockierender Release-Check fuer Production sind umgesetzt; offen sind vor allem manuelle Abnahme und punktuelle Doku-Pflege.
- `Sprint 1.5` ist weit fortgeschritten: Public Landing, Pricing-CTAs, Auth-Redirects und der erste Setup-/`/app`-Einstieg sind browserseitig abgesichert; der Preview-Smoke deckt inzwischen Einstieg, Session-Grundvertrag und zentrale App-Read-Pfade ab.
- `Sprint 2` und `Sprint 3` sind bereits angebrochen: Mobile Login, Dashboard, Ansitz- und Fallwild-Formulare, Read-Slices und Offline-Queue stehen; der iPhone-/iOS-Simulator-Smoke vom 2026-04-26 bestaetigt den Queue-v2-Fehlerpfad, R2-Storage ist in Production aktiv und ein direkter Fallwild-Foto-Upload gegen `hege.app` ist verifiziert.

## Aktueller Fokus

1. iPhone-/iOS-Simulator-Smoke auf dem gehaerteten Medien-/Queue-v2-Pfad mit erfolgreichem Foto-Upload und leerer Queue erneut ausfuehren
2. Mobile-E2E-Strategie ueber den dokumentierten Geraete-Smoke hinaus festziehen
3. Reviermeldungen und Aufgaben v1 als naechsten fachlichen Codeblock schneiden
4. Android-Emulator-Smoke als optionalen Zweitpfad bei Bedarf praktisch durchlaufen
5. Kartenfunktionen in Web und Mobile danach auf Google Maps ausrichten

## Detaildokumente

- [Gesamtplan](./docs/reviermanagement-plan.md)
- [Architektur](./docs/architektur.md)
- [API v1](./docs/api-v1.md)
- [Roadmap v1](./docs/roadmap-v1.md)
- [Umsetzungsbacklog](./docs/umsetzungsbacklog.md)
- [Sprint 0 Backlog](./docs/sprint-0-backlog.md)
- [Sprint 1 Backlog](./docs/sprint-1-backlog.md)
- [Agent-Workstreams Sprint 0](./docs/agent-workstreams-sprint-0.md)
- [Agent-Workstreams Sprint 1](./docs/agent-workstreams-sprint-1.md)
- [iOS-Smoke-Runbook](./docs/mobile-smoke-ios.md)
- [Android-Smoke-Runbook](./docs/mobile-smoke-android.md)
- [Google-Maps-Ausrichtung](./docs/maps-google-v1.md)
- [Rollen, Aufgaben und Nachrichten v1](./docs/rollen-aufgaben-nachrichten-v1.md)
- [Reviermeldungen und Aufgaben v1](./docs/reviermeldungen-aufgaben-v1-plan.md)
