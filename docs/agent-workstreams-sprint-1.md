# Agent-Workstreams Sprint 1

## Ziel

Dieses Dokument schneidet den aktuellen Sprint-1-Restblock so, dass mehrere Agents parallel an Web-Haertung, Medienbasis und Mobile-Queue arbeiten koennen, ohne sich an gemeinsamen Hotspots gegenseitig zu blockieren.

Sprint 1 setzt voraus, dass Sprint 0 einen stabilen `Foundation Freeze` geliefert hat. Dieser Zustand ist erreicht.

## Voraussetzungen

Vor diesen Workstreams muessen stabil vorliegen:

- Login, Session-Verhalten und Revier-Scope
- Rollenpruefung in `apps/web`
- Dashboard-, Protokoll-, Sitzungs- und Dokument-Basisvertraege
- Drizzle-Schema, Seeds und E2E-Infrastruktur

## Single-Writer-Zonen

Diese Bereiche sollten nur von einem Agent gleichzeitig veraendert werden:

- `apps/web/src/server/env.ts`
- `apps/web/src/server/storage`
- `apps/web/src/server/db/schema.ts`, Migrationen und Seeds
- `apps/mobile/lib/api.ts`
- `apps/mobile/lib/offline-queue.ts`
- globale Web-Shell oder Navigation

## Workstream A: Web-Haertung und Preview-Smoke

### Ziel

Das Web ist fuer Dashboard, Reviereinrichtungen, Protokolle und Dokument-Downloads reproduzierbar abgesichert.

### Ownership

- `apps/web/e2e`
- `apps/web/scripts`
- Testdoku fuer Web und Preview

### Aufgaben

- Playwright fuer `/`, `/reviereinrichtungen`, `/protokolle` und `/protokolle/:id`
- Dokument-Download inklusive Dateiname absichern
- `smoke:preview` fuer Login, `me`, Dashboard, Reviereinrichtungen, Protokolle und Sitzungen

### Darf nicht aendern

- Storage- oder Queue-Fachlogik
- globale Mobile-Utilities

## Workstream B: Fallwild-Medien-API

### Ziel

Fallwild-Detail und Foto-Upload laufen produktiv ueber die Web-Server-Schicht.

### Ownership

- `apps/web/src/app/api/v1/fallwild`
- `apps/web/src/server/modules/fallwild`
- `apps/web/src/server/storage`

### Aufgaben

- `GET /api/v1/fallwild/:id`
- `POST /api/v1/fallwild/:id/fotos`
- `media_assets` auf `PhotoAsset` mappen
- S3-kompatiblen Upload fuer MinIO lokal und R2 in Preview/Production verwenden

### Blockiert andere Workstreams bis

- Upload-Vertrag und Fehlerfaelle dokumentiert sind
- `media_assets`-Schema und Seed stabil sind

## Workstream C: Mobile Queue v2

### Ziel

Die App verarbeitet Fachdaten und Foto-Uploads als getrennte Queue-Operationen mit sichtbaren Status.

### Ownership

- `apps/mobile/lib/offline-queue.ts`
- Queue-Darstellung im Dashboard

### Aufgaben

- neue Operation `fallwild-photo-upload`
- Status `pending`, `syncing`, `uploading`, `failed`, `conflict`
- Create-zu-Upload-Kette fuer Offline-Fallwild
- Verwerfen fuer `failed` und `conflict`

### Darf nicht aendern

- Fotoauswahl-UI im Fallwild-Tab
- Server-Storage oder Route Handler

## Workstream D: Mobile Fallwild-Foto-Flow

### Ziel

Fallwild kann online und offline mit bis zu drei Bibliotheksfotos erfasst werden.

### Ownership

- `apps/mobile/app/(tabs)/fallwild.tsx`
- `apps/mobile/lib/api.ts`
- Mobile-Paketabhaengigkeiten

### Aufgaben

- `expo-image-picker` fuer Bibliotheksauswahl integrieren
- lokale Vorschau und Entfernen vor dem Submit
- Online-Create gefolgt von sequentiellen Uploads
- verbleibende Fotos bei recoverable errors an die Queue uebergeben

### Darf nicht aendern

- Queue-Core ausserhalb der abgesprochenen API

## Workstream E: Android-Smoke und Testbarkeit

### Ziel

Die Mobile-Abnahme ist auf Windows mit Android-Emulator oder Geraet reproduzierbar dokumentiert.

### Ownership

- `apps/mobile/scripts`
- `TESTCASES.md`
- stabile `testID`- und `accessibilityLabel`-Oberflaechen

### Aufgaben

- Smoke-Skript fuer Android-Emulator oder Geraet
- Testbild zur Laufzeit erzeugen und auf das Geraet schieben
- Login, Dashboard, Fallwild mit Foto, Offline-Sync und Ansitz als nativen Check beschreiben

## Empfohlene Parallelisierung

### Phase 0

- Main Agent zieht Schema, Seeds, Storage-Env und Root-Doku auf denselben Stand

### Phase 1

- Workstream A und B starten sofort
- Workstream E friert Testbarkeit und Android-Smoke ein

### Phase 2

- nach Upload- und Fehler-Freeze starten Workstream C und D parallel

## Gemeinsame Checkpoints

### Checkpoint 1: Medien-Freeze

Pflicht:

- `media_assets`-Schema und Seed stabil
- Fallwild-Detail und Foto-Upload dokumentiert
- Storage fuer Local und Preview geklaert

### Checkpoint 2: Queue-Freeze

Pflicht:

- Offline-Create erzeugt bei Bedarf nachgelagerte Foto-Upload-Eintraege
- Queue-Status und Verwerf-Flow sind sichtbar

### Checkpoint 3: Sprint-1/3-Abnahme

Pflicht:

- Web-E2E fuer Dashboard, Reviereinrichtungen, Protokolle und Download gruen
- Preview-Smoke gegen die PR-URL gruen
- Fallwild-Foto-Upload lokal funktional geprueft
- Android-Smoke ist dokumentiert und reproduzierbar

## Was nicht parallelisiert werden sollte

- gleichzeitige Aenderungen an `env`, Storage, Schema oder Seeds
- gleichzeitige Aenderungen an `apps/mobile/lib/api.ts` und `apps/mobile/lib/offline-queue.ts`
- gleichzeitige Aenderungen an globaler Web-Navigation und Dokument-Service

## Uebergang zum naechsten Block

Der naechste Fachblock startet erst danach:

- Rollen- und Empfaengergruppen
- Nachrichten
- Aufgaben
- Veranstaltungen
