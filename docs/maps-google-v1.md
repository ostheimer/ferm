# Maps Google v1

## Ziel

Kartenfunktionen in Web und Mobile sollen sich fachlich und visuell an Google Maps orientieren. Ziel ist eine vertraute Bedienung für Standortsuche, Marker, aktuelle Position und Revierüberblick.

Dieses Dokument beschreibt das Zielbild und die fachlichen Anforderungen. In diesem Sprint wird kein Google-Maps-SDK eingebaut und keine produktive Kartenintegration aktiviert.

## Grundprinzipien

- Google Maps ist die Zielreferenz für Karteninteraktion, Marker-Verhalten und Standortsuche
- Web und Mobile nutzen dieselben fachlichen Standortdaten
- alle Kartenobjekte bleiben pro `revier_id` getrennt
- Standortdaten werden nur gespeichert, wenn sie fachlich zu einer Ressource gehören
- Kartenfunktionen dürfen auch ohne Standortfreigabe nutzbar bleiben
- manuelle Standortwahl bleibt immer möglich

## Zielbild Web

Das Web-Backend nutzt Karten vor allem für Überblick und Verwaltung.

Wichtige Anwendungsfälle:

- Reviereinrichtungen im Revier anzeigen
- aktive Ansitze räumlich einordnen
- Fallwild-Vorgänge und Reviermeldungen prüfen
- Standorte bei Sitzungen, Veranstaltungen oder Aufgaben setzen
- Reviergrenzen als Orientierung anzeigen
- Detailansichten aus Markern öffnen

Die Karte ist im Web ein Arbeits- und Kontrollwerkzeug. Tiefe Kartenbearbeitung, Vermessung und Routing sind nicht Ziel von v1.

## Zielbild Mobile

Die mobile App nutzt Karten vor allem im Feld.

Wichtige Anwendungsfälle:

- aktuelle Position anzeigen
- nahe Reviereinrichtungen finden
- Ansitzstandort auswählen
- Fallwild-Standort erfassen
- Reviermeldung mit Standort absetzen
- Zielort aus einer Aufgabe oder Veranstaltung öffnen
- bei schlechtem Netz eine manuelle Standortbeschreibung ergänzen

Die mobile Karte muss mit schlechter Verbindung umgehen können. Kernaktionen dürfen nicht davon abhängen, dass Kartenkacheln oder Suchergebnisse sofort geladen werden.

## Nicht in Scope für diesen Sprint

- Einbau von Google Maps JavaScript API, Maps SDK for iOS oder Maps SDK for Android
- produktive API-Key-Anlage oder Billing-Konfiguration
- Migration bestehender Standortdaten
- Offline-Kartenpakete
- Turn-by-turn-Navigation
- automatische Routenplanung
- Live-Tracking von Mitgliedern
- komplexe Reviergrenzen-Bearbeitung

## Marker-Typen

Marker sollen auf beiden Plattformen konsistent sein. Farben und Icons dürfen plattformspezifisch umgesetzt werden, müssen aber dieselbe fachliche Bedeutung tragen.

### Reviereinrichtungen

Typische Marker:

- `hochstand`
- `fütterung`
- `salzlecke`
- `kirrung`
- `wildkamera`
- `sammelplatz`
- `sonstige_einrichtung`

Status:

- `ok`
- `kontrolle_fällig`
- `mangel`
- `gesperrt`
- `archiviert`

Marker-Verhalten:

- kurzer Titel direkt sichtbar
- Status über Farbe oder Badge
- Detailöffnung mit Typ, Zustand, letzter Kontrolle und nächster Aktion

### Ansitze

Typische Marker:

- aktiver Ansitz
- eigener aktiver Ansitz
- beendeter Ansitz
- geplanter Ansitz
- Konfliktwarnung bei Doppelbelegung

Marker-Verhalten:

