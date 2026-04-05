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

### Changed

- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web auf read-only Server-Slices umgestellt.
- Mobile-Dashboard liest `DashboardResponse` und zeigt Queue, naechste Sitzung und letzte Benachrichtigung aus der API.
- Web-Auth, Session-Kontext und Fehlerformat auf echte Token- und JSON-Responses umgestellt.
- Seeds und DB-Schema um Reviereinrichtungen, Kontrollen, Sitzungen, Protokollversionen, Beschluesse, Dokumente und Notifications erweitert.
- Mobile `Ansitz` und `Fallwild` koennen Schnellmeldungen direkt senden oder bei Verbindungsfehlern in die Queue legen.

### Fixed

- Web-Sidebar um eine sichtbare `Abmelden`-Aktion ergaenzt und den Logout-Flow ueber Cookie-Clear mit Redirect auf `/login` abgesichert.
