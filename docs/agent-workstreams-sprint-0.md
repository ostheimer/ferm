# Agent-Workstreams Sprint 0

## Ziel

Dieses Dokument schneidet Sprint 0 so, dass mehrere Agents parallel arbeiten können, ohne sich gegenseitig permanent zu blockieren.

Der Grundsatz ist:

- ein Agent pro gemeinsamer Hotspot
- fachliche Module erst nach Foundation-Freeze
- gemeinsame Verträge werden früh eingefroren

## Voraussetzungen für parallele Arbeit

Bevor mehrere Agents unabhängig loslegen, müssen diese Entscheidungen einmalig getroffen und nicht mehr parallel verändert werden:

- ORM oder Query-Stack
- Migrationsstrategie
- Auth-Modell
- Revier-Kontext im Request
- Rollenmodell
- Basisstruktur für DTOs und Fehlerformat

Diese Entscheidungen bilden den `Foundation Freeze`.

## Single-Writer-Zonen

Diese Bereiche dürfen in Sprint 0 jeweils nur von einem Agent aktiv verändert werden:

- `packages/domain/src/types.ts`
- `apps/api/src/common`
- `apps/api/src/auth`
- DB-Schema oder ORM-Verzeichnis unter `apps/api`
- globale API-Initialisierung in `apps/api/src/main.ts`
- `.env.example`
- `docker-compose.yml`

Wenn einer dieser Bereiche geändert werden muss, ist die Ownership des zugehörigen Workstreams maßgeblich.

## Workstream A: Plattformkern

### Ziel

Die technische Grundlage für Persistenz, Auth, Revier-Scope und Rollen wird definiert und implementiert.

### Ownership

- `apps/api/src/common`
- `apps/api/src/auth`
- DB-Schema / ORM / Migrationen
- `packages/domain/src/types.ts`
- globale Konfiguration in `apps/api/src/main.ts`

### Aufgaben

- Datenzugriffstechnologie und Migrationsstruktur festlegen
- Kernschema implementieren
- Authentifizierung aufsetzen
- Revier-Kontext im Request verankern
- Rollen- und Guard-Basis implementieren
- Fehlerformat und Request-Kontext standardisieren

### Blockiert andere Workstreams bis

- Datenmodell-Grundschema steht
- Auth-Kontext verfügbar ist
- Rollen und Revier-Scope technisch lesbar sind
- DTO-Grundkonventionen feststehen

### Übergabeartefakte

- Migrationen
- dokumentierte Request-Kontext-Struktur
- dokumentierte Rollenmatrix im Code
- Basistypen im Shared Package

## Workstream B: Persistente API-Module

### Ziel

Die bestehenden Demo-Module werden auf produktive Datenzugriffe umgestellt.

### Ownership

- `apps/api/src/ansitze`
- `apps/api/src/fallwild`
- `apps/api/src/sitzungen`
- `apps/api/src/reviereinrichtungen`
- `apps/api/src/dashboard`

### Aufgaben

- DemoStore-Zugriffe ablösen
- modulare Services gegen DB aufbauen
- fachliche Lesestrecken für Dashboard, Ansitze und Sitzungen produktiv machen
- Transaktionsgrenzen je Modul sauber setzen

### Abhängigkeiten

- wartet auf `Workstream A`

### Darf nicht ändern

- Auth-Mechanik
- globales Rollenmodell
- Shared-Types ohne Abstimmung mit `Workstream A`

### Übergabeartefakte

- produktive Service-Schicht pro Modul
- DB-basierte Controller-Endpunkte
- Liste offener Vertragslücken für DTOs

## Workstream C: Storage, Seeds und lokale Entwicklung

### Ziel

Lokale Entwicklung und Medienbasis werden reproduzierbar.

### Ownership

- Seed-Verzeichnis in `apps/api`
- Storage-Adapter in dafür vorgesehenem Common- oder Infrastructure-Bereich
- Setup-Doku in `README.md`

### Aufgaben

- Demo-Daten in Seeds überführen
- Seed-Revier, Seed-Benutzer und Mitgliedschaften anlegen
- Storage-Layer für Assets vorbereiten
- lokales Setup für DB, Storage und Seeds dokumentieren

