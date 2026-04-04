# Mobile App v1 fuer Jaeger

## Ziel

Die erste Version der Jaeger-App soll den taeglichen Einsatz im Revier abbilden. Der Jaeger soll mit wenigen Schritten sehen, was im Revier passiert, einen Ansitz melden und Fallwild dokumentieren koennen.

Die App ist in v1 ein Einsatz- und Erfassungswerkzeug, kein vollstaendiges Jagdportal.

## Zielgruppe

- `Jaeger`
- optional `Revier Admin` in der Feldrolle

## In Scope fuer v1

- Login und Revier-Auswahl
- Startseite `Heute im Revier`
- Ansitz starten und beenden
- Liste aktiver Ansitze mit manueller Aktualisierung
- Warnung bei Doppelbelegung desselben Hochstands
- Fallwild-Erfassung mit Fotos und Standort
- Offline-Pufferung fuer Kernaktionen
- einfache Ansicht der Reviereinrichtungen
- freigegebene Protokolle lesen
- Push-Benachrichtigungen fuer wichtige Ereignisse

## Nicht in Scope fuer v1

- komplexe Wartungsplanung
- vollstaendiges Aufgabenmanagement
- Gastjaeger-Verwaltung
- tiefe Kartenbearbeitung
- generische Offline-Synchronisierung fuer alle Module

## Hauptscreens

### 1. Heute im Revier

Zweck: Einstieg und Lageueberblick

Inhalte:

- aktive Ansitze
- manuelle Aktualisierung
- letzte Meldungen
- offene Offline-Synchronisierung
- neu veroeffentlichte Protokolle

### 2. Ansitz

Zweck: aktiven Ansitz schnell melden

Inhalte:

- Ansitz starten
- Hochstand auswaehlen oder aktuelle Position verwenden
- optionale Notiz
- geplantes Ende optional
- aktive Ansitze im Revier ansehen
- eigenen Ansitz beenden

### 3. Fallwild

Zweck: KFZ-Wild draussen vollstaendig dokumentieren

Pflichtinformationen:

- Zeitpunkt
- GPS oder manuelle Position
- Wildart
- Geschlecht
- Bergungsstatus

Weitere Felder:

- Altersklasse
- Gemeinde
- Strasse
- Notiz
- Foto oder mehrere Fotos

### 4. Reviereinrichtungen

Zweck: vorhandene Einrichtungen im Feld schnell finden

Inhalte:

- Liste oder Karte
- Typ, Zustand und letzter Kontrollhinweis
- optional einfacher Maengelhinweis

### 5. Protokolle

Zweck: freigegebene Sitzungsprotokolle mobil lesbar machen

Inhalte:

- veroeffentlichte Protokolle
- PDF oeffnen
- Beschluesse lesen

## Kernworkflows

### Ansitz starten

1. Jaeger oeffnet Ansitz-Screen
2. Hochstand oder aktuelle Position waehlen
3. Notiz optional ergaenzen
4. App prueft bekannte Konflikte
5. Ansitz wird lokal oder online gespeichert

### Ansitz beenden

1. Jaeger oeffnet aktiven Ansitz
2. `Beenden` auswaehlen
3. Ende wird sofort oder spaeter synchronisiert

### Fallwild offline erfassen

1. Jaeger erfasst Standort und Daten
2. Fotos werden lokal vorgemerkt
3. Vorgang landet in der Offline-Warteschlange
4. App synchronisiert bei Netzverfuegbarkeit

## Offline-Verhalten

V1 muss zuverlaessig mit schlechtem Netz umgehen, aber nicht jede Speziallage loesen.

Pflichtverhalten:

- Ansitz-Aktionen lokal puffern
- Fallwild-Vorgaenge lokal puffern
- Fotos spaeter hochladen
- Queue-Status sichtbar machen

V1 darf vereinfacht bleiben bei:

- Konflikten zwischen mehreren offline erzeugten Aenderungen
- komplexen Merge-Strategien
- Hintergrund-Synchronisierung in allen App-Zustaenden

