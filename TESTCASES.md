# Test Cases

## API Ansitze

### TC-API-ANSITZ-00: Lokale Datenbank bootstrapen

- `docker compose up -d postgres` ausfuehren
- `pnpm --filter @hege/web db:migrate` ausfuehren
- `pnpm --filter @hege/web db:seed` ausfuehren
- Erwartung: Migration laeuft ohne SQL-Fehler durch
- Erwartung: der Seed meldet erfolgreiche Anlage von `users`, `reviere`, `memberships` und `ansitz_sessions`

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
