# Changelog

Alle relevanten Aenderungen an `hege` werden hier festgehalten.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) und das Projekt nutzt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- Echte Auth-Session mit Login, Refresh, `GET /api/v1/me` und serverseitigem Revierkontext fuer Web und App.
- Neue API-Vertraege fuer `dashboard`, `reviereinrichtungen`, `protokolle`, `sitzungen` und `documents` auf der Web-Schicht eingefuehrt.
- Neue Web-Flows fuer die Sitzungen-Liste, Sitzungsdetail, Freigabe und PDF-Download-Grundlage umgesetzt.
- Mobile Session-Restore, tokenbasiertes Login und zentraler API-Client fuer die Read-Slices eingerichtet.
- Mobile Offline-Queue mit Retry-Status fuer `Ansitz`- und `Fallwild`-Schnellmeldungen eingebaut.
- Playwright deckt jetzt Login, Logout, Rollen-Schutz sowie Sitzungs-Mutation und Freigabe im Web ab.
- Fallwild-Detail und Foto-Upload ueber `GET /api/v1/fallwild/:id` und `POST /api/v1/fallwild/:id/fotos` plus `media_assets` eingefuehrt.
- S3-kompatible Storage-Schicht fuer lokales MinIO und spaeteres R2 eingebaut.
- Preview-Smoke-Skript fuer Login, `me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download hinzugefuegt.
- Mobile Fallwild-Fotoauswahl ueber `expo-image-picker` mit bis zu drei Bibliotheksbildern eingefuehrt.
- Android-Smoke-Helfer fuer Expo, Testbild-Erzeugung und `adb`-basierte Ablaufpruefung ergaenzt.

### Changed

- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web auf read-only Server-Slices umgestellt.
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

- Web-Sidebar um eine sichtbare `Abmelden`-Aktion ergaenzt und den Logout-Flow ueber Cookie-Clear mit Redirect auf `/login` abgesichert.
