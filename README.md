# hege

Reviermanagement-Plattform fuer Jagdgesellschaften in Oesterreich. Das Repository enthaelt ein Monorepo mit:

- `apps/api`: bestehende Uebergangs-API fuer die aktuelle Demo- und Migrationsphase
- `apps/web`: Next.js-Backoffice fuer Admins und Schriftfuehrung
- `apps/mobile`: Expo-Mobile-App fuer Jaeger im Feld
- `packages/domain`: gemeinsames Domain-Modell, Demo-Daten und Fachregeln

## Stand

Die erste produktive Ausbaustufe liefert jetzt gemeinsame Typen, persistente Route Handler in `apps/web` und nutzbare UI-Screens fuer:

- Ansitz bekanntgeben
- Reviereinrichtungen lesen
- Fallwild dokumentieren
- Fallwild-Fotos hochladen
- Sitzungen und Protokolle bearbeiten und lesen

Die bestehende NestJS-API bleibt als Referenzpfad im Repository. Die produktive Linie laeuft aber in `apps/web` ueber Vercel-native Route Handler und Drizzle:

- Drizzle-Konfiguration und Migrationen fuer Auth, Ansitze, Fallwild, `media_assets`, Reviereinrichtungen, Sitzungen, Protokolle, Dokumente und Notifications
- Route Handler fuer `auth`, `me`, `dashboard`, `ansitze`, `fallwild`, `reviereinrichtungen`, `protokolle`, `sitzungen` und `documents`
- Fallwild-Detail und Foto-Upload ueber `GET /api/v1/fallwild/:id` und `POST /api/v1/fallwild/:id/fotos`
- S3-kompatible Storage-Schicht fuer lokales MinIO und spaeteres Cloudflare R2 inklusive best-effort Rollback nach fehlgeschlagenem Medien-Insert
- Seed-Skript auf Basis der bestehenden Demo-Daten
- Login in Web und App ueber E-Mail oder Benutzername plus vierstellige PIN
- Demo-Fallback fuer lokale Read-Tests, solange keine DB aktiv ist
- Web-Ansitzseite mit Starten, Beenden und manuellem Refresh gegen den neuen API-Pfad
- Web-Fallwildseite mit Erfassung, CSV-Export und mobilem Layout gegen denselben API-Pfad
- Web-Dashboard, Reviereinrichtungen, Protokolle und Sitzungen gegen dieselbe Server-Schicht
- Mobile-Screens fuer Dashboard, Ansitze, Fallwild, Reviereinrichtungen und Protokolle gegen denselben API-Slice
- Mobile Fallwild-Fotoauswahl mit Queue-v2-Weitergabe, Retry-Backoff und sichtbaren Aktionen fuer problematische Uploads
- dokumentierten iPhone-/iOS-Simulator-Smoke als primären nativen Expo-Abnahmepfad
- Mobile Vitest-Abdeckung fuer Foto-Normalisierung, Foto-Limit, Submission-Fallback und Queue-Retry-Policy
- automatisierten Web-Tests mit Vitest fuer Route Handler, Services und Server-Queries
- Playwright-E2E- und Visual-Regression-Tests fuer Public Web, Auth, Ansitze, Fallwild, Sitzungen, Dashboard, Reviereinrichtungen und Protokolle auf Desktop und Mobile
- Preview-Smoke fuer Public Web, Session-Grundvertrag und die wichtigsten App-Read-Pfade
- Release-Check fuer produktive Deployments mit demselben Read-Contract gegen Production

Rollen, Aufgaben und Nachrichten werden als naechste fachliche Erweiterung geplant, mit spaeterer Anbindung an Messenger-Kanaele wie WhatsApp und Telegram.

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
docker compose up -d postgres minio
pnpm --filter @hege/web storage:init
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
pnpm test:e2e
pnpm test:e2e:update
pnpm typecheck
```

Wichtige Testwege:

- `pnpm test` fuehrt die bestehenden Unit- und Integrationstests fuer `@hege/domain` und `@hege/web` aus.
- `pnpm test:e2e` startet Playwright gegen eine isolierte lokale E2E-Datenbank und prueft Kernfluesse in der Web-App browserbasiert.
- `pnpm test:e2e:update` aktualisiert die Screenshot-Baselines fuer die visuellen Regressionstests in `apps/web/e2e/*-snapshots`.
- `pnpm --filter @hege/web smoke:preview -- <preview-url>` prueft Public Web, Auth-Login, Session-Grundvertrag, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und den PDF-Download gegen einen Preview-Deploy.
- `pnpm --filter @hege/web smoke:release -- <production-url>` prueft denselben Read-Contract gegen einen produktiven Deploy.
- `.github/workflows/preview-smoke.yml` startet denselben Smoke automatisch bei erfolgreichen Preview-Deployment-Statusmeldungen und erlaubt einen manuellen Start per `workflow_dispatch`.
- `.github/workflows/release-check.yml` startet den produktionsfaehigen Release-Check automatisch bei erfolgreichen Production-Deployment-Statusmeldungen und erlaubt ebenfalls einen manuellen Start per `workflow_dispatch`.
- Die E2E-Suite deckt aktuell Public Web, Auth, Sitzungen, Dashboard, Reviereinrichtungen, Protokolle, `/ansitze` und `/fallwild` inkl. Desktop- und Mobile-Layout ab.

## Nächste Ausbauschritte

- iPhone-/iOS-Simulator-Smoke auf dem aktuellen Medien-/Queue-v2-Pfad mit Testkonto und Test-Revier nachziehen
- Mobile-E2E-Strategie über den dokumentierten Geräte-Smoke hinaus festziehen
- produktive Abnahme mit blockierendem Release-Check weiter beobachten
- PDF-Erzeugung weiter härten
- Android-Emulator-Smoke optional als Zweitpfad vorbereiten
- Reviermeldungen und Aufgaben v1 als nächsten fachlichen Codeblock schneiden
- Karten auf Google Maps fuer Web und Mobile ausrichten
- Rollen-, Aufgaben- und Nachrichtenmodell fachlich weiter ausarbeiten

## Dokumentation

- [Dokumentationsuebersicht](./docs/README.md)
- [Gesamtplan](./docs/reviermanagement-plan.md)
- [Architektur](./docs/architektur.md)
- [Backend v1 fuer Schriftfuehrer](./docs/backend-schriftfuehrer-v1.md)
- [Mobile App v1 fuer Jaeger](./docs/mobile-jaeger-v1.md)
- [API v1](./docs/api-v1.md)
- [Roadmap und Sprints](./docs/roadmap-v1.md)
- [iOS-Smoke-Runbook](./docs/mobile-smoke-ios.md)
- [Android-Smoke-Runbook](./docs/mobile-smoke-android.md)
- [Google-Maps-Ausrichtung](./docs/maps-google-v1.md)
- [Rollen, Aufgaben und Nachrichten v1](./docs/rollen-aufgaben-nachrichten-v1.md)
- [Reviermeldungen und Aufgaben v1](./docs/reviermeldungen-aufgaben-v1-plan.md)
