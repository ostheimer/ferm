# Sprint 1 Backlog

## Sprintziel

Die erste nutzbare Web-Version für Schriftführer und Revier-Admins soll entstehen. Fokus ist der komplette Protokoll-Workflow von der Anlage einer Sitzung bis zur Freigabe und Veröffentlichung.

Sprint 1 setzt Sprint 0 als abgeschlossen voraus.

## Ergebnis am Sprintende

- Schriftführer kann Sitzungen anlegen und bearbeiten
- Protokollversionen können erstellt werden
- Beschlüsse und Teilnehmer sind pflegbar
- Revier Admin kann Protokolle freigeben
- veröffentlichte Protokolle sind als Web-Ansicht und PDF verfügbar
- Dashboard zeigt den relevanten Revierüberblick für Schriftführer

## In Scope

- Web-Backoffice für Schriftführer
- Dashboard
- Sitzungsliste
- Sitzungsdetail
- Protokoll-Editor
- Versionierung
- Freigabe-Workflow
- PDF-Generierung
- Read-only-Lageübersicht für Ansitze und Fallwild

## Nicht in Scope

- Mobile Jäger-Flows
- produktive Offline-Synchronisierung
- komplexe Reviereinrichtungsbearbeitung im Web
- Behördenexporte
- digitale Signaturen

## Reihenfolge

1. API für Sitzungen und Protokolle vervollständigen
2. Web-Datenfluss und Basisnavigation produktiv machen
3. Editor, Versionierung und Freigabe implementieren
4. Dashboard und Read-only-Lageübersicht ergänzen
5. PDF und Abnahmetests abschließen

## Epic S1-E1: Fach-API für Sitzungen und Protokolle

### Ziel

Alle Schriftführer-Flows haben stabile Backend-Endpunkte und serverseitige Rechteprüfung.

### Tasks

#### S1-E1-T1 Sitzungs-Endpunkte vervollständigen

- Liste, Detail, Anlage und Bearbeitung finalisieren
- Filter nach Status und Datum ergänzen
- Teilnehmer und Tagesordnung sauber mappen

Betroffene Bereiche:

- `apps/api/src/sitzungen`
- `docs/api-v1.md`

Akzeptanzkriterien:

- Sitzungen können über API angelegt und bearbeitet werden
- Listen liefern Filter- und Sortierinformationen konsistent

#### S1-E1-T2 Protokollversionen und Beschlüsse

- Versionen explizit modellieren
- Beschlüsse separat persistieren
- Attachments referenzierbar machen

Akzeptanzkriterien:

- ein Speichervorgang erzeugt nachvollziehbare Versionen
- Beschlüsse bleiben pro Version lesbar

#### S1-E1-T3 Freigabe-Workflow serverseitig

- Statusübergänge definieren
- Freigabe nur für `Revier Admin`
- Freigabe-Audit mitschreiben

Akzeptanzkriterien:

- Freigabe ist nur in gültigem Status möglich
- Freigabeaktion ist auditierbar

## Epic S1-E2: Web-Grundstruktur für Schriftführer

### Ziel

Das aktuelle Demo-Backoffice wird an echte API-Daten und Rollen gekoppelt.

### Tasks

#### S1-E2-T1 Auth und Session im Web

- Login-Flow einbauen
- aktives Revier laden
- Schriftführer- und Admin-Routen absichern

Betroffene Bereiche:

- `apps/web/src/app`
- neue API-Client-Utilities unter `apps/web/src`

Akzeptanzkriterien:

- nicht eingeloggte Nutzer sehen keine Fachseiten
- Rollenfehler werden sauber behandelt

#### S1-E2-T2 Datenfetching und API-Clients

- Web-Daten nicht mehr aus Demo-Daten lesen
- gemeinsame Fetch-Schicht für Dashboard, Sitzungen und Protokolle

