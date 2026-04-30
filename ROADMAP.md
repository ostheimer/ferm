# Roadmap

Diese Datei ist der schlanke Einstiegspunkt im Repo-Root. Die vollstaendige Roadmap liegt in [docs/roadmap-v1.md](./docs/roadmap-v1.md).

## Aktueller Status

- `Sprint 0` ist technisch abgeschlossen: Auth, Revier-Scope, Rollenpruefung, Drizzle-Schema, Seeds und produktive Route Handler laufen in `apps/web`.
- `Sprint 1` ist technisch abgeschlossen und in Stabilisierung: Dashboard, Reviereinrichtungen, Protokolle, Sitzungen, Freigabe/PDF-Basis, Preview-Smoke und blockierender Release-Check für Production sind umgesetzt.
- `Sprint 1.5` ist produktiv sichtbar: Public Landing, Pricing-CTAs, Login, Registrierung, Setup-Redirects, neues Logo und Auth-UI sind auf `https://hege.app` deployed und per Playwright auf Desktop und Mobile geprüft.
- `Sprint 2` und `Sprint 3` sind weit fortgeschritten: Mobile Login, Dashboard, Ansitz- und Fallwild-Formulare, Read-Slices, Offline-Queue v2, R2-Foto-Upload und Fallwild-Standort v1 stehen. Der iPhone-/iOS-Smoke vom 2026-04-26 bestätigt den Queue-v2-Fehlerpfad; ein direkter Production-Foto-Upload gegen `hege.app` ist verifiziert.
- Karten/Standort sind begonnen: Fallwild nutzt serverseitige Standortauflösung und speichert Standort-/Straßenkilometer-Metadaten. Der Production-Endpunkt ist erreichbar, Google Reverse Geocoding benötigt noch den Production-Server-Key; GIP bleibt die fachliche Zielquelle für österreichische Straßenkilometer.

## Aktueller Fokus

1. iPhone-/iOS-Geräte-Smoke auf Production mit Foto-Upload, automatischer Standortauflösung und leerer Queue erneut ausführen
2. `GOOGLE_MAPS_SERVER_API_KEY` für Preview/Production setzen und die Adressauflösung erneut prüfen
3. GIP-Straßenkilometer-Resolver oder OGD-Import als nächsten Standort-Härtungsblock schneiden
4. Mobile-E2E-Strategie über den dokumentierten Geräte-Smoke hinaus festziehen
5. Reviermeldungen und Aufgaben v1 als nächsten fachlichen Codeblock umsetzen
6. Android-Emulator-Smoke als optionalen Zweitpfad bei Bedarf praktisch durchlaufen

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
