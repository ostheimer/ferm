# Changelog

Alle relevanten Aenderungen an `hege` werden hier festgehalten.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) und das Projekt nutzt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- Web-Seiten fuer Aufgaben (`/app/aufgaben`): Liste mit Filter/Sort/Statusaktionen, Erstellungsformular mit Assignee-Picker, Detail-Page mit Source-Link zur Reviermeldung und Edit-Form (PRs #93, #95, #101, #103).
- Web-Seiten fuer Reviermeldungen (`/app/reviermeldungen`): Index mit Filter/Sort/CSV-Export und Status-Mutation ueber Karten-Dropdown (PRs #94, #102).
- Reviermeldung zu Aufgabe One-Click-Konversion im Backoffice und in der Mobile-App (PRs #98, #99).
- Filter/Sort/Suche-Pattern einheitlich auf alle zehn Hauptlisten ausgerollt (PRs #84-#90); alle fuenf Web-Paperwork-Listen haben CSV-Export.
- Unread-Badge fuer Benachrichtigungen auf Mobile Mehr-Tab und Web Sidebar (PR #80).
- Tappable Today-Tab-Cards auf Mobile (Activity, Ansitze, Sitzung) (PR #81).
- Smart Defaults fuer Ansitz-Erfassung auf Mobile: Standort und Dauer aus History (PR #82).
- Pull-to-Refresh in Reviereinrichtungen und Mehr-Tab auf Mobile (PR #83).
- „Filter zuruecksetzen"-Aktion in Empty-States aller Web-Listen (PR #87).
- Status-Count-Hints in Aufgaben-Filter-Chips: „Offen (12) · Erledigt (3) · Alle (18)" (PR #97).
- Post-Pfad-2-Polish-Dokumentation in `docs/post-pfad-2-polish.md` (PR #100).
- Aufgaben-Detail-Page (`/app/aufgaben/[id]`) mit Source-Link zur Reviermeldung (PR #101).
- Status-Mutation fuer Reviermeldungen via Karten-Dropdown (PR #102).
- Aufgaben-Edit-Form auf der Detail-Page (PR #103).
- Echte Auth-Session mit Login, Refresh, `GET /api/v1/me` und serverseitigem Revierkontext fuer Web und App.
- Neue API-Vertraege fuer `dashboard`, `reviereinrichtungen`, `protokolle`, `sitzungen` und `documents` auf der Web-Schicht eingefuehrt.
- Public-Web-Block mit Landing auf `/`, Pricing-CTAs, Login-/Registrieren-Einstieg und Onboarding-Redirects fuer `/app` und `/app/setup` vorbereitet.
- Neue Web-Flows fuer die Sitzungen-Liste, Sitzungsdetail, Freigabe und PDF-Download-Grundlage umgesetzt.
- Mobile Session-Restore, tokenbasiertes Login und zentraler API-Client fuer die Read-Slices eingerichtet.
- Mobile Offline-Queue mit Retry-Status fuer `Ansitz`- und `Fallwild`-Schnellmeldungen eingebaut.
- Playwright deckt jetzt Login, Logout, Rollen-Schutz sowie Sitzungs-Mutation und Freigabe im Web ab.
- Fallwild-Detail und Foto-Upload ueber `GET /api/v1/fallwild/:id` und `POST /api/v1/fallwild/:id/fotos` plus `media_assets` eingefuehrt.
- S3-kompatible Storage-Schicht fuer lokales MinIO und spaeteres R2 eingebaut.
- Preview-Smoke-Skript fuer Public Web, `POST /api/v1/auth/login`, `GET /api/v1/me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download hinzugefuegt.
- GitHub-Workflow fuer den Preview-Smoke bei erfolgreichen Preview-Deployments und manuellen `workflow_dispatch` hinzugefuegt.
- Mobile Fallwild-Fotoauswahl ueber `expo-image-picker` mit bis zu drei Bibliotheksbildern eingefuehrt.
- Android-Smoke-Helfer fuer Expo, Testbild-Erzeugung und `adb`-basierte Ablaufpruefung ergaenzt.
- Seed-Account fuer Andreas Ostheimer als Admin mit Username-Login eingefuehrt.

### Changed

- Login-Vertrag auf `identifier` plus vierstellige `pin` erweitert und serverseitig auf E-Mail oder Username aufgeloest.
- Login-Oberflaechen in Web und App ohne sichtbare Demo-Konten-Hinweise umgestellt.
- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web auf read-only Server-Slices umgestellt.
- Public Landing und Onboarding-Redirects fuer Gast-, Login- und Setup-Pfade als neue Sprint-1.5-Teilflaeche eingefuehrt.
- Mobile-Dashboard liest `DashboardResponse` und zeigt Queue, naechste Sitzung und letzte Benachrichtigung aus der API.
- Web-Auth, Session-Kontext und Fehlerformat auf echte Token- und JSON-Responses umgestellt.
- Seeds und DB-Schema um Reviereinrichtungen, Kontrollen, Sitzungen, Protokollversionen, Beschluesse, Dokumente und Notifications erweitert.
- Mobile `Ansitz` und `Fallwild` koennen Schnellmeldungen direkt senden oder bei Verbindungsfehlern in die Queue legen.
- Mobile `Ansitz` und `Fallwild` wurden auf echte Eingabeformulare mit Queue-Fallback umgestellt.
- Der lokale Playwright-Harness setzt die E2E-Datenbank jetzt vollstaendig zurueck und startet die Web-App ohne Wiederverwendung alter Test-Server.
- Seeds und DB-Schema erweitern Fallwild jetzt um `media_assets` als generische Medienbasis.
- Die Mobile-Offline-Queue verarbeitet Fallwild jetzt als Create-zu-Upload-Kette mit `pending`, `syncing`, `uploading`, `failed` und `conflict`.
- Das Mobile-Dashboard zeigt Queue-Typ, Status, Fehlermeldung und Verwerf-Aktion fuer fehlgeschlagene Eintraege.
- Der lokale Schnellstart fuer Web/API umfasst jetzt auch ein wiederholbares Storage-Setup fuer MinIO.

### Fixed

- CSV-Escape fuer Carriage-Return (`\r`) in Export-Hilfsfunktionen korrigiert (PR #96).
- Shared-State-Bug im Aufgaben-Client behoben: mehrere Formulare teilten denselben React-State (PR #96).
- Destructive Assignee-Write auf der Aufgaben-Edit-Form behoben: Assignees wurden beim Oeffnen des Formulars auf den ersten zurueckgesetzt (PR #104).
- Umlaute in Revierarbeit-Filter-Labels und `dashboard-role.helpers.ts` auf UTF-8 korrigiert (PRs #91, #92).
- `ListFilterChips` ohne Arrow-Key-Navigation nachgezogen (PR #96).
- Vier weitere P1-Bugs aus Batch-Audit #97-#103 behoben (PR #104).
- Web-Sidebar um eine sichtbare `Abmelden`-Aktion ergaenzt und den Logout-Flow ueber Cookie-Clear mit Redirect auf `/login` abgesichert.
- Login-Placeholder in Web und App zeigen keine konkreten Seed-Zugangsdaten mehr an.
- Production-Fallback fuer Legacy-Schema eingebaut, damit Login ohne `users.username` und Fallwild-Reads ohne `media_assets` nicht mehr mit `500` scheitern.
- Fallwild-Reads brechen ohne konfigurierte Storage-Public-URL nicht mehr mit `500`, sondern liefern `photos: []`.
