# Agent-Workstreams Sprint 1

## Ziel

Dieses Dokument schneidet Sprint 1 so, dass mehrere Agents parallel am Schriftführer-Backend arbeiten können, ohne sich über Web- und API-Hotspots gegenseitig zu blockieren.

Sprint 1 setzt voraus, dass Sprint 0 einen stabilen `Foundation Freeze` geliefert hat.

## Voraussetzungen aus Sprint 0

Vor Sprint 1 müssen stabil vorliegen:

- Login und Session-Verhalten
- Rollen und Revier-Scope
- Sitzungs- und Dashboard-Basisverträge
- Storage-Basis für Dokumente
- Test- und Seed-Infrastruktur

Ohne diese Voraussetzungen werden die Workstreams in Sprint 1 nicht unabhängig genug.

## Single-Writer-Zonen

Diese Bereiche sollten in Sprint 1 jeweils nur von einem Agent gleichzeitig verändert werden:

- `apps/api/src/sitzungen`
- `apps/api/src/dashboard`
- zentrale Web-Session- und Auth-Utilities
- zentrale Web-Navigation oder Shell-Komponenten
- PDF-/Dokument-Service

## Workstream A: Sitzungs- und Protokoll-API

### Ziel

Die Fach-API für Schriftführer wird vollständig und belastbar.

### Ownership

- `apps/api/src/sitzungen`
- zugehörige DTOs
- Statuslogik, Versionierung und Beschlüsse

### Aufgaben

- Sitzungsliste, Detail, Anlage und Bearbeitung vervollständigen
- Versionen und Beschlüsse produktiv modellieren
- Statusübergänge für Freigabe absichern
- API-Verträge für den Web-Editor stabil halten

### Blockiert andere Workstreams bis

- Detail- und Save-Verträge für Sitzungen stabil sind
- Freigabevertrag definiert ist

### Übergabeartefakte

- stabile Sitzungs-Endpoints
- dokumentierte Save- und Read-Modelle
- Fehlerfälle für Formular-Handling

## Workstream B: Web-Plattform für Schriftführer

### Ziel

Das Web erhält Login, Session, Revier-Kontext und eine belastbare Navigationsstruktur.

### Ownership

- `apps/web/src/app/layout.tsx`
- Shell- und Navigationskomponenten
- Web-Auth- und Session-Utilities
- geschützte Routenstruktur

### Aufgaben

- Login-Flow integrieren
- Session-Handling und Revier-Kontext aufbauen
- Dashboard, Sitzungsliste und Detailrouten strukturieren

### Abhängigkeiten

- braucht Auth aus Sprint 0
- sollte möglichst früh mit `Workstream A` die Sitzungsrouten abstimmen

### Darf nicht ändern

- Sitzungs-API-Verträge eigenständig anpassen
- PDF-Generierung

### Übergabeartefakte

- geschütztes Web-Grundgerüst
- API-Client-Basis
- stabile Routingstruktur für Schriftführer

## Workstream C: Protokoll-Editor und Fachformulare

### Ziel

Der eigentliche Arbeitsbereich des Schriftführers wird umgesetzt.

### Ownership

- neue Editor- und Formular-Komponenten unter `apps/web/src/components`
- Sitzungsdetail-UI
- Beschluss- und Teilnehmerformulare

### Aufgaben

- Formular für Sitzung anlegen und bearbeiten
- Protokoll-Inhalt bearbeiten
- Beschlüsse und Teilnehmer pflegen
- Versionen sichtbar machen

### Abhängigkeiten

- braucht Session- und Routingbasis aus `Workstream B`
- braucht Save- und Read-Verträge aus `Workstream A`

### Darf nicht ändern

- globale Web-Auth-Logik
- API-Verträge ohne Rücksprache

### Übergabeartefakte

- funktionsfähiger Editor-Flow
- nachvollziehbare Formularvalidierung
- sichtbare Versionshistorie

## Workstream D: Freigabe, Veröffentlichung und Dokumente

### Ziel

Der Schritt von `Entwurf` zu `Freigegeben` wird vollständig sichtbar und nutzbar.

