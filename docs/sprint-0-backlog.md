# Sprint 0 Backlog

## Sprintziel

Aus dem sichtbaren Demo-Gerüst wird eine produktive technische Basis mit echter Persistenz, Authentifizierung, Revier-Kontext und Rollenprüfung.

Sprint 0 liefert noch kein vollständiges Fachprodukt für Endanwender, aber eine belastbare Plattform, auf der Sprint 1 und später Mobile/Offline sauber aufsetzen können.

## Ergebnis am Sprintende

- API liest und schreibt gegen PostgreSQL statt Demo-Store
- Benutzer melden sich an und arbeiten im Revier-Kontext
- Rollen werden serverseitig geprüft
- zentrale Kernressourcen existieren produktiv in Datenbank und API
- lokale Entwicklungsumgebung mit Seed-Daten ist reproduzierbar
- erste Contract-Tests sichern die Kernverträge ab

## In Scope

- Datenbankmodell und Migrationen
- Authentifizierung
- Revier-Kontext
- Rollen- und Rechtebasis
- Storage-Basis für Medien und Dokumente
- API-Basis-Härtung
- Seed- und Dev-Setup
- Contract-Tests

## Nicht in Scope

- vollständige Sitzungs- und Protokoll-UI
- produktive PDF-Erzeugung
- produktionsreifer Foto-Upload
- Push-Benachrichtigungen
- Offline-Synchronisierung

## Reihenfolge

1. Datenmodell und Persistenz
2. Auth, Revier-Scope und Rollen
3. API-Verträge und DTOs
4. Seed- und Dev-Setup
5. Contract-Tests und Härtung

## Epic S0-E1: Datenbank und Persistenz

### Ziel

Die Demo-Daten in `packages/domain` bleiben als Seed-Quelle nützlich, aber die API arbeitet nicht mehr mit In-Memory-Zustand.

### Tasks

#### S0-E1-T1 Datenzugriffstechnologie festziehen

- ORM oder Query-Ansatz verbindlich wählen
- Migrationsstrategie definieren
- Verbindungskonfiguration für lokale Entwicklung und Tests festlegen

Betroffene Bereiche:

- `apps/api/package.json`
- `apps/api/src/common`
- `.env.example`
- `docker-compose.yml`

Akzeptanzkriterien:

- das API-Projekt startet mit echter DB-Verbindung
- Migrationen können lokal erstellt und ausgeführt werden

#### S0-E1-T2 Kernschema anlegen

Tabellen:

- `users`
- `reviere`
- `memberships`
- `devices`
- `ansitz_sessions`
- `reviereinrichtungen`
- `reviereinrichtung_kontrollen`
- `fallwild_vorgaenge`
- `sitzungen`
- `sitzung_teilnehmer`
- `protokoll_versionen`
- `beschluesse`
- `dokumente`
- `notifications`
- `audit_logs`

Betroffene Bereiche:

- neues Schema- oder ORM-Verzeichnis unter `apps/api`
- `packages/domain/src/types.ts` bei Bedarf angleichen

Akzeptanzkriterien:

- Migration erzeugt vollständiges Schema
- Geodatenfelder sind für PostGIS oder gleichwertige Geometrie vorbereitet

#### S0-E1-T3 Persistente Repositories oder Services bauen

- DemoStore schrittweise ablösen
- Datenzugriffe je Modul kapseln
- Transaktionen für fachliche Mehrschritt-Aktionen vorsehen

Betroffene Bereiche:

- `apps/api/src/common/demo-store.service.ts`
- `apps/api/src/ansitze`
- `apps/api/src/fallwild`
- `apps/api/src/sitzungen`
- `apps/api/src/reviereinrichtungen`

Akzeptanzkriterien:

- mindestens Dashboard, Ansitze und Sitzungen lesen aus der Datenbank
- keine fachliche Ressource hängt im produktiven Pfad mehr am In-Memory-Store

## Epic S0-E2: Authentifizierung, Revier-Kontext und Rollen

### Ziel

Jede API-Anfrage kennt Benutzer, Mitgliedschaft, Rolle und aktives Revier.

### Tasks

#### S0-E2-T1 Auth-Strategie umsetzen

- Login-Mechanismus auswählen und implementieren
- Session- oder Token-Modell festlegen
- `me`-Endpoint bereitstellen

Betroffene Bereiche:

- neue Auth-Module unter `apps/api/src`
- `docs/api-v1.md` bei Bedarf nachziehen

Akzeptanzkriterien:

- ein lokaler Seed-Benutzer kann sich erfolgreich anmelden
- Web und Mobile können die Identität abrufen

#### S0-E2-T2 Revier-Kontext erzwingen

- aktives Revier pro Request festlegen
- Mehrfachmitgliedschaften sauber behandeln
- serverseitig prüfen, ob die Mitgliedschaft zum Benutzer gehört

Betroffene Bereiche:

- neue Guards oder Interceptors in `apps/api/src/common`
- alle fachlichen Controller

Akzeptanzkriterien:

- Zugriff auf fremde Revierdaten wird verhindert
- jeder fachliche Datensatz ist auf `revier_id` gescoped

#### S0-E2-T3 Rollen- und Rechtebasis einziehen

