# Architektur

## Zielarchitektur

`hege` ist als mandantenfaehige SaaS fuer Jagdgesellschaften und Reviere in Oesterreich geplant. Ein `Revier` ist der fachliche Tenant. Benutzer koennen mehreren Revieren mit unterschiedlichen Rollen zugeordnet sein.

Die Plattform besteht aus drei Hauptanwendungen:

- `apps/web`: internes Backoffice fuer Schriftfuehrer und Revier-Admins
- `apps/mobile`: mobile App fuer Jaeger im Feld
- `apps/api`: bestehende Uebergangs-API fuer das Demo-Geruest und die schrittweise Migration

Das Shared Package `packages/domain` enthaelt gemeinsame Typen, Statuswerte, Demo-Daten und Fachregeln.

## Monorepo-Struktur

```text
apps/
  web/
  mobile/
  api/
packages/
  domain/
docs/
```

## Technischer Zielstack

### Backend

- Next.js Route Handler in `apps/web` als Zielpfad fuer v1
- PostgreSQL mit PostGIS fuer Reviergrenzen, Standorte und Ereignisse
- Cloudflare R2 ueber S3-kompatible API fuer Fotos, Anhaenge und PDF-Dokumente
- Cloudflare DNS fuer `hege.app`
- optionale manuelle Aktualisierung oder leichtes Polling statt verpflichtender WebSockets in v1
- Job-Queue fuer Push, Bildverarbeitung, PDF-Generierung und Offline-Nachverarbeitung

### Web

- Next.js App Router
- internes Backoffice, keine oeffentliche Marketing-Seite
- Fokus auf Sitzungen, Protokolle, Freigaben und Revierueberblick

### Mobile

- Expo / React Native
- Fokus auf Ansitz, Fallwild, Reviereinrichtungen und Protokolle
- Offline-Faehigkeit fuer Kernablaeufe

## Sprache und Lokalisierung

- v1 verwendet Deutsch fuer Oesterreich (`de-AT`) als einzige verpflichtende Produktsprache
- sichtbare Texte in Web und Mobile werden zentral strukturierbar gehalten, damit zusaetzliche Sprachen spaeter ergaenzt werden koennen
- API-Codes, Statuswerte und fachliche Schluessel bleiben sprachneutral, damit Uebersetzungen nicht mit Persistenz oder Integrationen vermischt werden
- Englisch (`en`) ist erst die bevorzugte erste Zweitsprache nach v1, nicht Bestandteil der initialen Auslieferung

## Mandanten- und Rollenmodell

### Tenant

- `Revier` ist die oberste fachliche Einheit
- alle fachlichen Ressourcen haengen an `revier_id`
- jede Anfrage wird auf einen Revier-Kontext eingeschraenkt

### Rollen

- `Platform Admin`
- `Revier Admin`
- `Schriftfuehrer`
- `Jaeger`

### Grundregel

- `Schriftfuehrer` und `Revier Admin` arbeiten primaer im Web
- `Jaeger` arbeitet primaer mobil
- `Revier Admin` darf zusaetzlich Freigaben und Verwaltungsaktionen ausfuehren

## Domaenenmodule

### Ansitz

- aktive Ansitze
- Konfliktpruefung bei Doppelbelegung
- aktueller Status im Revier mit manueller Aktualisierung

### Reviereinrichtungen

- Hochstaende, Fuetterungen, Salzlecken, Kirrungen und weitere Einrichtungstypen
- Zustand, Kontrollen und Wartung

### Fallwild

- strukturierte Erfassung von KFZ-Wild
- Fotos, Standort, Wildart, Geschlecht, Status
- Exportierbarkeit fuer interne oder externe Weitergabe

### Sitzungen und Protokolle

- Sitzungsstammdaten
- Teilnehmer
- Protokollversionen
- Beschluesse
- Freigabe und Veroeffentlichung

## Datenhaltung

### Aktueller Stand

- `apps/api` verwendet derzeit einen In-Memory-Demo-Store
- `apps/web` besitzt bereits eine Drizzle-/Neon-Grundlage fuer `users`, `reviere`, `memberships` und `ansitz_sessions`
- lokale Migrationen und Seed-Skripte liegen unter `apps/web/drizzle*` und `apps/web/src/server/db`
- lokale Infrastruktur fuer PostgreSQL/PostGIS und MinIO ist vorbereitet

### Zielzustand