## Push-Benachrichtigungen

V1-relevant:

- neuer aktiver Ansitz
- beendeter Ansitz
- freigegebenes Protokoll

Optional spaeter:

- Reviereinrichtung mit offenem Mangel
- neue Aufgabe oder Wartung
- neue Veranstaltung oder zielgerichtete Nachricht

## Benoetigte Daten

- `memberships`
- `ansitz_sessions`
- `fallwild_vorgaenge`
- `media_assets`
- `reviereinrichtungen`
- `protokolle`
- `notifications`

## API-Bedarf

Minimal benoetigte Endpunkte:

- `GET /api/v1/me`
- `GET /api/v1/reviere`
- `GET /api/v1/dashboard`
- `GET /api/v1/ansitze/live`
- `POST /api/v1/ansitze`
- `PATCH /api/v1/ansitze/:id/beenden`
- `GET /api/v1/fallwild`
- `POST /api/v1/fallwild`
- `POST /api/v1/fallwild/:id/fotos`
- `GET /api/v1/reviereinrichtungen`
- `GET /api/v1/protokolle`
- `GET /api/v1/documents/:id/download`

## Sichtbarer Lieferumfang

Die erste sichtbare App-Version gilt als geliefert, wenn:

- ein Jaeger einen Ansitz starten und beenden kann
- aktive Ansitze anderer Jaeger sichtbar sind
- Fallwild vollstaendig erfasst werden kann
- Offline-Eingaben sichtbar vorgemerkt und spaeter synchronisiert werden
- freigegebene Protokolle gelesen werden koennen

## Akzeptanzkriterien

- Kernablaeufe funktionieren auf iOS und Android
- die App bleibt bei fehlender Verbindung bedienbar
- Konfliktwarnung bei Doppelbelegung wird angezeigt
- Fallwild-Erfassung verlangt alle Pflichtfelder
- veroeffentlichte Protokolle sind lesbar und auffindbar

## Karten

Kartenfunktionen in der mobilen App orientieren sich verbindlich an Google Maps. Wenn spaeter Kartensichten, Standortsuche, Marker oder Geocoding erweitert werden, sollen die Umsetzungen auf Google-Maps-kompatible APIs und SDKs abzielen.

## Technischer Stand

- Dashboard, Ansitze und Fallwild nutzen bereits denselben Vercel-native API-Pfad unter `https://hege.app/api/v1`
- Manuelle Aktualisierung und Pull-to-Refresh bleiben der verbindliche Aktualisierungspfad fuer v1

## Zukunftsthemen

- Aufgaben, Rollen und Nachrichten sind fuer spaetere Ausbaustufen vorgesehen
- mobile Hinweise aus WhatsApp oder Telegram werden spaeter als optionale Kanaele betrachtet
- die mobile App zeigt solche Inhalte erst an, wenn die fachliche Rollen- und Aufgabenlogik in API und Datenmodell steht
- geplant ist zuerst eine Inbox oder Aufgabenliste im Screen `Heute im Revier`, spaeter bei wachsendem Umfang ein eigener Aufgaben- oder Nachrichten-Screen
- Reviermeldungen fuer Fuetterungen, Wasserungen oder Hochstaende sollen mobil mit Fotos, Kurztext und Status moeglich sein
- Aufgaben sollen pro Benutzer sowohl als Liste als auch in einer Kalenderansicht sichtbar sein
- aus der App heraus soll eine WhatsApp-Nachricht mit vorbereitetem Inhalt an den passenden Empfaengerkreis angestossen werden koennen
- Veranstaltungen sollen mobil angekuendigt, bestaetigt und mit Treffpunkt, Uhrzeit und zugeordneten Aufgaben angezeigt werden
- die Sichtbarkeit solcher Inhalte muss nach Rollen und Empfaengergruppen steuerbar sein, damit nicht alle Benutzer alles sehen
