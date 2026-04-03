# ferm

Reviermanagement-Plattform für Jagdgesellschaften in Österreich. Das Repository enthält ein Monorepo mit:

- `apps/api`: NestJS-API mit REST-Endpunkten und WebSocket-Gateway für Live-Ansitze
- `apps/web`: Next.js-Backoffice für Admins und Schriftführung
- `apps/mobile`: Expo-Mobile-App für Jäger im Feld
- `packages/domain`: gemeinsames Domain-Modell, Demo-Daten und Fachregeln

## Stand

Die erste Implementierung liefert ein funktionsfähiges Grundgerüst mit gemeinsamen Typen, Demo-Daten, API-Ressourcen und UI-Screens für:

- Ansitz bekanntgeben
- Reviereinrichtungen verwalten
- Fallwild dokumentieren
- Sitzungsprotokolle bereitstellen

Die API arbeitet aktuell bewusst mit einem In-Memory-Demo-Store. PostgreSQL/PostGIS und S3-kompatibler Storage sind für die nächste Ausbaustufe vorbereitet.

## Schnellstart

```bash
pnpm install
docker compose up -d
pnpm --filter @ferm/api dev
pnpm --filter @ferm/web dev
pnpm --filter @ferm/mobile dev
```

Wichtige URLs:

- Web-Backoffice: `http://localhost:3000`
- API: `http://localhost:4000/api`
- Swagger/OpenAPI: `http://localhost:4000/api/docs`
- MinIO-Konsole: `http://localhost:9001`

## Workspace-Befehle

```bash
pnpm build
pnpm test
pnpm typecheck
```

## Nächste Ausbauschritte

- Persistenz des Demo-Stores in PostgreSQL/PostGIS überführen
- Authentifizierung, Mandantentrennung und Rechteprüfung serverseitig durchziehen
- Medien-Upload, PDF-Erzeugung und Push-Notifications produktionsreif machen
- Karten auf MapLibre-Web und mobile Kartenbibliothek umstellen
- Offline-Synchronisierung von der Demo-Queue auf echte Delta-Synchronisierung erweitern

## Dokumentation

- [Architektur- und Produktplan](./docs/reviermanagement-plan.md)
