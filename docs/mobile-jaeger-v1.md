# Mobile App v1 für Jäger

## Ziel

Die erste Version der Jäger-App soll den täglichen Einsatz im Revier abbilden. Der Jäger soll mit wenigen Schritten sehen, was im Revier passiert, einen Ansitz melden und Fallwild dokumentieren können.

Die App ist in v1 ein Einsatz- und Erfassungswerkzeug, kein vollständiges Jagdportal.

## Zielgruppe

- `Jäger`
- optional `Revier Admin` in der Feldrolle

## In Scope für v1

- Login und Revier-Auswahl
- Startseite `Heute im Revier`
- Ansitz starten und beenden
- Liste aktiver Ansitze mit manueller Aktualisierung
- Warnung bei Doppelbelegung desselben Hochstands
- Fallwild-Erfassung mit Fotos und Standort
- Offline-Pufferung für Kernaktionen
- einfache Ansicht der Reviereinrichtungen
- freigegebene Protokolle lesen
- Push-Benachrichtigungen für wichtige Ereignisse

## Nicht in Scope für v1

- komplexe Wartungsplanung
- Aufgabenmanagement
- Gastjäger-Verwaltung
- tiefe Kartenbearbeitung
- generische Offline-Synchronisierung für alle Module

## Hauptscreens

### 1. Heute im Revier

Zweck: Einstieg und Lageüberblick

Inhalte:

- aktive Ansitze
- manuelle Aktualisierung
- letzte Meldungen
- offene Offline-Synchronisierung
- neu veröffentlichte Protokolle

### 2. Ansitz

Zweck: aktiven Ansitz schnell melden

Inhalte:

- Ansitz starten
- Hochstand auswählen oder aktuelle Position verwenden
- optionale Notiz
- geplantes Ende optional
- aktive Ansitze im Revier ansehen
- eigenen Ansitz beenden

### 3. Fallwild

Zweck: KFZ-Wild draußen vollständig dokumentieren

Pflichtinformationen:

- Zeitpunkt
- GPS oder manuelle Position
- Wildart
- Geschlecht
- Bergungsstatus

Weitere Felder:

- Altersklasse
- Gemeinde
- Straße
- Notiz
- Foto oder mehrere Fotos

### 4. Reviereinrichtungen

Zweck: vorhandene Einrichtungen im Feld schnell finden

Inhalte:

- Liste oder Karte
- Typ, Zustand und letzter Kontrollhinweis
- optional einfacher Mängelhinweis

### 5. Protokolle

Zweck: freigegebene Sitzungsprotokolle mobil lesbar machen

Inhalte:

- veröffentlichte Protokolle
- PDF öffnen
- Beschlüsse lesen

## Kernworkflows

### Ansitz starten

1. Jäger öffnet Ansitz-Screen
2. Hochstand oder aktuelle Position wählen
3. Notiz optional ergänzen
4. App prüft bekannte Konflikte
5. Ansitz wird lokal oder online gespeichert

### Ansitz beenden

1. Jäger öffnet aktiven Ansitz
2. `Beenden` auswählen
3. Ende wird sofort oder später synchronisiert

### Fallwild offline erfassen

1. Jäger erfasst Standort und Daten
2. Fotos werden lokal vorgemerkt
3. Vorgang landet in der Offline-Warteschlange
4. App synchronisiert bei Netzverfügbarkeit

## Offline-Verhalten

V1 muss zuverlässig mit schlechtem Netz umgehen, aber nicht jede Speziallage lösen.

Pflichtverhalten:

- Ansitz-Aktionen lokal puffern
- Fallwild-Vorgänge lokal puffern
- Fotos später hochladen
- Queue-Status sichtbar machen

V1 darf vereinfacht bleiben bei:

- Konflikten zwischen mehreren offline erzeugten Änderungen
- komplexen Merge-Strategien
- Hintergrund-Synchronisierung in allen App-Zuständen

## Push-Benachrichtigungen

V1-relevant:

- neuer aktiver Ansitz
- beendeter Ansitz
- freigegebenes Protokoll

Optional später:

- Reviereinrichtung mit offenem Mangel
- neue Aufgabe oder Wartung

## Benötigte Daten

- `memberships`
- `ansitz_sessions`
- `fallwild_vorgaenge`
- `media_assets`
- `reviereinrichtungen`
- `protokolle`
- `notifications`

## API-Bedarf

Minimal benötigte Endpunkte:

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

- ein Jäger einen Ansitz starten und beenden kann
- aktive Ansitze anderer Jäger sichtbar sind
- Fallwild vollständig erfasst werden kann
- Offline-Eingaben sichtbar vorgemerkt und später synchronisiert werden
- freigegebene Protokolle gelesen werden können

## Akzeptanzkriterien

- Kernabläufe funktionieren auf iOS und Android
- die App bleibt bei fehlender Verbindung bedienbar
- Konfliktwarnung bei Doppelbelegung wird angezeigt
- Fallwild-Erfassung verlangt alle Pflichtfelder
- veröffentlichte Protokolle sind lesbar und auffindbar

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
