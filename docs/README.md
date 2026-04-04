# Dokumentation

Diese Dokumentation beschreibt den aktuellen Stand des Repositories und den geplanten Ausbau zur ersten produktiven Version von `hege`.

## Einstieg

- [Gesamtplan](./reviermanagement-plan.md)
- [Architektur](./architektur.md)
- [Backend v1 fuer Schriftfuehrer](./backend-schriftfuehrer-v1.md)
- [Mobile App v1 fuer Jaeger](./mobile-jaeger-v1.md)
- [API v1](./api-v1.md)
- [Roadmap und Sprints](./roadmap-v1.md)
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

Das Repository enthaelt bereits ein funktionierendes Monorepo-Grundgeruest mit:

- NestJS-API fuer Dashboard, Ansitze, Reviereinrichtungen, Fallwild und Sitzungen
- Next.js-Backoffice mit Dashboard und Fachseiten
- Expo-Mobile-App mit feldtauglichen Kernscreens
- Shared Domain Package fuer Typen, Demo-Daten und Fachregeln
- erstem `vercel-native` Daten-Slice in `apps/web` mit Drizzle, Migrationen und Route Handlern fuer `me`, `ansitze` und `fallwild`
- Web-Ansitzverwaltung mit Starten, Beenden und manuellem Refresh gegen die neue API
- Web-Fallwildverwaltung mit Erfassung und CSV-Export gegen dieselbe Server-Schicht
- Mobile-Fallwildliste mit echtem API-Refresh
- Mobile-Dashboard mit API-basiertem Snapshot fuer Revier- und Ansitzlage
- automatisierten Web-Tests mit Vitest fuer Route Handler, Services und Queries
- Playwright-E2E- und Visual-Regression-Tests fuer die wichtigsten Web-Use-Cases auf Desktop und Mobile
- Rollen, Aufgaben und Nachrichten werden als naechste Planungsstufe vorbereitet, inklusive spaeterer WhatsApp-/Telegram-Kanaele

Kartenfunktionen werden projektweit auf Google Maps ausgerichtet.

Die fachliche Dokumentation beschreibt bereits die naechste Ausbaustufe mit echter Persistenz, Authentifizierung, Rollenpruefung und produktionsreifen Workflows.

Der aktuelle Entwicklungsfokus liegt weiter auf `Sprint 0: Fundament`. Massgeblich dafuer sind [ROADMAP.md](../ROADMAP.md), [Roadmap v1](./roadmap-v1.md) und [Sprint 0 Backlog](./sprint-0-backlog.md).

## Pflegehinweis

Wenn sich der tatsaechliche Projektstatus aendert, sollten diese Dokumente gemeinsam aktualisiert werden:

- [ROADMAP.md](../ROADMAP.md)
- [docs/README.md](./README.md)
- [docs/reviermanagement-plan.md](./reviermanagement-plan.md)
