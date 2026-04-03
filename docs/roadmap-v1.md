# Roadmap v1

## Ziel

Diese Roadmap beschreibt die Ausbaustufen vom aktuellen Repository-Grundgerüst zur ersten produktiven Version für Schriftführer und Jäger.

## Aktueller Status

- Der aktuelle Code-Stand ist ein sichtbares Demo- und Integrationsgerüst.
- Web, Mobile und eine bestehende Übergangs-API existieren bereits als Grundstruktur, aber noch nicht mit produktiver Persistenz oder Authentifizierung.
- Der nächste reale Meilenstein ist vollständig `Sprint 0`.

## Sprint 0: Fundament

Ziel: aus dem Demo-Gerüst eine produktive technische Basis machen

Lieferumfang:

- PostgreSQL/PostGIS anbinden
- Vercel-native API-Basis in `apps/web` einziehen
- Migrationen und Datenmodell einführen
- Authentifizierung und Revier-Kontext einziehen
- Rollenmodell serverseitig aktivieren
- Seed-Daten für lokales Entwicklungsrevier
- Basis für Storage und Medienverwaltung
- API-Verträge und erste Contract-Tests für Kernressourcen aufsetzen

Ergebnis:

- persistente API-Basis mit echten Benutzern, Revieren und Mitgliedschaften

## Sprint 1: Schriftführer-Backend

Ziel: erste nutzbare Web-Version für Sitzungen und Protokolle

Lieferumfang:

- Dashboard mit offenen Entwürfen und Revierlage
- Sitzungsliste
- Sitzungsdetail
- Protokoll-Editor
- Teilnehmer und Beschlüsse
- Versionierung
- Freigabe durch Revier Admin
- PDF-Erzeugung
- Contract-Tests für Sitzungen, Freigabe und Rollenrechte

Ergebnis:

- Sitzungen können von der Anlage bis zur Veröffentlichung durchlaufen werden

## Sprint 2: Jäger-App Kern

Ziel: erste nutzbare mobile Version für den täglichen Einsatz

Lieferumfang:

- Login und Revier-Auswahl
- Heute-im-Revier-Screen
- Ansitz starten und beenden
- Liste aktiver Ansitze mit manueller Aktualisierung
- Push-Benachrichtigungen für Ansitze
- freigegebene Protokolle lesen
- kritische Mobile-Flows für Login, Ansitz und Protokollanzeige automatisiert absichern

Ergebnis:

- Jäger sehen die Lage im Revier und können Ansitze sauber melden

## Sprint 3: Fallwild

Ziel: Fallwild-Erfassung vollständig mobil nutzbar machen

Lieferumfang:

- strukturierte Fallwild-API
- Foto-Upload
- Offline-Warteschlange in der App
- Wiederanlauf und Synchronisierung
- Fallwild-Übersicht im Web
- CSV-Export

Ergebnis:

- Fallwild kann draußen erfasst und später vollständig synchronisiert werden

## Sprint 4: Reviereinrichtungen und Härtung

Ziel: die v1 fachlich und technisch stabilisieren

Lieferumfang:

- Reviereinrichtungen lesend in der App
- einfache Kontroll- oder Mängelhinweise
- Audit-Log
- Monitoring und Logging
- Fehlerbehandlung und Rechteprüfung komplett
- Qualitäts- und Abnahmetests

Ergebnis:

- stabile v1 mit klaren Kernabläufen für Schriftführer und Jäger

## Querschnittsthemen

### Qualität

- API-Contract-Tests starten bereits in Sprint 0 und werden in Sprint 1 erweitert
- kritische Mobile-User-Flows werden ab Sprint 2 parallel zu den Features abgesichert
- End-to-End-Abnahmetests bündeln die Kernabläufe in Sprint 4

### Sprache und Lokalisierung

- v1 ist fachlich und redaktionell auf Deutsch für Österreich (`de-AT`) ausgelegt
- Web und Mobile sollen Texte dennoch so strukturieren, dass spätere zusätzliche Sprachen möglich bleiben
- eine verpflichtende zweisprachige Auslieferung ist nicht Teil von v1
- falls nach v1 eine erste Zweitsprache eingeführt wird, ist Englisch (`en`) die bevorzugte erste Erweiterung

## Abnahmekriterien für v1

- Schriftführer kann eine Sitzung anlegen, bearbeiten und zur Freigabe bringen
- Revier Admin kann ein Protokoll freigeben und veröffentlichen
- Jäger kann einen Ansitz starten und beenden
- Jäger kann Fallwild auch offline vollständig erfassen
- freigegebene Protokolle sind mobil lesbar
- alle Daten sind pro Revier getrennt
- kritische Aktionen sind nachvollziehbar protokolliert

## Empfohlene nächste Umsetzung

Wenn unmittelbar weiterentwickelt wird, ist die sinnvollste Reihenfolge:

1. Sprint 0 vollständig umsetzen
2. danach Schriftführer-Backend bis zur Protokollfreigabe fertigstellen
3. erst dann die mobile Offline-Fallwildstrecke produktiv machen

## Detaillierte Sprint-Backlogs

- [Umsetzungsbacklog](./umsetzungsbacklog.md)
- [Sprint 0 Backlog](./sprint-0-backlog.md)
- [Sprint 1 Backlog](./sprint-1-backlog.md)