Betroffene Bereiche:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/protokolle/page.tsx`
- neue `lib`- oder `data`-Module

Akzeptanzkriterien:

- Dashboard und Sitzungsseiten lesen produktive API-Daten

#### S1-E2-T3 Navigation und Seitenstruktur festigen

- Dashboard
- Sitzungsliste
- Sitzungsdetail
- Dokumente oder Protokolle

Akzeptanzkriterien:

- alle Schriftführer-Flows sind über die Navigation erreichbar

## Epic S1-E3: Protokoll-Editor und Fachformulare

### Ziel

Schriftführer kann die komplette inhaltliche Arbeit im Web erledigen.

### Tasks

#### S1-E3-T1 Sitzung anlegen und bearbeiten

- Form für Stammdaten
- Teilnehmer- und Tagesordnungspflege
- Validierung und Fehlerrückmeldung

Betroffene Bereiche:

- `apps/web/src/app/protokolle`
- ggf. neue Komponenten unter `apps/web/src/components`

Akzeptanzkriterien:

- eine neue Sitzung kann ohne manuelle API-Aufrufe vollständig angelegt werden

#### S1-E3-T2 Protokoll-Inhalt und Beschlüsse

- Editor für Zusammenfassung oder Freitext
- Beschlussliste mit Verantwortlichem und Fälligkeit
- Anhänge technisch vorbereiten oder einfach integrieren

Akzeptanzkriterien:

- Schriftführer kann einen verwertbaren Protokollstand erzeugen

#### S1-E3-T3 Versionierung sichtbar machen

- letzte Version anzeigen
- frühere Versionen listen
- sinnvolle Änderungsmetadaten anzeigen

Akzeptanzkriterien:

- Änderungen zwischen Protokollständen sind nachvollziehbar

## Epic S1-E4: Freigabe, Veröffentlichung und PDF

### Ziel

Der fachliche Abschluss des Schriftführer-Prozesses wird produktiv sichtbar.

### Tasks

#### S1-E4-T1 Freigabeaktion im Web

- Freigabeknopf nur für `Revier Admin`
- Statuswechsel sofort sichtbar
- Fehlerfälle klar darstellen

Akzeptanzkriterien:

- Schriftführer sieht den Freigabestatus
- Revier Admin kann aus dem Web freigeben

#### S1-E4-T2 Veröffentlichte Web-Ansicht

- lesbare Darstellung freigegebener Protokolle
- Beschlüsse und Anhänge sichtbar

Akzeptanzkriterien:

- freigegebene Protokolle sind ohne Editor-Kontext lesbar

#### S1-E4-T3 PDF-Generierung

- PDF-Endpunkt produktiv nutzen
- Download aus dem Web ermöglichen
- Dateibenennung und Asset-Ablage standardisieren

Akzeptanzkriterien:

- nach Freigabe ist ein PDF abrufbar

## Epic S1-E5: Dashboard und Lageüberblick

### Ziel

Schriftführer sieht neben Protokollen den operativen Revierkontext.

### Tasks

#### S1-E5-T1 Dashboard produktiv anbinden

- nächste Sitzung
- offene Entwürfe
- aktive Ansitze
- neue Fallwild-Meldungen

Betroffene Bereiche:

- `apps/web/src/app/page.tsx`
- `apps/api/src/dashboard`

Akzeptanzkriterien:

- Dashboard spiegelt den echten Datenbestand des aktiven Reviers

#### S1-E5-T2 Read-only-Lageansichten

- aktive Ansitze lesend anzeigen
- aktuelle Fallwild-Meldungen lesend anzeigen

Akzeptanzkriterien:

- Schriftführer muss das Web nicht verlassen, um Lagekontext zu sehen

## Epic S1-E6: Tests und Abnahme

### Ziel

Die Schriftführer-Workflows sind nicht nur sichtbar, sondern belastbar abgesichert.

### Tasks

#### S1-E6-T1 Contract-Tests erweitern

- Sitzungsliste
- Sitzungsdetail
- Versionen
- Freigabe
- PDF

Akzeptanzkriterien:

- API-Verträge für Sprint-1-Funktionalität sind automatisiert geprüft

#### S1-E6-T2 Web-Flow-Tests

- Login
- Sitzung anlegen
- Protokoll speichern
- Freigabe

Akzeptanzkriterien:

- kritische Schriftführer-Flows sind automatisiert oder mindestens reproduzierbar dokumentiert

#### S1-E6-T3 Manuelle Abnahme

Szenarien:

- Schriftführer legt Sitzung an
- Schriftführer ergänzt Beschlüsse
- Revier Admin gibt frei
- PDF wird geladen
- freigegebenes Protokoll erscheint lesbar

Akzeptanzkriterien:

- alle Kernszenarien laufen ohne direkte Datenbank- oder API-Manipulation

## Abhängigkeiten

- Sprint 1 hängt vollständig an Sprint 0
- S1-E3 braucht stabile Sitzungs- und Protokoll-Endpunkte aus S1-E1
- S1-E4 hängt an Statusmodell, Audit und Dokument-Storage
- S1-E5 hängt an produktivem Dashboard und fachlichen Leserechten

## Repo-Auswirkungen

Wahrscheinlich neu oder stark betroffen:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/protokolle/page.tsx`
- neue Seiten für Sitzungsliste und Sitzungsdetail unter `apps/web/src/app`
- neue Formular- und Detailkomponenten unter `apps/web/src/components`
- `apps/api/src/sitzungen`
- `apps/api/src/dashboard`
- `apps/api/src/common`
- `docs/api-v1.md`

## Sprint-Abnahme

Sprint 1 ist fertig, wenn:

- ein Schriftführer im Web eine Sitzung anlegen und als Entwurf bearbeiten kann
- Versionen und Beschlüsse sichtbar und persistent sind
- ein Revier Admin freigeben kann
- ein PDF nach Freigabe abrufbar ist
- Dashboard, Ansitze und Fallwild im Backoffice lesbar eingebunden sind

## Multi-Agent-Schnitt

Die empfohlene Parallelisierung für Sprint 1 ist separat beschrieben:

- [Agent-Workstreams Sprint 1](./agent-workstreams-sprint-1.md)
