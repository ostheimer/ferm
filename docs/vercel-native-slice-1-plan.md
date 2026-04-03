# Plan: Vercel-native Slice 1

**Generated**: 2026-04-03
**Estimated Complexity**: Medium

## Overview

Dieser erste Slice validiert die Vercel-native Zielarchitektur mit dem kleinsten sinnvollen Vertikalschnitt:

- API-Endpunkte laufen in `apps/web` als Next.js Route Handler
- Persistenz läuft gegen Neon PostgreSQL
- `Ansitze` wird als erstes echtes Fachmodul von Demo-Daten auf HTTP + Datenbank umgestellt
- manuelle Aktualisierung ersetzt Realtime und Socket.IO in v1

Das Dashboard bleibt bewusst aus Slice 1 heraus. Es aggregiert aktuell `Ansitze`, `Fallwild`, `Reviereinrichtungen`, `Sitzungen` und `Notifications` und würde den ersten Umbau unnötig groß machen.

## Assumptions

- `v1` benötigt keine WebSocket-Echtzeitaktualisierung
- `apps/api` bleibt während Slice 1 als Referenz bestehen, wird aber nicht weiter ausgebaut
- für Slice 1 reicht ein einfacher serverseitiger Benutzer-/Revier-Kontext für lokale Entwicklung und Preview; vollständige Login- und Refresh-Mechanik folgt in einem späteren Slice
- Uploads nach `R2` sind nicht Teil von Slice 1

## Prerequisites

- Vercel-Projekt für `apps/web`
- Production-Domain `https://hege.app`
- Neon-Projekt mit Development-Branch
- `.env`-Strategie für `Local`, `Preview` und `Production`
- Entscheidung für den DB-Zugriff in `apps/web`

Empfehlung:

- `Drizzle ORM` für Schema und Migrationen
- `@neondatabase/serverless` für Vercel-native Verbindungen

## Slice-Ziel

Am Ende von Slice 1 soll Folgendes funktionieren:

- `GET /api/v1/me`
- `GET /api/v1/ansitze`
- `GET /api/v1/ansitze/live`
- `POST /api/v1/ansitze`
- `PATCH /api/v1/ansitze/:id/beenden`
- Web-Ansitzseite liest aus der Datenbank statt aus `demoData`
- Mobile-Ansitzscreen lädt aktive Ansitze per HTTP und aktualisiert manuell

## Sprint 1: Foundation und Read Path

**Goal**: Vercel-native Serverstruktur, DB-Anbindung und lesender Ansitz-Pfad stehen stabil.

**Demo/Validation**:

- `pnpm install`
- `pnpm --filter @hege/web typecheck`
- `pnpm --filter @hege/web dev`
- Browser: Ansitzseite zeigt Daten aus Neon
- API: `GET /api/v1/me` und `GET /api/v1/ansitze/live` liefern JSON

### Task 1.1: Architekturpfad dokumentieren

- **Location**:
  - `docs/architektur.md`
  - `docs/api-v1.md`
  - `docs/roadmap-v1.md`
- **Description**:
  - `Vercel + Neon + R2 + optional Cloudflare DNS/CDN` als Zielpfad dokumentieren
  - `Socket.IO` aus `v1` entfernen oder klar als später/optional markieren
  - `Ansitze` als ersten Vercel-native Slice festhalten
- **Dependencies**: none
- **Acceptance Criteria**:
  - Architektur- und API-Doku widersprechen sich nicht mehr
  - Realtime ist für `v1` nicht mehr implizite Pflicht
- **Validation**:
  - Doku-Review gegen bestehende Repo-Regeln

### Task 1.2: Server-Schicht in `apps/web` anlegen

- **Location**:
  - `apps/web/src/server/env.ts`
  - `apps/web/src/server/http/responses.ts`
  - `apps/web/src/server/auth/context.ts`
  - `apps/web/src/server/modules/ansitze/`
- **Description**:
  - interne Server-Struktur anlegen, damit Fachlogik nicht in `route.ts` landet
  - wiederverwendbare Antwort- und Fehlerhelfer definieren
  - einfachen Request-Kontext für Benutzer, Membership und Revier vorbereiten
- **Dependencies**: Task 1.1
- **Acceptance Criteria**:
  - Route Handler können gemeinsame Server-Utilities importieren
  - keine Fachlogik liegt direkt in Next.js UI-Komponenten
- **Validation**:
  - Typecheck erfolgreich

### Task 1.3: DB-Zugriff und Migrationen einführen

- **Location**:
  - `apps/web/package.json`
  - `apps/web/drizzle.config.ts`
  - `apps/web/src/server/db/client.ts`
  - `apps/web/src/server/db/schema/`
  - `.env.example`