- persistente Tabellen fuer Benutzer, Reviere, Mitgliedschaften und Geraete
- persistente Tabellen fuer Ansitze, Fallwild, Reviereinrichtungen und Protokolle
- getrennte Asset-Verwaltung fuer Fotos und Dokumente
- Audit-Log fuer sensible Aktionen

## Echtzeit und Offline

### Echtzeit

- v1 benoetigt keine verpflichtende Echtzeitverbindung
- aktive Ansitze werden per manueller Aktualisierung oder leichtem Polling nachgeladen
- Push-Benachrichtigungen informieren ueber relevante Ereignisse

### Offline

- Mobile-App speichert Kernaktionen lokal
- Operationen erhalten clientseitige IDs
- Synchronisierung erfolgt bei Rueckkehr der Verbindung
- Medien-Upload wird getrennt von Fachdaten behandelt

## Sicherheit und Betrieb

- Production unter `https://hege.app`
- Hosting in der EU
- Web und API v1 auf Vercel
- Datenbank auf Neon in EU-Region
- DNS ueber Cloudflare
- DSGVO-konforme Datenspeicherung
- serverseitige Rollen- und Tenant-Pruefung auf jeder fachlichen Ressource
- Audit-Log fuer Freigaben, Exporte, Loeschungen und sensible Aenderungen
- Monitoring, strukturierte Logs und Healthchecks in der produktiven Stufe

### Environment-Matrix

`hege` nutzt drei Vercel-Umgebungen, aber nur zwei dauerhafte Neon-Zielzweige:

- `Local`: lokales Next.js plus lokales Docker-Postgres oder alternativ gepullte Vercel-Development-Variablen
- `Preview`: Vercel Preview Deployments fuer Branches und Pull Requests
- `Production`: produktive Vercel-Deployments auf `main`

Die Datenbankzuordnung ist bewusst so geschnitten:

- `Vercel Development` -> `Neon development`
- `Vercel Preview` -> `Neon development`
- `Vercel Production` -> `Neon main`

Damit gibt es genau zwei dauerhafte Neon-Datenbankumgebungen:

- `development`: gemeinsame Vorproduktionsdatenbank fuer lokale Arbeit und Preview-Deployments
- `main`: isolierte Produktionsdatenbank

Wichtig: Fuer dieses Projekt wird bewusst keine automatische `branch-per-preview`-Strategie verwendet. Preview-Deployments teilen sich denselben Neon-Zweig `development`, damit Betriebsmodell, Kosten und Datenhaltung einfach bleiben.

### Verbindliche Variablen

Fuer den Laufzeitpfad in `apps/web` und die Datenmigrationen gelten diese Regeln:

- `DATABASE_URL`: gepoolte Verbindungszeichenkette fuer die App-Laufzeit
- `DATABASE_URL_UNPOOLED`: direkte Verbindungszeichenkette fuer Migrationen, Seeds und Admin-Tools
- `HEGE_USE_DEMO_STORE`: nur fuer Local oder fruehe Preview-Fallbacks, nicht fuer die produktive Zielarchitektur
- `NEXT_PUBLIC_APP_URL`: oeffentliche App-URL je Umgebung
- `EXPO_PUBLIC_API_BASE_URL`: API-Basis fuer die Mobile-App

Lokales Docker-Postgres bleibt ein rein lokaler Arbeitsmodus. Es ersetzt die Neon-Struktur nicht, sondern erlaubt schnelles lokales Arbeiten ohne Cloud-Abhaengigkeit.

## Aktueller Repository-Stand

- gemeinsames Domain-Modell vorhanden
- API-Endpunkte fuer die Kernmodule in `apps/api` vorhanden
- erster Vercel-native Read-Pfad fuer `me` und `ansitze` in `apps/web` vorhanden
- Web- und Mobile-UIs als sichtbares Grundgeruest vorhanden
- Domain- und Env-Grundlage fuer `hege.app` vorhanden
- produktive Persistenz, Authentifizierung und Rechtepruefung noch offen

## Naechste technische Ausbaustufe

1. schreibende Ansitz-Endpunkte in `apps/web` ergaenzen
2. Datenbank-Slice auf weitere Module erweitern
3. Authentifizierung und Rollenmodell serverseitig aktivieren
4. Demo-Store durch persistente Services ersetzen
5. Uploads, PDFs und Benachrichtigungen produktionsreif machen
6. Kartenintegration mit echten Bibliotheken ergaenzen
