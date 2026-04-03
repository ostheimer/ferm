# Architektur

## Zielarchitektur

`ferm` ist als mandantenfähige SaaS für Jagdgesellschaften und Reviere in Österreich geplant. Ein `Revier` ist der fachliche Tenant. Benutzer können mehreren Revieren mit unterschiedlichen Rollen zugeordnet sein.

Die Plattform besteht aus drei Hauptanwendungen:

- `apps/api`: zentrales Backend für Daten, Rechte, Exporte, Echtzeit und Integrationen
- `apps/web`: internes Backoffice für Schriftführer und Revier-Admins
- `apps/mobile`: mobile App für Jäger im Feld

Das Shared Package `packages/domain` enthält gemeinsame Typen, Statuswerte, Demo-Daten und Fachregeln.

## Monorepo-Struktur

```text
apps/
  api/
  web/
  mobile/
packages/
  domain/
docs/
```

## Technischer Zielstack

### Backend

- NestJS
- PostgreSQL mit PostGIS für Reviergrenzen, Standorte und Ereignisse
- S3-kompatibler Storage für Fotos, Anhänge und PDF-Dokumente
- WebSockets für Live-Ansitze
- Job-Queue für Push, Bildverarbeitung, PDF-Generierung und Offline-Nachverarbeitung

### Web

- Next.js App Router
- internes Backoffice, keine öffentliche Marketing-Seite
- Fokus auf Sitzungen, Protokolle, Freigaben und Revierüberblick

### Mobile

- Expo / React Native
- Fokus auf Ansitz, Fallwild, Reviereinrichtungen und Protokolle
- Offline-Fähigkeit für Kernabläufe

## Mandanten- und Rollenmodell

### Tenant

- `Revier` ist die oberste fachliche Einheit
- alle fachlichen Ressourcen hängen an `revier_id`
- jede Anfrage wird auf einen Revier-Kontext eingeschränkt

### Rollen

- `Platform Admin`
- `Revier Admin`
- `Schriftführer`
- `Jäger`

### Grundregel

- `Schriftführer` und `Revier Admin` arbeiten primär im Web
- `Jäger` arbeitet primär mobil
- `Revier Admin` darf zusätzlich Freigaben und Verwaltungsaktionen ausführen

## Domänenmodule

### Ansitz

- aktive Ansitze
- Konfliktprüfung bei Doppelbelegung
- Live-Status im Revier

### Reviereinrichtungen

- Hochstände, Fütterungen, Salzlecken, Kirrungen und weitere Einrichtungstypen
- Zustand, Kontrollen und Wartung

### Fallwild

- strukturierte Erfassung von KFZ-Wild
- Fotos, Standort, Wildart, Geschlecht, Status
- Exportierbarkeit für interne oder externe Weitergabe

### Sitzungen und Protokolle

- Sitzungsstammdaten
- Teilnehmer
- Protokollversionen
- Beschlüsse
- Freigabe und Veröffentlichung

## Datenhaltung

### Aktueller Stand

- API verwendet derzeit einen In-Memory-Demo-Store
- lokale Infrastruktur für PostgreSQL/PostGIS und MinIO ist vorbereitet

### Zielzustand

- persistente Tabellen für Benutzer, Reviere, Mitgliedschaften und Geräte
- persistente Tabellen für Ansitze, Fallwild, Reviereinrichtungen und Protokolle
- getrennte Asset-Verwaltung für Fotos und Dokumente
- Audit-Log für sensible Aktionen

## Echtzeit und Offline

### Echtzeit

- Live-Ansitze werden per WebSocket pro Revier verteilt
- Push-Benachrichtigungen informieren über relevante Ereignisse

### Offline

- Mobile-App speichert Kernaktionen lokal
- Operationen erhalten clientseitige IDs
- Synchronisierung erfolgt bei Rückkehr der Verbindung
- Medien-Upload wird getrennt von Fachdaten behandelt

## Sicherheit und Betrieb

- Hosting in der EU
- DSGVO-konforme Datenspeicherung
- serverseitige Rollen- und Tenant-Prüfung auf jeder fachlichen Ressource
- Audit-Log für Freigaben, Exporte, Löschungen und sensible Änderungen
- Monitoring, strukturierte Logs und Healthchecks in der produktiven Stufe

## Aktueller Repository-Stand

- gemeinsames Domain-Modell vorhanden
- API-Endpunkte für die Kernmodule vorhanden
- Web- und Mobile-UIs als sichtbares Grundgerüst vorhanden
- produktive Persistenz, Authentifizierung und Rechteprüfung noch offen

## Nächste technische Ausbaustufe

1. Datenbank und Migrationen einziehen
2. Authentifizierung und Rollenmodell serverseitig aktivieren
3. Demo-Store durch persistente Services ersetzen
4. Uploads, PDFs und Benachrichtigungen produktionsreif machen
5. Kartenintegration mit echten Bibliotheken ergänzen
