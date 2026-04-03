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
- `GET /api/v1/me`

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

Planungsrahmen:

- Mitglieder koennen mehrere Rollen gleichzeitig haben
- Rollen sind flexibel erweiterbar
- Aufgaben koennen aus Protokollen, Beschluessen oder manueller Vergabe entstehen
- Aufgaben koennen einmalig, wiederkehrend oder als Projekt mit Start und Ende gefuehrt werden
- Nachrichten koennen an Rollen, einzelne Mitglieder oder Zielgruppen adressiert werden
- WhatsApp und Telegram bleiben kanaelseitige Integrationen ausserhalb der fachlichen Kernlogik
- die fachliche API bleibt dabei kanalneutral; Messenger werden spaeter nur ueber Adapter oder Jobs angebunden

## Aktualisierung in v1

- aktive Ansitze werden in v1 per manueller Aktualisierung oder leichtem Polling nachgeladen
- eine verpflichtende WebSocket-Infrastruktur ist nicht Teil des ersten Produktzuschnitts
- Push-Benachrichtigungen bleiben fuer wichtige Ereignisse moeglich, sind aber getrennt vom Listen-Refresh zu betrachten
- Rollen-, Aufgaben- und Nachrichtenfunktionen werden stufenweise ergaenzt und nicht mit dem ersten Ansitz-Slice vermischt

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
- Fallwild erfassen
- Reviereinrichtungen lesen
- veroeffentlichte Protokolle lesen

### Ausbaustufe Rollen und Aufgaben

- Rollen sind mehrfach pro Mitglied moeglich
- eine Person kann mehrere Rollen gleichzeitig tragen
- Rollen mit Zuweisungsrecht koennen Aufgaben an andere Mitglieder delegieren
- Aufgaben koennen mit Protokollbeschluessen verknuepft werden
- Rollen mit Zuweisungsrecht sind mindestens `Revier Admin`, `Paechter`, `Jagdleiter`, `Jagdaufseher` und fuer protokollnahe Aufgaben `Schriftfuehrer`
- typische Aufgaben sind Wasserungen oder Fuetterungen betreuen, Hochstaende reparieren, bauen oder versetzen sowie Dienste bei Veranstaltungen

## Fehlerfaelle

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

## Uebergang vom aktuellen Stand

Aktuell sind im Repository bereits vorhanden:

- Demo-Endpunkte unter `apps/api/src`
- Shared Typen und Regeln im Domain-Package
- `GET /api/v1/me`, `GET /api/v1/ansitze`, `GET /api/v1/ansitze/live`, `POST /api/v1/ansitze` und `PATCH /api/v1/ansitze/:id/beenden` als Vercel-native Route Handler in `apps/web`
- `GET /api/v1/fallwild`, `POST /api/v1/fallwild` und `GET /api/v1/fallwild/export.csv` als Vercel-native Route Handler in `apps/web`
- Drizzle-Migration fuer den ersten Datenbank-Slice

Fuer API v1 muessen als Naechstes folgen:

1. Dashboard-Endpunkte und weitere Module auf dieselbe Server-Schicht umstellen
2. Auth und Guards
3. Detail-, Foto- und Download-Strecken fuer Fallwild und Dokumente
4. Rollen- und Tenant-Pruefung pro Endpunkt
5. Aufgaben- und Nachrichten-Ressourcen in derselben API-Linie modellieren
6. Upload- und Download-Strecken produktionsreif machen