- aktive Ansitze werden deutlich hervorgehoben
- eigene Ansitze sind klar unterscheidbar
- abgeschlossene Ansitze werden in normalen Überblickskarten nicht dauerhaft prominent angezeigt

### Fallwild

Typische Marker:

- neuer Fallwild-Vorgang
- in Bearbeitung
- erledigt
- mit Fotos
- exportiert oder gemeldet

Marker-Verhalten:

- genaue Position nur für berechtigte Rollen
- Detailöffnung mit Wildart, Zeitpunkt, Status und Fotohinweis
- keine öffentliche oder revierübergreifende Sichtbarkeit

### Reviermeldungen

Typische Marker:

- Schaden
- Sichtung
- Gefahr oder Sperre
- Mangel an Einrichtung
- allgemeiner Hinweis

Marker-Verhalten:

- Meldungen können zeitlich auslaufen
- relevante Meldungen können zu Aufgaben führen
- geschlossene Meldungen werden im Standard nur gefiltert angezeigt

### Veranstaltungen und Treffpunkte

Typische Marker:

- Treffpunkt
- Arbeitseinsatz
- Gesellschaftsjagd
- Sitzung
- Schulung oder Termin

Marker-Verhalten:

- Terminbezug ist direkt erkennbar
- Detailöffnung zeigt Uhrzeit, Empfängergruppe und Teilnahmehinweis
- sensible Termine sind nur für adressierte Mitglieder sichtbar

### Nutzerposition und Suchergebnis

Typische Marker:

- aktuelle Geräteposition
- manuell gesetzter Pin
- ausgewähltes Suchergebnis
- temporärer Vorschau-Pin

Diese Marker sind zunächst klientseitig. Sie werden erst gespeichert, wenn der Nutzer eine fachliche Aktion bestätigt.

## Standortsuche

Die Standortsuche soll Google-Maps-ähnlich funktionieren und trotzdem fachlich kontrolliert bleiben.

### Suchquellen

- aktuelle Geräteposition nach ausdrücklicher Berechtigung
- Adresse oder Ortsname
- Koordinaten in Dezimalgrad
- bestehende Reviereinrichtung
- bestehender Treffpunkt oder Veranstaltungsort
- manueller Pin auf der Karte

### Suchverhalten

- Standardsprache ist Deutsch für Österreich (`de-AT`)
- Standardsuchraum ist Österreich, zusätzlich möglichst der aktuelle Revierbereich
- Suchergebnisse zeigen Name, Adresse und grobe Entfernung zum Reviermittelpunkt
- bei mehreren Treffern muss der Nutzer aktiv auswählen
- bei ungenauen Treffern wird ein manueller Pin angeboten
- Reverse Geocoding darf eine lesbare Ortsbeschreibung ergänzen, ersetzt aber nicht die Koordinate

### Datenübernahme

Beim Speichern einer fachlichen Ressource werden maximal übernommen:

- `latitude`
- `longitude`
- `accuracy_meters`, falls vorhanden
- `address_label`, falls vom Nutzer bestätigt
- `place_id`, falls rechtlich und technisch zulässig
- `source`, zum Beispiel `device_gps`, `search`, `manual_pin` oder `existing_resource`

Nicht gespeichert werden sollen reine Suchtexte, verworfene Treffer und Bewegungsverläufe.

## API-Key- und Env-Anforderungen

Für eine spätere Umsetzung werden getrennte Keys je Laufzeit und Restriktion erwartet. Die genauen Namen können beim Einbau angepasst werden, sollen aber diese Trennung abbilden.

### Web

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- nur für Browser-Nutzung
- Einschränkung über HTTP-Referrer
- API-Einschränkung auf tatsächlich genutzte Web-APIs

### Mobile

- `GOOGLE_MAPS_IOS_API_KEY`
- Einschränkung über iOS Bundle Identifier
- `GOOGLE_MAPS_ANDROID_API_KEY`
- Einschränkung über Android Package Name und Signing Fingerprint