### Abhängigkeiten

- braucht Schema aus `Workstream A`
- sollte mit `Workstream B` abstimmen, welche Seed-Daten für API-Tests nötig sind

### Darf nicht ändern

- Rollen- und Authlogik
- fachliche Controller

### Übergabeartefakte

- Seed-Befehle
- reproduzierbares lokales Entwicklungsrevier
- dokumentierte Setup-Schritte

## Workstream D: API-Verträge und Contract-Tests

### Ziel

Die produktive API-Basis wird über Tests und dokumentierte Verträge abgesichert.

### Ownership

- Contract-Test-Verzeichnis unter `apps/api`
- testnahe Fixtures
- punktuelle Ergänzungen in `docs/api-v1.md`

### Aufgaben

- Contract-Tests für `auth`, `me`, `dashboard`, `ansitze`, `sitzungen`
- Rechte- und Tenant-Tests
- erwartete Fehlerformen absichern

### Abhängigkeiten

- startet leichtgewichtig mit Testgerüst parallel
- produktive Assertions erst nach `Workstream A` und relevanten Teilen von `Workstream B`

### Darf nicht ändern

- Modulimplementierungen als Nebeneffekt groß umbauen
- Schema-Grundentscheidungen

### Übergabeartefakte

- lauffähige Contract-Test-Suite
- dokumentierte Vertragsabweichungen

## Workstream E: Vorbereitende Clients und Integrationscheck

### Ziel

Web und Mobile werden so vorbereitet, dass Sprint 1 und Sprint 2 nicht bei null starten, ohne die Vertragsarbeit zu gefährden.

### Ownership

- neue API-Client-Helfer in `apps/web/src`
- neue API-Client-Helfer in `apps/mobile`
- keine freie Änderung an Fachflows

### Aufgaben

- API-Client-Grundstruktur vorbereiten
- Login- und Session-Schnittstellen konsumierbar machen
- dokumentieren, welche Antworten Web und Mobile tatsächlich brauchen

### Abhängigkeiten

- wartet auf erste Verträge aus `Workstream A`

### Darf nicht ändern

- produktive API-Endpunkte
- Domain-Hotspots
- Sprint-1-UI-Workflows vor Abschluss von Sprint 0

## Empfohlene Parallelisierung

### Phase 1

- Workstream A startet sofort
- Workstream D startet Testgerüst und Test-Utilities

### Phase 2

- nach Foundation Freeze starten Workstream B und C parallel
- Workstream E startet API-Clients auf eingefrorenen Verträgen

### Phase 3

- Workstream D zieht finale Contract- und Rechte-Tests nach
- alle Workstreams liefern an einen Integrationspunkt

## Gemeinsame Checkpoints

### Checkpoint 1: Foundation Freeze

Pflicht:

- Auth-Mechanik gewählt
- Revier-Kontext festgelegt
- Rollen festgelegt
- Schema-Grundstruktur vorhanden

### Checkpoint 2: API Freeze für Sprint 0

Pflicht:

- DTO-Grundformen stabil
- Fehlerformat stabil
- `dashboard`, `ansitze`, `sitzungen` lesbar produktiv

### Checkpoint 3: Sprint-0-Abnahme

Pflicht:

- lokale Seeds funktionieren
- Contract-Tests laufen
- DemoStore ist nicht mehr produktiver Pfad

## Was nicht parallelisiert werden sollte

- gleichzeitige Änderungen an `packages/domain/src/types.ts`
- gleichzeitige Änderungen an Auth und Rollen
- paralleles Umbauen von `apps/api/src/main.ts`
- paralleles Ändern der gleichen Controller-Datei ohne feste Ownership

## Handover zu Sprint 1

Sprint 1 darf erst starten, wenn folgende Artefakte aus Sprint 0 stabil sind:

- Auth und Session-Verhalten
- Rollenmatrix
- Revier-Kontext
- Sitzungs- und Dashboard-Verträge
- Seed-Daten für Schriftführer-Workflows
