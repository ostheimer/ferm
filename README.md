# hege

Reviermanagement-Plattform fuer Jagdgesellschaften in Oesterreich. Das Repository enthaelt ein Monorepo mit:

- `apps/api`: bestehende Uebergangs-API fuer die aktuelle Demo- und Migrationsphase
- `apps/web`: Next.js-Backoffice fuer Admins und Schriftfuehrung
- `apps/mobile`: Expo-Mobile-App fuer Jaeger im Feld
- `packages/domain`: gemeinsames Domain-Modell, Demo-Daten und Fachregeln

## Stand

Die erste Implementierung liefert ein funktionsfaehiges Grundgeruest mit gemeinsamen Typen, Demo-Daten, API-Ressourcen und UI-Screens fuer:

- Ansitz bekanntgeben
- Reviereinrichtungen verwalten
- Fallwild dokumentieren
- Sitzungsprotokolle bereitstellen

Die bestehende NestJS-API arbeitet weiterhin mit einem In-Memory-Demo-Store. Parallel dazu ist in `apps/web` jetzt der erste `vercel-native` Datenbank-Slice angelegt:

- Drizzle-Konfiguration und Migrationen fuer `users`, `reviere`, `memberships` und `ansitz_sessions`
- Route Handler fuer `GET /api/v1/me`, `GET /api/v1/ansitze`, `GET /api/v1/ansitze/live`, `POST /api/v1/ansitze` und `PATCH /api/v1/ansitze/:id/beenden`
- Seed-Skript auf Basis der bestehenden Demo-Daten
- Demo-Fallback fuer lokale Read-Tests, solange keine DB aktiv ist
- Web-Ansitzseite mit Starten, Beenden und manuellem Refresh gegen den neuen API-Pfad

## Zielbetrieb

- Production-Domain: `https://hege.app`
- Web-Hosting: Vercel
- API-Zielpfad: Vercel-native Route Handler unter `https://hege.app/api/v1`
- Datenbank: Neon PostgreSQL/PostGIS
- Storage: Cloudflare R2 ueber S3-kompatible Schnittstelle
- DNS: Cloudflare

Environment-Matrix:

- `Vercel Development` -> `Neon development`
- `Vercel Preview` -> `Neon development`
- `Vercel Production` -> `Neon main`

Preview-Deployments bekommen dabei bewusst keinen eigenen Neon-Branch pro Deployment. `Development` und `Preview` teilen sich denselben Neon-Zweig `development`.

Kartenfunktionen werden im ganzen Produkt auf Google Maps ausgerichtet. Karten-UI, Marker, Standortsuche und spaetere Geocoding-Schritte sollen deshalb direkt auf Google-Maps-kompatible Integrationen zielen.

`apps/api` bleibt vorerst als Referenz und Uebergangspfad im Repository, ist aber nicht die langfristige Zielarchitektur.

## Schnellstart

Kopiere zuerst die Umgebungsvariablen: `.env.example` nach `.env` (unter Windows PowerShell: `Copy-Item .env.example .env`).

Fuer den neuen lokalen Web/API-Slice:

```bash
pnpm install
docker compose up -d postgres
pnpm --filter @hege/web db:migrate
pnpm --filter @hege/web db:seed
pnpm --filter @hege/web dev
pnpm --filter @hege/mobile dev
```

Fuer den bisherigen NestJS-Uebergangspfad:

```bash
pnpm --filter @hege/api dev
```

Wichtige URLs:

- Web-Backoffice: `http://localhost:3000`
- Vercel-native API-Slice: `http://localhost:3000/api/v1`
- Demo-API: `http://localhost:4000/api`
- Swagger/OpenAPI: `http://localhost:4000/api/docs`
- MinIO-Konsole: `http://localhost:9001`

Wichtige Env-Variablen:

- `NEXT_PUBLIC_APP_URL` fuer kanonische Web-URLs
- `NEXT_PUBLIC_API_BASE_URL` fuer Web-Aufrufe gegen die aktuelle API-Basis
- `EXPO_PUBLIC_API_BASE_URL` fuer die Mobile-App gegen den Vercel-native Slice
- `DATABASE_URL` und `DATABASE_URL_UNPOOLED` fuer Neon oder lokales Postgres
- `DEV_*` fuer den lokalen Dev-Kontext in `apps/web`
- `HEGE_USE_DEMO_STORE=true` als read-only Fallback ohne laufende DB
- `S3_*` fuer lokales MinIO und spaeter R2

## Workspace-Befehle

```bash
pnpm build
pnpm test
pnpm typecheck
```

## Naechste Ausbauschritte

- Dashboard- und Fallwild-Slices weiter von Demo-Daten auf echte API und Persistenz umstellen
- Persistenz des Demo-Stores fuer weitere Module in PostgreSQL/PostGIS ueberfuehren
- Authentifizierung, Mandantentrennung und Rechtepruefung serverseitig durchziehen
- Medien-Upload, PDF-Erzeugung und Push-Notifications produktionsreif machen
- Karten auf Google Maps fuer Web und Mobile ausrichten
- Offline-Synchronisierung von der Demo-Queue auf echte Delta-Synchronisierung erweitern

## Dokumentation

- [Dokumentationsuebersicht](./docs/README.md)
- [Gesamtplan](./docs/reviermanagement-plan.md)
- [Architektur](./docs/architektur.md)
- [Backend v1 fuer Schriftfuehrer](./docs/backend-schriftfuehrer-v1.md)
- [Mobile App v1 fuer Jaeger](./docs/mobile-jaeger-v1.md)
- [API v1](./docs/api-v1.md)
- [Roadmap und Sprints](./docs/roadmap-v1.md)