Wenn Expo eine öffentliche Runtime-Variable benötigt, darf sie nur einen entsprechend eingeschränkten mobilen Key enthalten.

### Server

- `GOOGLE_MAPS_SERVER_API_KEY`
- nur serverseitig nutzbar
- Einschränkung über Server/IP oder geeignete Cloud-Restriktion
- API-Einschränkung auf serverseitige Webservices wie Geocoding oder Places

Server-Keys dürfen nie an Web- oder Mobile-Clients ausgeliefert werden.

### Gemeinsame Konfiguration

- `GOOGLE_MAPS_REGION=AT`
- `GOOGLE_MAPS_LANGUAGE=de-AT`
- Budget- und Quota-Warnungen im Google-Cloud-Projekt
- getrennte Keys für Development, Preview und Production
- keine echten Production-Keys in `.env.example`, Logs oder Test-Snapshots

Voraussichtlich relevante Google-Dienste:

- Maps JavaScript API für Web-Karten
- Maps SDK for iOS
- Maps SDK for Android
- Places API oder Places SDK für Standortsuche
- Geocoding API für Adressauflösung und Reverse Geocoding

Welche Dienste tatsächlich aktiviert werden, wird erst beim technischen Einbau entschieden.

## Datenschutz und Logging

Standortdaten sind im Revierkontext besonders sensibel. Die Kartenintegration muss deshalb datenminimierend ausgelegt werden.

### Speicherung

- genaue Koordinaten nur speichern, wenn sie für Ansitz, Fallwild, Reviereinrichtung, Reviermeldung, Aufgabe oder Veranstaltung benötigt werden
- aktuelle Geräteposition nicht dauerhaft speichern, solange keine fachliche Ressource daraus erzeugt wird
- Bewegungsprofile und Live-Tracking sind nicht Teil von v1
- bei öffentlichen oder breit sichtbaren Übersichten kann eine reduzierte Genauigkeit fachlich sinnvoll sein

### Protokollierung

- keine API-Keys loggen
- keine vollständigen Geocoding-URLs loggen, wenn darin Schlüssel oder Suchtexte enthalten sind
- keine verworfenen Suchanfragen dauerhaft speichern
- Audit-Logs erfassen fachliche Aktionen, nicht jede Kartenbewegung
- Fehlerlogs dürfen technische Fehler enthalten, aber keine unnötigen Standortdetails

### Berechtigungen und Transparenz

- Geräte-Standortfreigabe muss freiwillig und widerrufbar sein
- Nutzer müssen sehen, wofür ein Standort gespeichert wird
- Google als externer Kartenanbieter ist in Datenschutzhinweisen zu berücksichtigen
- WhatsApp, Messenger oder andere externe Kanäle erhalten keine Kartenrohdaten aus der Kernlogik

## Datenmodell-Richtung

Das bestehende Fachmodell soll Standortdaten nicht als isolierte Kartendaten speichern, sondern an Ressourcen hängen.

Mögliche wiederverwendbare Struktur:

- `latitude`
- `longitude`
- `accuracy_meters`
- `address_label`
- `place_id`
- `location_source`
- `created_by_membership_id`
- `revier_id`

Für komplexere Fälle kann später eine eigene Tabelle `geo_locations` entstehen. Für v1 ist das eine Richtung, keine verbindliche Migration.

## Akzeptanzkriterien für spätere Umsetzung

- Kartenobjekte sind pro Revier getrennt
- Marker-Typen sind in Web und Mobile fachlich konsistent
- Standortsuche funktioniert über Adresse, aktuelle Position und manuellen Pin
- API-Keys sind nach Plattform und Umgebung getrennt
- Server-Keys werden nie an Clients ausgeliefert
- Logs enthalten keine Schlüssel und keine unnötigen Standortdaten
- ohne Standortfreigabe bleibt manuelle Standortwahl möglich
- im aktuellen Sprint wird kein SDK eingebaut
