# Test Cases

## API Ansitze

### TC-API-ANSITZ-00: Lokale Datenbank bootstrapen

- `docker compose up -d postgres` ausfuehren
- `pnpm --filter @hege/web db:migrate` ausfuehren
- `pnpm --filter @hege/web db:seed` ausfuehren
- Erwartung: Migration laeuft ohne SQL-Fehler durch
- Erwartung: der Seed meldet erfolgreiche Anlage von `users`, `reviere`, `memberships`, `ansitz_sessions` und `fallwild_vorgaenge`

### TC-API-ANSITZ-00B: Neon `development` fuer Preview bootstrapen

- `pnpm --filter @hege/web db:migrate` gegen den Neon-Branch `development` ausfuehren
- `pnpm --filter @hege/web db:seed` gegen den Neon-Branch `development` ausfuehren
- Preview-URL oeffnen und `GET /api/v1/me`, `GET /api/v1/ansitze` sowie `/ansitze` pruefen
- Erwartung: die beiden API-Endpunkte antworten mit `200`
- Erwartung: die Seite `/ansitze` rendert ohne Serverfehler und zeigt aktive Ansitze

### TC-API-ANSITZ-00C: Neon `main` fuer Production bootstrapen

- `pnpm --filter @hege/web db:migrate` gegen den Neon-Branch `main` ausfuehren
- `pnpm --filter @hege/web db:seed` gegen den Neon-Branch `main` ausfuehren
- Production-URL oeffnen und `GET /api/v1/me`, `GET /api/v1/ansitze` sowie `/ansitze` pruefen
- Erwartung: die beiden API-Endpunkte antworten mit `200`
- Erwartung: die Seite `/ansitze` rendert ohne Serverfehler und zeigt aktive Ansitze

### TC-API-ANSITZ-01: Dev-Kontext liefert `me`

- Web-App lokal starten
- `GET /api/v1/me` aufrufen
- Erwartung: Benutzer, Membership und Revier werden als JSON zurueckgegeben

### TC-API-ANSITZ-02: Aktive Ansitze lesen

- Web-App lokal starten
- `GET /api/v1/ansitze/live` aufrufen
- Erwartung: nur aktive Ansitze des Dev-Reviers werden als JSON zurueckgegeben

## API Fallwild

### TC-API-FALLWILD-01: Fallwildliste lesen

- Web-App lokal starten
- `GET /api/v1/fallwild` aufrufen
- Erwartung: die Antwort enthaelt die Fallwild-Vorgaenge des aktiven Reviers
- Erwartung: jeder Eintrag liefert Standort, Wildart, Bergungsstatus und Erfassungszeitpunkt

### TC-API-FALLWILD-02: Fallwildvorgang anlegen

- Web-App lokal mit aktiver DB starten
- `POST /api/v1/fallwild` mit gueltigem JSON-Body senden
- Erwartung: der Endpunkt antwortet mit `201`
- Erwartung: der neue Vorgang erscheint anschliessend in `GET /api/v1/fallwild`

### TC-API-FALLWILD-03: CSV-Export abrufen

- Web-App lokal starten
- `GET /api/v1/fallwild/export.csv` aufrufen
- Erwartung: der Endpunkt antwortet mit `200`
- Erwartung: `content-type` ist `text/csv`
- Erwartung: die CSV enthaelt mindestens Kopfzeile sowie die gespeicherten Fallwild-Vorgaenge

## Automatisierte Web-Tests

### TC-AUTO-WEB-01: Unit- und Integrationstests fuer Domain und Web

- `pnpm test` ausfuehren
- Erwartung: `@hege/domain` und `@hege/web` laufen gruen durch
- Erwartung: Route Handler, Services und Query-Schicht in `apps/web` werden per Vitest validiert

### TC-AUTO-WEB-02: E2E- und Visual-Regression lokal

- `docker compose up -d postgres` sicherstellen
- `pnpm test:e2e` ausfuehren
- Erwartung: Playwright bootstrapt eine isolierte lokale E2E-Datenbank
- Erwartung: Desktop- und Mobile-Projekt laufen fuer `Ansitze` und `Fallwild` ohne Browserfehler durch
- Erwartung: Mutationserfolge fuer `Ansitz starten/beenden` sowie `Fallwild erfassen` werden browserbasiert geprueft
- Erwartung: der CSV-Download fuer Fallwild wird automatisiert validiert

### TC-AUTO-WEB-03: Screenshot-Baselines aktualisieren

- `docker compose up -d postgres` sicherstellen
- `pnpm test:e2e:update` ausfuehren
- Erwartung: neue oder geaenderte Screenshot-Baselines werden in `apps/web/e2e/*-snapshots` geschrieben
- Erwartung: visuelle Unterschiede fuer Desktop und Mobile koennen anschliessend im Git-Diff oder Playwright-Report reviewt werden
## Web Ansitze

### TC-WEB-ANSITZ-01: Ansitzseite liest aus der Server-Schicht

- Web-App lokal starten
- Seite `/ansitze` oeffnen
- Erwartung: aktive Ansitze werden in der Tabelle angezeigt
- Erwartung: die Seite rendert ohne direkte Abhaengigkeit auf `demoData` in der UI
- Erwartung: mit laufender DB kommen die Daten aus `ansitz_sessions`

### TC-WEB-ANSITZ-02: Leerer Zustand

- Datenquelle temporaer ohne aktive Ansitze ausfuehren
- Seite `/ansitze` oeffnen
- Erwartung: die Tabelle zeigt `Keine aktiven Ansitze vorhanden.`

### TC-WEB-ANSITZ-03: Read-only Fallback ohne DB

