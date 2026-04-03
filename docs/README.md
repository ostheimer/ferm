# Dokumentation

Diese Dokumentation beschreibt den aktuellen Stand des Repositories und den geplanten Ausbau zur ersten produktiven Version von `ferm`.

## Einstieg

- [Gesamtplan](./reviermanagement-plan.md)
- [Architektur](./architektur.md)
- [Backend v1 für Schriftführer](./backend-schriftfuehrer-v1.md)
- [Mobile App v1 für Jäger](./mobile-jaeger-v1.md)
- [API v1](./api-v1.md)
- [Roadmap und Sprints](./roadmap-v1.md)
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

Das Repository enthält bereits ein funktionierendes Monorepo-Grundgerüst mit:

- NestJS-API für Dashboard, Ansitze, Reviereinrichtungen, Fallwild und Sitzungen
- Next.js-Backoffice mit Dashboard und Fachseiten
- Expo-Mobile-App mit feldtauglichen Kernscreens
- Shared Domain Package für Typen, Demo-Daten und Fachregeln

Die fachliche Dokumentation beschreibt bereits die nächste Ausbaustufe mit echter Persistenz, Authentifizierung, Rollenprüfung und produktionsreifen Workflows.

Der aktuelle Entwicklungsfokus liegt vollständig auf `Sprint 0: Fundament`. Maßgeblich dafür sind [ROADMAP.md](../ROADMAP.md), [Roadmap v1](./roadmap-v1.md) und [Sprint 0 Backlog](./sprint-0-backlog.md).

## Pflegehinweis

Wenn sich der tatsächliche Projektstatus ändert, sollten diese Dokumente gemeinsam aktualisiert werden:

- [ROADMAP.md](../ROADMAP.md)
- [docs/README.md](./README.md)
- [docs/reviermanagement-plan.md](./reviermanagement-plan.md)