- **Description**:
  - Neon-Verbindung in `apps/web` aufbauen
  - Migrationstooling und Schema-Verzeichnis einführen
  - für Slice 1 nur die Tabellen anlegen, die wirklich gebraucht werden:
    - `users`
    - `reviere`
    - `memberships`
    - `ansitz_sessions`
- **Dependencies**: Task 1.2
- **Acceptance Criteria**:
  - Migration erzeugt lauffähiges Minimalkschema
  - lokale Entwicklung kann gegen Neon oder lokales Postgres starten
- **Validation**:
  - Migration lokal ausführbar
  - DB-Verbindung über einfachen Smoke-Test bestätigt

### Task 1.4: Seed- und Dev-Kontext für Slice 1 bereitstellen

- **Location**:
  - `apps/web/src/server/db/seed/`
  - `apps/web/src/server/auth/context.ts`
  - `packages/domain/src/mock-data.ts`
- **Description**:
  - Demo-Daten nicht mehr direkt in UI lesen, sondern als Seed-Quelle verwenden
  - Dev-Kontext für einen lokalen Seed-Benutzer und ein aktives Revier bereitstellen
  - `GET /api/v1/me` als erstes API-Grundcontract aufsetzen
- **Dependencies**: Task 1.3
- **Acceptance Criteria**:
  - Seed erzeugt reproduzierbare Ausgangsdaten
  - `GET /api/v1/me` liefert Benutzer, Membership und aktives Revier
- **Validation**:
  - Seed lokal ausführbar
  - Endpoint liefert konsistentes JSON

### Task 1.5: Lesende Ansitz-Endpunkte bauen

- **Location**:
  - `apps/web/src/app/api/v1/me/route.ts`
  - `apps/web/src/app/api/v1/ansitze/route.ts`
  - `apps/web/src/app/api/v1/ansitze/live/route.ts`
  - `apps/web/src/server/modules/ansitze/repository.ts`
  - `apps/web/src/server/modules/ansitze/service.ts`
- **Description**:
  - `GET /me`, `GET /ansitze` und `GET /ansitze/live` implementieren
  - Antwortform möglichst nahe an den bestehenden Domain-Typen halten
  - Revier-Scope serverseitig erzwingen
- **Dependencies**: Task 1.4
- **Acceptance Criteria**:
  - Endpunkte liefern nur Ansitze des aktiven Reviers
  - aktive Ansitze sind korrekt nach Status filterbar
- **Validation**:
  - Handler-Tests oder Service-Tests
  - manuelle API-Checks im Browser oder per HTTP-Client

### Task 1.6: Web-Ansitzseite auf Serverdaten umstellen

- **Location**:
  - `apps/web/src/app/ansitze/page.tsx`
  - `apps/web/src/server/modules/ansitze/queries.ts`
- **Description**:
  - Seite nicht mehr aus `demoData` rendern
  - Server-Query direkt aus `src/server` nutzen statt Self-Fetch gegen `/api`
  - leeren Zustand und Fehlerzustand für die Tabelle ergänzen
- **Dependencies**: Task 1.5
- **Acceptance Criteria**:
  - Ansitzseite rendert echte Neon-Daten
  - keine direkte Abhängigkeit auf `demoData` in der Seite
- **Validation**:
  - Browser-Test lokal
  - Typecheck erfolgreich

## Sprint 2: Mutation und Mobile-Verbrauch

**Goal**: Der erste schreibende Fachpfad funktioniert über Vercel-native API und wird im mobilen Client konsumiert.

**Demo/Validation**:

- Ansitz im Web oder per HTTP starten
- `GET /api/v1/ansitze/live` zeigt neuen Eintrag
- Mobile zieht die Liste per manueller Aktualisierung neu
- `PATCH /api/v1/ansitze/:id/beenden` setzt Status korrekt

### Task 2.1: Domain-Regeln in serverseitige Ansitz-Services überführen

- **Location**:
  - `apps/web/src/server/modules/ansitze/service.ts`
  - `packages/domain/src/rules.ts`
- **Description**:
  - bestehende Regeln wie Konfliktprüfung und Statuswechsel wiederverwenden
  - Fachlogik aus `packages/domain` importieren oder schrittweise in servergeeignete Services kapseln
- **Dependencies**: Task 1.5
- **Acceptance Criteria**:
  - Konflikte werden serverseitig berechnet
  - Statuswechsel hängt nicht an Clientlogik
- **Validation**:
  - Unit-Tests für Konfliktfälle und Beenden eines Ansitzes

### Task 2.2: Schreibende Ansitz-Endpunkte ergänzen

- **Location**:
  - `apps/web/src/app/api/v1/ansitze/route.ts`
  - `apps/web/src/app/api/v1/ansitze/[id]/beenden/route.ts`
  - `apps/web/src/server/modules/ansitze/schemas.ts`