- `HEGE_USE_DEMO_STORE=true` setzen
- Web-App lokal starten
- `/api/v1/me`, `/api/v1/ansitze/live` und `/ansitze` aufrufen
- Erwartung: API und Seite bleiben lesbar, obwohl keine Datenbank aktiv ist

### TC-WEB-ANSITZ-04: Ansitz im Web starten

- Web-App mit aktiver DB starten
- Seite `/ansitze` oeffnen
- Formular `Neuer Ansitz` mit Standortname, Koordinaten und optionaler Notiz ausfuellen
- `Ansitz starten` ausloesen
- Erwartung: `POST /api/v1/ansitze` antwortet mit `201`
- Erwartung: die Erfolgsmeldung erscheint
- Erwartung: die Tabelle und der aktive Zaehler werden nach dem Refresh aktualisiert

### TC-WEB-ANSITZ-05: Ansitz im Web beenden

- Web-App mit mindestens einem aktiven Ansitz starten
- Seite `/ansitze` oeffnen
- Bei einem aktiven Eintrag `Beenden` ausloesen
- Erwartung: `PATCH /api/v1/ansitze/:id/beenden` antwortet mit `200`
- Erwartung: die Erfolgsmeldung erscheint
- Erwartung: der beendete Eintrag verschwindet nach dem Refresh aus der aktiven Tabelle

## Web Fallwild

### TC-WEB-FALLWILD-01: Fallwildseite liest aus der Server-Schicht

- Web-App lokal starten
- Seite `/fallwild` oeffnen
- Erwartung: vorhandene Fallwild-Vorgaenge werden ohne direkte UI-Abhaengigkeit auf `demoData` angezeigt
- Erwartung: Standort, Wildart, Status und Zeitpunkt werden lesbar formatiert

### TC-WEB-FALLWILD-02: Fallwild im Web erfassen

- Web-App mit aktiver DB starten
- Seite `/fallwild` oeffnen
- Formular mit Gemeinde, Lagebezeichnung, Koordinaten, Wildart und Status ausfuellen
- `Fallwild erfassen` ausloesen
- Erwartung: die Erfolgsmeldung erscheint
- Erwartung: der neue Eintrag erscheint nach dem Refresh in der Liste
- Erwartung: der API-Aufruf `POST /api/v1/fallwild` antwortet mit `201`

### TC-WEB-FALLWILD-03: CSV-Export aus dem Web

- Web-App lokal starten
- Seite `/fallwild` oeffnen
- `CSV exportieren` ausloesen
- Erwartung: der Browser laedt eine CSV ueber `/api/v1/fallwild/export.csv`
- Erwartung: die exportierte Datei enthaelt die sichtbaren Fallwild-Eintraege

### TC-WEB-FALLWILD-04: Mobile Browserbreite bleibt bedienbar

- Web-App lokal starten
- Seite `/fallwild` in schmaler Browserbreite oeffnen
- Erwartung: Formular, Liste und Aktionsleiste bleiben ohne horizontales Chaos bedienbar
- Erwartung: kein Hydration- oder Konsolenfehler tritt auf

## Mobile Dashboard

### TC-MOB-DASH-01: Heute im Revier nutzt echte API

- App oeffnen
- Startseite `Heute im Revier` aufrufen
- Erwartung: Reviername und aktive Ansitze werden aus `GET /api/v1/me` und `GET /api/v1/ansitze/live` geladen
- Erwartung: die Karte zeigt echte Daten aus der API statt `demoData`
- Erwartung: manueller Refresh aktualisiert die Werte
- Erwartung: die Offline-Warteschlange bleibt sichtbar

### TC-MOB-DASH-02: Dashboard bei API-Fehler

- API-URL auf einen nicht erreichbaren Host setzen
- Startseite `Heute im Revier` oeffnen
- Erwartung: Lade- oder Fehlerzustand wird angezeigt
- Erwartung: die App bleibt bedienbar

## Mobile Fallwild

### TC-MOB-FALLWILD-01: Fallwildliste laden

- App oeffnen
- Tab `Fallwild` oeffnen
- Erwartung: die Liste wird per `GET /api/v1/fallwild` geladen
- Erwartung: Eintraege oder leerer Zustand werden sauber dargestellt

### TC-MOB-FALLWILD-02: Manuelle Aktualisierung

- Tab `Fallwild` oeffnen
- Pull-to-Refresh oder `Aktualisieren` ausloesen
- Erwartung: die Liste wird neu geladen, ohne dass die App abstuerzt

### TC-MOB-FALLWILD-03: API nicht erreichbar

- API-URL auf einen nicht erreichbaren Host setzen
- Tab `Fallwild` oeffnen
- Erwartung: ein Fehlerzustand wird angezeigt
- Erwartung: die Offline-Warteschlange bleibt sichtbar

## Mobile Ansitze

### TC-MOB-ANSITZ-01: Ansitzliste laden

- App oeffnen
- Tab `Ansitz` oeffnen
- Pruefen, dass die Liste per `GET /api/v1/ansitze/live` geladen wird
- Erwartung: aktive Ansitze werden angezeigt oder ein leerer Zustand wird sauber dargestellt

### TC-MOB-ANSITZ-02: Manuelle Aktualisierung

- Tab `Ansitz` oeffnen
- Pull-to-Refresh ausfuehren oder `Aktualisieren` tippen
- Erwartung: die Liste wird neu geladen, ohne dass die App abstuerzt

### TC-MOB-ANSITZ-03: API nicht erreichbar

- API-URL auf einen nicht erreichbaren Host setzen
- Tab `Ansitz` oeffnen
- Erwartung: Lade- oder Fehlerzustand wird angezeigt, die App bleibt bedienbar
