# Roadmap

Diese Datei ist der schlanke Einstiegspunkt im Repo-Root. Die vollstaendige Roadmap liegt in [docs/roadmap-v1.md](./docs/roadmap-v1.md).

## Aktueller Status

- `Sprint 0` ist technisch abgeschlossen: Auth, Revier-Scope, Rollenpruefung, Drizzle-Schema, Seeds und produktive Route Handler laufen in `apps/web`.
- `Sprint 1` ist weit fortgeschritten: Dashboard, Reviereinrichtungen, Protokolle, Sitzungen, Freigabe/PDF-Basis und die erste Web-E2E-Strecke sind umgesetzt.
- `Sprint 1.5` ist in Härtung: Public Landing, Pricing-CTAs, Auth-Redirects und der erste Setup-/`/app`-Einstieg werden mit Tests und Smoke abgesichert.
- `Sprint 2` und `Sprint 3` sind bereits angebrochen: Mobile Login, Dashboard, Ansitz- und Fallwild-Formulare, Read-Slices und Offline-Queue stehen; Fallwild-Fotos, Queue v2 und Android-Smokes sind der aktuelle Ausbaublock.

## Aktueller Fokus

1. Web-Haertung mit Playwright fuer Dashboard, Reviereinrichtungen, Protokolle und Dokument-Download
2. Public-Web-Block mit Login-, Registrierungs- und Setup-Redirects
3. Fallwild-Detail und Foto-Upload ueber S3-kompatibles Storage
4. Mobile Queue v2 mit separaten Foto-Uploads, Retry- und Konfliktstatus
5. Preview-Smoke und Android-Smoke als reproduzierbare Abnahmewege
6. Danach Rollen, Aufgaben, Nachrichten und Veranstaltungen

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