- **Description**:
  - `POST /ansitze` und `PATCH /ansitze/:id/beenden` implementieren
  - Payload-Validierung ergänzen
  - konsistente Fehlerantworten für ungültigen Revier-Kontext und fachliche Fehler liefern
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Ansitz kann gestartet und beendet werden
  - Konflikte und Validierungsfehler werden sauber zurückgegeben
- **Validation**:
  - Handler-Tests
  - manueller End-to-End-Check lokal

### Task 2.3: Web-Ansitzseite um manuelle Aktualisierung erweitern

- **Location**:
  - `apps/web/src/app/ansitze/page.tsx`
  - neue Client-Komponente unter `apps/web/src/components/`
- **Description**:
  - Refresh-Aktion für die Seite ergänzen
  - optional einfaches Start/Beenden-UI nur dann einbauen, wenn der Scope klein bleibt
  - ansonsten Mutation zunächst über API und Testclient absichern
- **Dependencies**: Task 2.2
- **Acceptance Criteria**:
  - Benutzer kann die Liste ohne Seitenneuladen aktualisieren
  - UI bleibt ohne Realtime konsistent
- **Validation**:
  - Browser-Test Desktop
  - Browser-Test Mobile-Breakpoint

### Task 2.4: Mobile-Ansitzscreen an die HTTP-API anbinden

- **Location**:
  - `apps/mobile/app/(tabs)/ansitze.tsx`
  - `apps/mobile/lib/api.ts`
  - `apps/mobile/app.json`
- **Description**:
  - API-Basis-URL konfigurierbar machen
  - aktive Ansitze per `GET /api/v1/ansitze/live` laden
  - Pull-to-Refresh oder expliziten Refresh-Button ergänzen
- **Dependencies**: Task 1.5
- **Acceptance Criteria**:
  - Mobile liest keine Demo-Daten mehr für den Ansitzscreen
  - manuelle Aktualisierung lädt aktuelle Serverdaten
- **Validation**:
  - Expo-Test auf lokalem Gerät oder Simulator
  - API-Fehlerzustand sichtbar

### Task 2.5: Regressionstests und Testfall-Dokumentation ergänzen

- **Location**:
  - `apps/web/src/server/modules/ansitze/service.test.ts`
  - `apps/web/src/app/api/v1/ansitze/route.test.ts`
  - `TESTCASES.md`
- **Description**:
  - Regressionstests für Konfliktprüfung, Listenfilter und Beenden ergänzen
  - da noch kein `TESTCASES.md` existiert, eine minimal nutzbare Datei anlegen
- **Dependencies**: Task 2.2
- **Acceptance Criteria**:
  - kritische Ansitz-Regeln sind automatisiert abgesichert
  - manueller Testablauf ist dokumentiert
- **Validation**:
  - `pnpm test`
  - Review von `TESTCASES.md`

## Suggested Commit Sequence

1. `docs: align architecture for vercel-native v1`
2. `chore(web): add server scaffolding and env contract`
3. `feat(web): add neon schema and migrations for ansitz slice`
4. `feat(web): add me and ansitze read endpoints`
5. `feat(web): switch ansitze page to server data`
6. `feat(web): add ansitze mutation endpoints`
7. `feat(mobile): load ansitze from api with manual refresh`
8. `test: cover ansitze service and route handlers`

## Testing Strategy

- Unit-Tests für serverseitige Ansitz-Logik
- Handler-Tests für API-Verträge
- lokaler Browser-Test für `Ansitze`
- lokaler Mobile-Test für manuelle Aktualisierung
- kein Slice gilt als abgeschlossen, bevor Web und Mobile einmal manuell geprüft wurden

## Potential Risks & Gotchas

- Das Dashboard ist für Slice 1 zu breit und sollte nicht mitgezogen werden
- Vercel-Funktionen sind zustandslos; jeder Rest von In-Memory-Store muss aus produktiven Pfaden verschwinden
- Server Components sollten nicht per HTTP auf die eigene `/api`-Route fetchen, sondern interne Server-Queries verwenden
- Mobile braucht eine saubere Konfiguration der API-Basis-URL für Local, Preview und Production
- Auth darf nicht halb fertig in alle Module streuen; für Slice 1 nur einen klar abgegrenzten Dev-Kontext bauen
- Geodaten können für Slice 1 als Lat/Lng-Felder starten; PostGIS-Geometrien können im nächsten DB-Slice ergänzt werden

## Rollback Plan

- `apps/api` bleibt während Slice 1 unverändert als Referenz erhalten
- neue API-Pfade werden additiv in `apps/web` eingeführt
- die Web-Ansitzseite kann bei Bedarf kurzfristig auf Demo-Daten zurückgestellt werden, solange der Cutover nicht deployed ist
- mobile API-Nutzung erst aktivieren, wenn die lesenden Endpunkte lokal stabil laufen
