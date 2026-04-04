# Roadmap v1

## Ziel

Diese Roadmap beschreibt die Ausbaustufen vom aktuellen Repository-Grundgeruest zur ersten produktiven Version fuer Schriftfuehrer und Jaeger.

## Aktueller Status

- Der aktuelle Code-Stand ist ein sichtbares Demo- und Integrationsgeruest.
- Web, Mobile und eine bestehende Uebergangs-API existieren bereits als Grundstruktur, aber noch nicht mit produktiver Persistenz oder Authentifizierung.
- Der naechste reale Meilenstein ist vollstaendig `Sprint 0`.

## Sprint 0: Fundament

Ziel: aus dem Demo-Geruest eine produktive technische Basis machen

Lieferumfang:

- PostgreSQL/PostGIS anbinden
- Vercel-native API-Basis in `apps/web` einziehen
- Migrationen und Datenmodell einfuehren
- Authentifizierung und Revier-Kontext einziehen
- Rollenmodell serverseitig aktivieren
- Seed-Daten fuer lokales Entwicklungsrevier
- Basis fuer Storage und Medienverwaltung
- API-Vertraege und erste Contract-Tests fuer Kernressourcen aufsetzen

Ergebnis:

- persistente API-Basis mit echten Benutzern, Revieren und Mitgliedschaften

## Sprint 1: Schriftfuehrer-Backend

Ziel: erste nutzbare Web-Version fuer Sitzungen und Protokolle

Lieferumfang:

- Dashboard mit offenen Entwuerfen und Revierlage
- Sitzungsliste
- Sitzungsdetail
- Protokoll-Editor
- Teilnehmer und Beschluesse
- Versionierung
- Freigabe durch Revier Admin
- PDF-Erzeugung
- Contract-Tests fuer Sitzungen, Freigabe und Rollenrechte

Ergebnis:

- Sitzungen koennen von der Anlage bis zur Veroeffentlichung durchlaufen werden

## Sprint 2: Jaeger-App Kern

Ziel: erste nutzbare mobile Version fuer den taeglichen Einsatz

Lieferumfang:

- Login und Revier-Auswahl
- Heute-im-Revier-Screen
- Ansitz starten und beenden
- Liste aktiver Ansitze mit manueller Aktualisierung
- Push-Benachrichtigungen fuer Ansitze
- freigegebene Protokolle lesen
- kritische Mobile-Flows fuer Login, Ansitz und Protokollanzeige automatisiert absichern

Ergebnis:

- Jaeger sehen die Lage im Revier und koennen Ansitze sauber melden

## Sprint 3: Fallwild

Ziel: Fallwild-Erfassung vollstaendig mobil nutzbar machen

Lieferumfang:

- strukturierte Fallwild-API
- Foto-Upload
- Offline-Warteschlange in der App
- Wiederanlauf und Synchronisierung
- Fallwild-Uebersicht im Web
- CSV-Export

Ergebnis:

- Fallwild kann draussen erfasst und spaeter vollstaendig synchronisiert werden

## Sprint 4: Reviereinrichtungen und Haertung

Ziel: die v1 fachlich und technisch stabilisieren

Lieferumfang:

- Reviereinrichtungen lesend in der App
- einfache Kontroll- oder Maengelhinweise
- Audit-Log
- Monitoring und Logging
- Fehlerbehandlung und Rechtepruefung komplett
- Qualitaets- und Abnahmetests

Ergebnis:

- stabile v1 mit klaren Kernablaeufen fuer Schriftfuehrer und Jaeger

## Ausbaustufe nach v1: Kommunikation, Aufgaben und Veranstaltungen

Ziel: interne Zusammenarbeit und Feldrueckmeldungen strukturiert in `hege` abbilden

Lieferumfang:

- flexible Rollen- und Empfaengergruppen fuer Sichtbarkeit und Kommunikation
- Reviermeldungen aus dem Feld zu Fuetterungen, Wasserungen und Hochstaenden mit Fotos und Kurztext
- Aufgaben aus Protokollen, Beschluessen oder manueller Planung
- Aufgabenlisten und Kalenderansicht pro Benutzer in der mobilen App
- Veranstaltungen mit Ankuendigung, Treffpunkt, Erinnerungen und optionaler Teilnahmebestaetigung
- WhatsApp- und spaeter Telegram-Anstoss aus der App heraus mit vorbereitetem Nachrichtentext
- Auditierbare Zuordnung zwischen interner Nachricht, Aufgabe, Veranstaltung und externem Messenger-Anstoss

Ergebnis:

- Kommunikation, Organisation und Feldrueckmeldungen laufen nicht mehr nebenbei ueber private Chatverlaeufe, sondern nachvollziehbar ueber `hege`

## Querschnittsthemen

### Qualitaet

- API-Contract-Tests starten bereits in Sprint 0 und werden in Sprint 1 erweitert
- kritische Mobile-User-Flows werden ab Sprint 2 parallel zu den Features abgesichert
- End-to-End-Abnahmetests buendeln die Kernablaeufe in Sprint 4
- visuelle Regressionstests werden fuer zentrale Web-Flows schrittweise ausgebaut

### Sprache und Lokalisierung

- v1 ist fachlich und redaktionell auf Deutsch fuer Oesterreich (`de-AT`) ausgelegt
- Web und Mobile sollen Texte dennoch so strukturieren, dass spaetere zusaetzliche Sprachen moeglich bleiben
- eine verpflichtende zweisprachige Auslieferung ist nicht Teil von v1
- falls nach v1 eine erste Zweitsprache eingefuehrt wird, ist Englisch (`en`) die bevorzugte erste Erweiterung

## Abnahmekriterien fuer v1

- Schriftfuehrer kann eine Sitzung anlegen, bearbeiten und zur Freigabe bringen
- Revier Admin kann ein Protokoll freigeben und veroeffentlichen
- Jaeger kann einen Ansitz starten und beenden
- Jaeger kann Fallwild auch offline vollstaendig erfassen
- freigegebene Protokolle sind mobil lesbar
- alle Daten sind pro Revier getrennt
- kritische Aktionen sind nachvollziehbar protokolliert

## Empfohlene naechste Umsetzung

Wenn unmittelbar weiterentwickelt wird, ist die sinnvollste Reihenfolge:

1. Sprint 0 vollstaendig umsetzen
2. danach Schriftfuehrer-Backend bis zur Protokollfreigabe fertigstellen
3. erst dann die mobile Offline-Fallwildstrecke produktiv machen
4. danach Kommunikation, Aufgaben und Veranstaltungen auf die bestehende Rollen- und Rechtebasis setzen

## Detaillierte Sprint-Backlogs

- [Umsetzungsbacklog](./umsetzungsbacklog.md)
- [Sprint 0 Backlog](./sprint-0-backlog.md)
- [Sprint 1 Backlog](./sprint-1-backlog.md)
