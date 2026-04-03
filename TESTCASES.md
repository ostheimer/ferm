# Test Cases

## API Ansitze

### TC-API-ANSITZ-00: Lokale Datenbank bootstrapen

- `docker compose up -d postgres` ausfuehren
- `pnpm --filter @hege/web db:migrate` ausfuehren
- `pnpm --filter @hege/web db:seed` ausfuehren
- Erwartung: Migration laeuft ohne SQL-Fehler durch
- Erwartung: der Seed meldet erfolgreiche Anlage von `users`, `reviere`, `memberships` und `ansitz_sessions`

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
