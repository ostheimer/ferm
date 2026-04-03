# API v1

## Ziel

Die erste produktive API-Version soll Web und Mobile mit einem gemeinsamen, stabilen Fachmodell bedienen. Sie wird versioniert und strikt pro Revier gescoped.

## Grundprinzipien

- REST für Fachressourcen
- WebSockets für Live-Ansitze
- Revier-Kontext auf jeder fachlichen Ressource
- serverseitige Rollenprüfung
- OpenAPI-Dokumentation
- DTO-Validierung und konsistente Fehlerformate

## Authentifizierung und Kontext

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/me`

### Revier-Scope

- der Benutzer sieht nur Ressourcen seines Reviers
- bei Mehrfachmitgliedschaft muss der aktive Revier-Kontext gesetzt sein
- `membership_id` wird serverseitig gegen den eingeloggten Benutzer geprüft

## Ressourcen

### Dashboard

- `GET /api/v1/dashboard`

Liefert:

- aktive Ansitze
- Konflikte
- offene Wartungen
- heutige Fallwild-Vorgänge
- unveröffentlichte Protokolle
- letzte Benachrichtigungen

### Sitzungen und Protokolle

- `GET /api/v1/sitzungen`
- `POST /api/v1/sitzungen`
- `GET /api/v1/sitzungen/:id`
- `PATCH /api/v1/sitzungen/:id`
- `POST /api/v1/sitzungen/:id/versionen`
- `PATCH /api/v1/sitzungen/:id/freigeben`
- `GET /api/v1/sitzungen/:id/pdf`
- `GET /api/v1/protokolle`
- `GET /api/v1/protokolle/:id`

### Ansitze

- `GET /api/v1/ansitze`
- `GET /api/v1/ansitze/live`
- `POST /api/v1/ansitze`
- `PATCH /api/v1/ansitze/:id/beenden`

### Reviereinrichtungen

- `GET /api/v1/reviereinrichtungen`
- `GET /api/v1/reviereinrichtungen/:id`
- `POST /api/v1/reviereinrichtungen/:id/kontrollen`

### Fallwild

- `GET /api/v1/fallwild`
- `POST /api/v1/fallwild`
- `GET /api/v1/fallwild/:id`
- `POST /api/v1/fallwild/:id/fotos`
- `GET /api/v1/fallwild/export.csv`

### Dokumente und Benachrichtigungen

- `GET /api/v1/notifications`
- `GET /api/v1/documents/:id/download`

## WebSocket v1

Namespace oder Channel pro Revier:

- `ansitze.updated`

Payload:

- Revier-ID
- Liste aktiver Ansitze
- Konfliktkennzeichen

## Rollenregeln

### Schriftführer

- Sitzungen lesen und bearbeiten
- Protokollversionen erstellen
- keine Freigabe von Protokollen

### Revier Admin

- alle Rechte des Schriftführers
- Freigabe von Protokollen
- Verwaltungsrechte auf Reviereinrichtungen

### Jäger

- Ansitze lesen und eigene Ansitze ändern
- Fallwild erfassen
- Reviereinrichtungen lesen
- veröffentlichte Protokolle lesen

## Fehlerfälle

Die API muss mindestens diese Fälle sauber zurückgeben:

- ungültiger Revier-Kontext
- fehlende Rolle
- Ressource nicht gefunden
- Pflichtfelder fehlen
- Ansitz-Konfliktwarnung
- Medien-Upload fehlgeschlagen
- PDF noch nicht verfügbar

## Datenmodell v1

Kernressourcen:

- `users`
- `reviere`
- `memberships`
- `devices`
- `ansitz_sessions`
- `reviereinrichtungen`
- `reviereinrichtung_kontrollen`
- `fallwild_vorgaenge`
- `media_assets`
- `sitzungen`
- `sitzung_teilnehmer`
- `protokoll_versionen`
- `beschluesse`
- `dokumente`
- `notifications`
- `audit_logs`

## Übergang vom aktuellen Stand

Aktuell sind im Repository bereits vorhanden:

- Demo-Endpunkte unter `apps/api/src`
- WebSocket-Gateway für Ansitze
- Shared Typen und Regeln im Domain-Package

Für API v1 müssen als Nächstes folgen:

1. persistente Datenbankmodelle
2. Auth und Guards
3. DTO-Validierung
4. Upload- und Download-Strecken
5. Rollen- und Tenant-Prüfung pro Endpunkt