- Rollenmatrix im Backend abbilden
- Route Guards oder Policy-Layer einführen
- Rollen für Schriftführer, Revier Admin und Jäger absichern

Akzeptanzkriterien:

- Jäger kann keine Protokollfreigabe auslösen
- Schriftführer kann Protokolle ändern, aber nicht freigeben
- Revier Admin kann Freigaben ausführen

## Epic S0-E3: API-Basis und Verträge

### Ziel

Die API wird von einer Demo-Schnittstelle zu einer stabilen v1-Basis.

### Tasks

#### S0-E3-T1 DTOs und Validierung ergänzen

- Request-DTOs je Ressource einführen
- serverseitige Validierung für Pflichtfelder
- sauberes Fehlerformat definieren

Betroffene Bereiche:

- alle Controller in `apps/api/src`
- neue DTO-Dateien je Modul

Akzeptanzkriterien:

- ungültige Requests liefern strukturierte 4xx-Fehler
- Pflichtfelder für Ansitz, Fallwild und Sitzung sind valide abgesichert

#### S0-E3-T2 API-Versionierung und OpenAPI nachziehen

- Endpunkte auf `/api/v1/...` umstellen oder klar vorbereiten
- Swagger/OpenAPI an die produktiven DTOs koppeln

Akzeptanzkriterien:

- Doku deckt Auth, Dashboard, Ansitze, Fallwild und Sitzungen ab
- Web und Mobile können gegen dokumentierte Verträge entwickeln

#### S0-E3-T3 Audit- und Fehlerbasis

- Audit-Service für kritische Aktionen vorbereiten
- globale Exception-Filter oder Error-Mapper
- korrelierbare Logs für Requests

Akzeptanzkriterien:

- Freigabe, Export und sensible Änderungen sind technisch protokollierbar
- Fehlerantworten sind konsistent

## Epic S0-E4: Storage, Seed und lokale Entwicklung

### Ziel

Ein neuer Entwickler kann lokal starten, Daten laden und die Kernwege testen.

### Tasks

#### S0-E4-T1 Storage-Basis für Assets

- MinIO oder S3-Adapter als Storage-Layer einziehen
- Asset-Metadatenmodell anlegen
- Upload-Pfad noch ohne vollständige UI vorbereiten

Betroffene Bereiche:

- `apps/api/src/common`
- `docker-compose.yml`
- `.env.example`

Akzeptanzkriterien:

- ein Dokument- oder Bild-Asset kann technisch gespeichert und referenziert werden

#### S0-E4-T2 Seed-Daten auf produktive Basis heben

- Demo-Daten in Seeds überführen
- Seed-Benutzer, Seed-Revier, Mitgliedschaften und Beispieldaten bereitstellen

Betroffene Bereiche:

- `packages/domain/src/mock-data.ts`
- neues Seed-Verzeichnis in `apps/api`

Akzeptanzkriterien:

- lokales Entwicklungsrevier kann per Seed hergestellt werden
- Dashboard und API liefern nach frischem Setup sinnvolle Daten

#### S0-E4-T3 Dev-Setup dokumentieren

- Setup-Schritte in README und Doku präzisieren
- DB, Seeds, Startbefehle und Testbefehle dokumentieren

Akzeptanzkriterien:

- ein neuer Entwickler kann das System anhand der Doku starten

## Epic S0-E5: Qualitätssicherung

### Ziel

Die Basis wird nicht nur implementiert, sondern vertraglich und funktional abgesichert.

### Tasks

#### S0-E5-T1 Contract-Tests für Kernressourcen

- `auth`
- `me`
- `dashboard`
- `ansitze`
- `sitzungen`

Betroffene Bereiche:

- neues Testverzeichnis in `apps/api`

Akzeptanzkriterien:

- Contract-Tests laufen lokal und in CI
- Antwortformen der Kernressourcen sind reproduzierbar abgesichert

#### S0-E5-T2 Rechte- und Tenant-Tests

- Zugriff auf fremdes Revier
- fehlende Rollen
- falsche Mitgliedschaft

Akzeptanzkriterien:

- unzulässige Zugriffe liefern definierte Fehler

## Abhängigkeiten

- S0-E1 ist Voraussetzung für belastbare Contract-Tests und produktive Module
- S0-E2 hängt an Seed-Benutzern und Mitgliedschaften
- S0-E3 braucht die Entscheidungen aus S0-E1 und S0-E2
- S0-E5 sollte parallel ab Mitte des Sprints beginnen, nicht erst am Ende

## Repo-Auswirkungen

Wahrscheinlich neu oder stark betroffen:

- `apps/api/src/auth`
- `apps/api/src/common`
- `apps/api/src/*/dto`
- `apps/api/src/*/*.service.ts`
- `apps/api/src/*/*.controller.ts`
- `apps/api/src/main.ts`
- `apps/api/package.json`
- `packages/domain/src/types.ts`
- `README.md`
- `.env.example`
- `docker-compose.yml`

## Sprint-Abnahme

Sprint 0 ist fertig, wenn:

- die API nicht mehr auf In-Memory-Daten angewiesen ist
- Auth und Rollen serverseitig aktiv sind
- Dashboard, Ansitze und Sitzungen gegen persistente Daten funktionieren
- Seeds und lokale Entwicklung reproduzierbar sind
- die Kernverträge automatisiert geprüft werden
