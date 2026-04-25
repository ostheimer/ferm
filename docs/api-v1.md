# API v1

## Ziel

Die erste produktive API-Version soll Web und Mobile mit einem gemeinsamen, stabilen Fachmodell bedienen. Sie wird versioniert und strikt pro Revier gescoped.

Zielpfad fuer Production ist `https://hege.app/api/v1`.

## Grundprinzipien

- REST fuer Fachressourcen
- Vercel-native Route Handler unter `apps/web`
- Revier-Kontext auf jeder fachlichen Ressource
- serverseitige Rollenpruefung
- DTO-Validierung und konsistente Fehlerformate

## Authentifizierung und Kontext

### Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`

`POST /api/v1/auth/login` akzeptiert:

- `identifier` als E-Mail oder Benutzername
- `pin` als vierstellige Zeichenkette
- optional `membershipId`

### Revier-Scope

- der Benutzer sieht nur Ressourcen seines Reviers
- bei Mehrfachmitgliedschaft muss der aktive Revier-Kontext gesetzt sein
- `membership_id` wird serverseitig gegen den eingeloggten Benutzer geprueft

## Ressourcen

### Dashboard

- `GET /api/v1/dashboard`

Liefert:

- aktive Ansitze
- Konflikte
- offene Wartungen
- heutige Fallwild-Vorgaenge
- unveroeffentlichte Protokolle
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

#### `GET /api/v1/fallwild/:id`

Liefert einen vollstaendigen `FallwildVorgang` des aktiven Reviers inklusive `photos`.

Antwort:

- `200` mit `FallwildVorgang`
- `404` wenn der Vorgang im aktiven Revier nicht existiert
- `403` wenn die Rolle nicht lesen darf

#### `POST /api/v1/fallwild/:id/fotos`

Akzeptiert genau eine Datei pro Request als `multipart/form-data`.

Request:

- Feld `file` ist verpflichtend
- Feld `title` ist optional
- erlaubt sind `image/jpeg` und `image/png`
- maximal `10 MB` pro Datei
- maximal `3` Fotos pro Fallwild-Vorgang

Antwort:

- `201` mit `{ photo: PhotoAsset }`
- `400` fuer ungueltiges `multipart/form-data`, leere Datei oder falsche Felder
- `422` fuer Ueberschreitung des Foto-Limits oder fachlich ungueltige Uploads
- `403` fuer fehlende Rolle
- `404` fuer fehlenden oder fremden Fallwild-Vorgang
- `503` wenn Storage nicht konfiguriert ist

Rollen:

- `jaeger`
- `schriftfuehrer`
- `revier-admin`

Storage-Vertrag:

- lokal ueber MinIO mit `S3_*`-Variablen
- Preview und Production ueber dieselbe S3-kompatible Schicht gegen Cloudflare R2
- Upload-Key-Schema: `<tenantKey>/fallwild/<fallwildId>/<photoId>-<sanitized-file-name>`

### Dokumente und Benachrichtigungen

- `GET /api/v1/notifications`
- `GET /api/v1/documents/:id/download`

### Rollen, Aufgaben und Nachrichten

Diese Ressourcen sind fuer die naechste Ausbaustufe vorgesehen und werden fachlich bereits mitgedacht.

- `GET /api/v1/roles`
- `GET /api/v1/memberships`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `GET /api/v1/messages`
- `POST /api/v1/messages`

## Rollenregeln

### Schriftfuehrer

- Sitzungen lesen und bearbeiten
- Protokollversionen erstellen
- keine Freigabe von Protokollen

### Revier Admin

- alle Rechte des Schriftfuehrers
- Freigabe von Protokollen
- Verwaltungsrechte auf Reviereinrichtungen

### Jaeger

- Ansitze lesen und eigene Ansitze aendern
- Fallwild erfassen und Fallwild-Fotos hochladen
- Reviereinrichtungen lesen
- veroeffentlichte Protokolle lesen

## Fehlerfaelle

Das Fehlerformat bleibt:

- `{ error: { code, message, status } }`

Wichtige Fehlercodes:

- `unauthorized`
- `forbidden`
- `not-found`
- `validation-error`
- `service-unavailable`

Die API muss mindestens diese Faelle sauber zurueckgeben:

- ungueltiger Revier-Kontext
- fehlende Rolle
- Ressource nicht gefunden
- Pflichtfelder fehlen
- Ansitz-Konfliktwarnung
- Medien-Upload fehlgeschlagen
- PDF noch nicht verfuegbar

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

## Aktueller Stand im Repository

Bereits produktiv ueber `apps/web` vorhanden:

- `auth`, `me`, `dashboard`, `ansitze`, `fallwild`, `reviereinrichtungen`, `protokolle`, `sitzungen` und `documents`
- Drizzle-Migrationen fuer Auth, Ansitze, Fallwild, `media_assets`, Reviereinrichtungen, Sitzungen, Protokolle, Dokumente und Notifications
- S3-kompatible Storage-Schicht fuer lokales MinIO und spaeteres R2 inklusive best-effort Rollback bei Medien-Insert-Fehlern

`apps/api` bleibt als Referenz und Uebergangspfad im Repository, ist aber nicht die produktive Zielarchitektur.

## Naechste API-Themen

1. gehaerteten Medien-/Queue-v2-Pfad per iPhone-/iOS-Simulator-Smoke mit Testkonto und Test-Revier erneut abnehmen
2. Reviermeldungen und Aufgaben v1 auf dieselbe API-Linie heben
3. Rollen-, Nachrichten- und Veranstaltungsressourcen danach auf denselben Rechte- und Fehlervertrag setzen
