# Reviermanagement-Plattform für Jäger in Österreich

## Zweck dieses Dokuments

Dieses Dokument ist der zentrale Gesamtüberblick für `hege`. Es beschreibt Produktziel, fachliche Module, sichtbare v1-Oberflächen und verweist auf die Detaildokumente.

## Produktziel

`hege` ist als mandantenfähige SaaS pro Revier geplant. Ein Revier oder eine Jagdgesellschaft arbeitet in einem klar getrennten Datenraum.

Es gibt zwei Hauptoberflächen:

- ein Web-Backoffice für Schriftführer und Revier-Admins
- eine mobile App für Jäger im Feld

Die Plattform soll den täglichen Revierbetrieb, die Dokumentation und die interne Abstimmung in einer gemeinsamen Lösung zusammenführen.

## Kernfunktionen

### Ansitz bekanntgeben

- Jäger melden, dass sie auf einem Hochstand oder an einer Position ansitzen
- andere Mitglieder sehen aktive Ansitze im Revier
- Doppelbelegungen erzeugen eine Warnung

### Reviereinrichtungen verwalten

- Hochstände, Fütterungen und weitere Einrichtungen werden mit Standort und Zustand geführt
- Kontrollen und Wartungen bleiben nachvollziehbar

### Fallwild bergen

- KFZ-Wild wird mit Zeitpunkt, Ort, Fotos, Wildart, Geschlecht und Status dokumentiert
- die Erfassung muss mobil und offlinefähig sein

### Sitzungsprotokolle

- Sitzungen werden vorbereitet, protokolliert, versioniert und freigegeben
- freigegebene Protokolle stehen im Web und mobil zur Verfügung

## Erste sichtbare Versionen

### Backend v1 für Schriftführer

Fokus:

- Dashboard
- Sitzungen
- Protokoll-Editor
- Freigabe
- veröffentlichte Protokolle

Details:

- [Backend v1 für Schriftführer](./backend-schriftfuehrer-v1.md)

### Mobile App v1 für Jäger

Fokus:

- Heute-im-Revier
- Ansitz starten und beenden
- Fallwild erfassen
- Reviereinrichtungen lesen
- Protokolle lesen

Details:

- [Mobile App v1 für Jäger](./mobile-jaeger-v1.md)

## Technische Leitlinien

- Monorepo mit `apps/web`, `apps/mobile`, `packages/domain` und einer bestehenden Übergangs-API unter `apps/api`
- zentrale API als fachliche Quelle für Web und Mobile
- Production-Domain `https://hege.app`
- Vercel als Zielhost für Web und API-v1
- PostgreSQL/PostGIS auf Neon und Cloudflare R2 als produktive Zielbasis
- manuelle Aktualisierung oder leichtes Polling statt verpflichtender WebSockets in v1
- Offline-Pufferung in der mobilen App für Ansitz und Fallwild

Details:

- [Architektur](./architektur.md)
- [API v1](./api-v1.md)

## Sprache und Lokalisierung

- v1 ist auf Deutsch für Österreich (`de-AT`) ausgelegt
- sichtbare Produkttexte sollen fachlich österreichische Jagdbegriffe und echte Umlaute verwenden
- v1 liefert keine verpflichtende englische Oberfläche aus
- die technische Struktur soll spätere zusätzliche Sprachen ermöglichen
- falls nach v1 eine erste Zweitsprache eingeführt wird, ist Englisch (`en`) die bevorzugte erste Erweiterung

## Aktueller Repository-Stand

Bereits vorhanden:

- Shared Domain Package mit Typen, Demo-Daten und Fachregeln
- sichtbares Web-Grundgerüst für Dashboard und Fachseiten
- sichtbare Mobile-App mit Kernscreens
- Demo-API mit REST-Ressourcen als Übergangspfad
- lokale Infrastrukturdefinition für PostGIS und MinIO

Noch offen:

- produktive Persistenz
- Authentifizierung und Rollenprüfung
- Medien-Uploads und PDF-Generierung
- produktionsreife Offline-Synchronisierung
- echte Kartenintegration

## Umsetzung

Die konkrete Umsetzungsreihenfolge ist hier beschrieben:

- [Root-Roadmap](../ROADMAP.md)
- [Roadmap und Sprints](./roadmap-v1.md)
- [Dokumentationsübersicht](./README.md)
