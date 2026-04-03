# Backend v1 für Schriftführer

## Ziel

Die erste sichtbare Version des Backends soll den vollständigen Arbeitsablauf für Schriftführer und Revier-Admins abdecken:

- Sitzung anlegen
- Protokoll erfassen
- Entwurf überarbeiten
- Beschlüsse dokumentieren
- Freigabe einholen
- Protokoll veröffentlichen

Das Backend ist in dieser Version ein Arbeitswerkzeug für Protokolle und Revierüberblick, nicht die komplette Verwaltungsplattform.

## Zielgruppen

- `Schriftführer`
- `Revier Admin`

## Rollenverhalten

### Schriftführer

- Sitzungen anlegen und bearbeiten
- Teilnehmer, Tagesordnung und Beschlüsse pflegen
- Protokollversionen erstellen
- Dokumente anhängen
- Entwürfe zur Freigabe vorbereiten

### Revier Admin

- alle Leserechte des Schriftführers
- Freigabe von Protokollen
- Veröffentlichung von freigegebenen Protokollen

## In Scope für v1

- Login und Revier-Kontext
- Dashboard mit operativem Überblick
- Sitzungsliste
- Sitzungsdetail
- Protokoll-Editor
- Versionshistorie
- Freigabe-Workflow
- PDF-Veröffentlichung
- Read-only-Lageansicht für Ansitze und Fallwild
- Dokumentenbereich für veröffentlichte Protokolle

## Nicht in Scope für v1

- Plattform-Administration
- komplexe Reviereinrichtungsverwaltung im Web
- Behördenmeldungen
- digitale Signaturen
- komplexe Statistik- und Reportingstrecken

## Informationsarchitektur

### 1. Dashboard

Zweck: schneller Überblick beim Einstieg

Inhalte:

- nächste Sitzung
- offene Protokollentwürfe
- aktive Ansitze heute
- neue Fallwild-Meldungen
- letzte Benachrichtigungen

### 2. Sitzungen

Zweck: zentrale Arbeitsliste für den Schriftführer

Inhalte:

- Liste aller Sitzungen
- Filter nach Status, Datum und Suchbegriff
- Schnellaktion `Sitzung anlegen`

### 3. Sitzungsdetail

Zweck: Stammdaten und Protokoll in einer Oberfläche bearbeiten

Inhalte:

- Titel, Termin, Ort
- Teilnehmer
- Tagesordnung
- Freitext-Protokoll oder strukturierte Zusammenfassung
- Beschlüsse
- Anhänge
- Protokollstatus

### 4. Freigabe

Zweck: Übergang von `Entwurf` zu `Freigegeben`

Regeln:

- Schriftführer speichert Entwurf
- Revier Admin prüft und gibt frei
- Freigabe erzeugt veröffentlichte Web-Ansicht und PDF-Dokument

### 5. Dokumente

Zweck: veröffentlichte Protokolle und Anhänge zentral verfügbar machen

Inhalte:

- veröffentlichte PDFs
- Anhänge je Sitzung
- Download-Historie später möglich

## Kernworkflows

### Sitzung anlegen

1. Schriftführer erstellt Titel, Termin und Ort
2. System legt `Sitzung` im Status `Entwurf` an
3. Teilnehmer und Tagesordnung werden ergänzt

### Protokoll erfassen

1. Schriftführer ergänzt Inhalte und Beschlüsse
2. Speichern erzeugt eine neue Protokollversion
3. Vorige Versionen bleiben nachvollziehbar

### Freigeben und veröffentlichen

1. Schriftführer markiert den Entwurf als prüfbereit
2. Revier Admin prüft den Stand
3. Freigabe setzt Status auf `Freigegeben`
4. System erzeugt PDF und veröffentlicht lesbare Ansicht

## Benötigte Daten

- `sitzungen`
- `sitzung_teilnehmer`
- `protokoll_versionen`
- `beschluesse`
- `dokumente`
- `audit_logs`

Zusätzliche Read-only-Daten für den Überblick:

- `ansitz_sessions`
- `fallwild_vorgaenge`
- `notifications`

## API-Bedarf

Minimal benötigte Endpunkte:

- `GET /api/v1/dashboard`
- `GET /api/v1/sitzungen`
- `POST /api/v1/sitzungen`
- `GET /api/v1/sitzungen/:id`
- `PATCH /api/v1/sitzungen/:id`
- `POST /api/v1/sitzungen/:id/versionen`
- `PATCH /api/v1/sitzungen/:id/freigeben`
- `GET /api/v1/sitzungen/:id/pdf`
- `GET /api/v1/ansitze/live`
- `GET /api/v1/fallwild`
- `GET /api/v1/protokolle`

## Sichtbarer Lieferumfang

Die erste sichtbare Backend-Version gilt als geliefert, wenn:

- ein Schriftführer eine Sitzung anlegen kann
- ein Protokoll mit Versionen gepflegt werden kann
- ein Revier Admin das Protokoll freigeben kann
- nach Freigabe eine veröffentlichte Ansicht und ein PDF vorliegen
- Ansitze und Fallwild im Dashboard sichtbar sind

## Akzeptanzkriterien

- alle Daten sind pro Revier getrennt
- nur berechtigte Rollen sehen oder ändern Protokolle
- Freigabe ist nur für `Revier Admin` möglich
- Freigabe ist im Audit-Log nachvollziehbar
- veröffentlichte Protokolle sind im Web und in der App lesbar
