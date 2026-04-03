# Reviermanagement-Plattform für Jäger in Österreich

## Zielbild

`ferm` ist als mandantenfähige SaaS pro Revier geplant. Es gibt zwei Hauptoberflächen:

- ein Web-Backoffice für Revier-Admins und Schriftführer
- eine mobile App für Jäger im Feld

Der erste Stand im Repository bildet das Zielbild als entwickelbares Monorepo ab und implementiert die Kernbereiche mit gemeinsamem Domain-Modell und Demo-Daten.

## Fachmodule

### Ansitz bekanntgeben

- Jäger melden einen aktiven Ansitz mit Standort, Uhrzeit und optionaler Notiz.
- Gleichzeitige Belegung desselben Hochstands erzeugt eine Warnung.
- Web und Mobile zeigen aktive Ansitze und Konflikte.
- Die API stellt Live-Daten und ein WebSocket-Gateway bereit.

### Reviereinrichtungen verwalten

- Hochstände, Fütterungen und andere Einrichtungen werden georeferenziert geführt.
- Zustand, Kontrollen und Wartungseinträge sind Teil des Modells.
- Das Web-Backoffice zeigt Einrichtungen als Verwaltungsansicht, die App als Einsatzansicht.

### Fallwild bergen

- Fallwild wird mit Zeit, Ort, Wildart, Geschlecht, Altersklasse, Status und Fotos modelliert.
- Die Mobile-App enthält eine Offline-Warteschlange als Startpunkt für spätere Synchronisierung.
- Die API kann Fallwild-Einträge ausgeben und als CSV exportieren.

### Sitzungsprotokolle

- Sitzungen enthalten Teilnehmer, Versionen, Beschlüsse und Anhänge.
- Freigabe wird über den Status `entwurf` zu `freigegeben` modelliert.
- Veröffentlichte Protokolle sind als Dokument-Asset vorgesehen.

## Technische Architektur

### Monorepo

- `apps/api`: NestJS
- `apps/web`: Next.js App Router
- `apps/mobile`: Expo Router
- `packages/domain`: Shared Types, Regeln, Demo-Daten

### Datenhaltung

- Aktuell: In-Memory-Demo-Store in der API
- Vorbereitet: PostgreSQL/PostGIS und S3-kompatibler Storage über `.env.example` und `docker-compose.yml`

### Echtzeit und Offline

- Live-Ansitze werden serverseitig über ein WebSocket-Gateway publiziert.
- Mobile Offline-Erfassungen laufen vorerst über `AsyncStorage` und eine Warteschlange.

## Implementierungsstatus im Repository

- gemeinsames Domain-Modell für Rollen, Reviere, Ansitze, Einrichtungen, Fallwild und Sitzungen
- Fachregeln für Konflikterkennung, Fallwild-Erstellung, Ansitz-Beendigung und Protokollfreigabe
- NestJS-Endpunkte für Dashboard, Ansitze, Reviereinrichtungen, Fallwild und Sitzungen
- Next.js-Backoffice mit Dashboard und Fachseiten
- Expo-App mit tabbasierter Feldoberfläche
- lokale Infrastrukturdefinition für PostGIS und MinIO

## Offene nächste Schritte

- echte Persistenz und Authentifizierung einziehen
- Medien-Upload und PDF-Generierung implementieren
- serverseitige Rechteprüfung pro Rolle ergänzen
- echte Kartenintegration mit MapLibre im Web und auf Mobile ergänzen
- Push-Notifications und Delta-Sync vom Demo-Modus auf produktive Jobs umstellen