### Ownership

- PDF- und Dokument-Service im API-Bereich
- veröffentlichte Protokollansicht im Web
- Freigabe-UI im Web

### Aufgaben

- Freigabeaktion im Web
- veröffentlichte Lesedarstellung
- PDF-Generierung und Download
- Dokumentablage und Dateibenennung standardisieren

### Abhängigkeiten

- braucht Freigabe-API aus `Workstream A`
- braucht Session- und Routingstruktur aus `Workstream B`

### Darf nicht ändern

- Editor-Grundlogik
- globale Navigation

### Übergabeartefakte

- klickbarer Freigabe-Flow
- PDF-Download
- lesbare veröffentlichte Ansicht

## Workstream E: Dashboard und Lagekontext

### Ziel

Das Schriftführer-Backend zeigt nicht nur Protokolle, sondern auch den operativen Revierkontext.

### Ownership

- `apps/api/src/dashboard`
- Dashboard-Ansichten im Web
- Read-only-Ansichten für Ansitze und Fallwild

### Aufgaben

- Dashboard gegen echte Daten anbinden
- Ansitze und Fallwild lesend integrieren
- Kacheln, Listen und Kontextbereiche für Schriftführer vervollständigen

### Abhängigkeiten

- braucht Dashboard- und Lesedaten aus API
- kann weitgehend parallel zu `Workstream C` arbeiten

### Übergabeartefakte

- produktives Dashboard
- lesbarer Lageüberblick ohne Fachbearbeitung

## Workstream F: Tests und Abnahme

### Ziel

Die Sprint-1-Flows werden früh und nicht erst am Ende abgesichert.

### Ownership

- Web-Flow-Tests
- API-Contract-Tests für Sprint-1-Endpunkte
- manuelle Abnahmeskripte

### Aufgaben

- Contract-Tests für Sitzungsdetail, Versionen, Freigabe und PDF
- UI-Flow-Tests für Login, Anlage, Bearbeitung und Freigabe
- manuelle Abnahme-Checkliste pflegen

### Abhängigkeiten

- kann mit Testgerüst früh starten
- finale Assertions hängen an `Workstream A`, `C` und `D`

### Darf nicht ändern

- Fachlogik als Nebeneffekt groß umbauen

## Empfohlene Parallelisierung

### Phase 1

- Workstream A und B starten sofort
- Workstream F setzt Testgerüst und Abnahme-Checkliste auf

### Phase 2

- nach Stabilisierung der Detailverträge startet Workstream C
- Workstream E kann parallel Dashboard und Lageansichten aufbauen

### Phase 3

- nach Freigabevertrag startet Workstream D
- Workstream F zieht finale Tests und Regressionen nach

## Gemeinsame Checkpoints

### Checkpoint 1: API Freeze für Editor

Pflicht:

- Sitzungsliste und Sitzungsdetail stabil
- Save-Modell stabil
- Rollenfehler dokumentiert

### Checkpoint 2: UI Freeze für Freigabe

Pflicht:

- Editor-Layout und Navigation stabil
- Freigabe-Endpoint stabil
- Dokument-Service bereit

### Checkpoint 3: Sprint-1-Abnahme

Pflicht:

- Sitzung kann angelegt werden
- Protokoll kann gespeichert werden
- Revier Admin kann freigeben
- PDF ist abrufbar
- Dashboard und Lagekontext sind sichtbar

## Was nicht parallelisiert werden sollte

- gleichzeitige Änderungen an `apps/api/src/sitzungen`
- gleichzeitige Änderungen an der Web-Shell oder globalem Layout
- gleichzeitige Änderungen am Freigabe- und PDF-Service

## Übergang zu Sprint 2

Sprint 2 kann sauber starten, wenn Sprint 1 diese stabilen Artefakte hinterlässt:

- veröffentlichte Protokolle als lesbare Ressource
- belastbare Session- und Revierkontext-Mechanik im Web
- stabile Dokument-Downloads
- klare API-Verträge, die später auch mobil konsumiert werden können
