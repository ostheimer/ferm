# Übergabe — hege

**Datum:** 2026-05-14
**Branch:** `main` (aktueller Stand nach PRs #79–#104)
**Plattform:** `https://hege.app` (produktiv auf Vercel)

---

## Was zuletzt fertiggestellt wurde

### Post-Pfad-2-Polish-Iteration (PRs #79–#104, 2026-05-12 bis 2026-05-13)

#### Pattern-Komplettierung (#79–#90)

- **#79** — 4 Code-Review-Findings aus dem Pfad-2-Audit behoben (a11y, Race-Conditions).
- **#80** — Unread-Badge für Benachrichtigungen auf Mobile Mehr-Tab und Web Sidebar.
- **#81** — Tappable Today-Tab-Cards (Activity, Ansitze, Sitzung) in der Mobile-App.
- **#82** — Smart Defaults für Ansitz-Erfassung: Standort und Dauer aus History.
- **#83** — Pull-to-Refresh in Reviereinrichtungen und Mehr-Tab (Mobile).
- **#84** — CSV-Export für die Mitglieder-Liste (Web).
- **#85** — Sortier-Chips für die Mitglieder-Liste (Web).
- **#86** — Sortier-Chips für Fallwild, Sitzungen und Reviereinrichtungen (Web).
- **#87** — „Filter zurücksetzen"-Aktion in Empty-States aller Web-Listen.
- **#88** — CSV-Export für Sitzungen (Web).
- **#89** — Filter und Sortierung für die Protokolle-Liste (Mobile).
- **#90** — Filter und Sortierung für die Aufgaben-Liste in Revierarbeit (Mobile).

Ergebnis: alle zehn Hauptlisten (fünf Web, fünf Mobile) haben einheitliches Filter/Sort/Suche-Verhalten. Alle fünf Web-Paperwork-Listen haben CSV-Export.

#### Hotfixes und Code-Review (#91, #92, #96, #97)

- **#91** — Umlaute in Revierarbeit-Filter-Labels korrigiert (ASCII statt UTF-8 war versehentlich gepusht).
- **#92** — ASCII-Umlaute in `dashboard-role.helpers.ts` (17 Stellen) und Auth-Errors (3 Stellen) behoben.
- **#96** — 3 P1-Bugs: CSV-Escape verpasste `\r`, Shared-State-Bug im Aufgaben-Client, `ListFilterChips` ohne Arrow-Key-Navigation.
- **#97** — Status-Count-Hints in Aufgaben-Filter-Chips: „Offen (12) · Erledigt (3) · Alle (18)".

#### API↔UI-Lückenfüller (#93–#95, #98, #99)

- **#93** — Web-Aufgaben-Liste mit Filter, Sort und Statusaktionen (`/app/aufgaben`).
- **#94** — Web-Reviermeldungen-Index mit Filter, Sort und CSV-Export (`/app/reviermeldungen`).
- **#95** — Web-Aufgaben-Erstellungsformular mit Assignee-Picker.
- **#98** — Web: Reviermeldung → Aufgabe One-Click-Konversion.
- **#99** — Mobile: Reviermeldung → Aufgabe One-Click-Konversion.

#### Dokumentation und neue Web-Pages (#100–#103)

- **#100** — Post-Pfad-2-Polish tabellarisch festgehalten in `docs/post-pfad-2-polish.md`.
- **#101** — Aufgaben-Detail-Page (`/app/aufgaben/[id]`) mit vollständiger Beschreibung, Assignees und Source-Link zur Reviermeldung.
- **#102** — Status-Mutation für Reviermeldungen über Karten-Dropdown (`PATCH /api/v1/reviermeldungen/[id]` hatte keine UI).
- **#103** — Aufgaben-Edit-Form auf der Detail-Page (Titel, Beschreibung, Priorität, Fälligkeit, Assignee).

#### Code-Review-Followup (#104)

- **#104** — 5 Findings (4× P1, 1× P2) aus Batch-Audit #97–#103 behoben:
  - Destructive Assignee-Write auf Edit-Form behoben (3 Assignees wurden auf 1 zurückgesetzt).
  - 4 weitere P1-Bugs bereinigt.

---

## Produktiver Zustand

| Komponente | Status |
|-----------|--------|
| Web-Backoffice `https://hege.app` | produktiv auf Vercel |
| Neon PostgreSQL (main-Branch) | produktiv |
| Cloudflare R2 | produktiv |
| Mobile-App (Expo) | produktiv, letzter Smoke 2026-05-05 |
| Fallwild-Foto-Upload gegen Production | bestätigt 2026-04-26 |
| Face-ID-Flow auf iPhone | bestätigt 2026-05-06 |

### Vitest-Abdeckung (Stand nach PR #104)

| Paket | Tests |
|-------|-------|
| `@hege/web` | 244 |
| `@hege/mobile` | 147 |
| **Gesamt** | **391** |

---

## Offene Arbeit

### Sprint 4 — noch nicht umgesetzt

- **Mobile Standalone-Aufgaben-Erstellungsformular**: Web hat `/app/aufgaben/neu` (PR #95); Mobile hat nur den Konversionspfad über Reviermeldung (PR #99), aber kein eigenständiges Erstellen-Form.
- **Foto-Upload für Reviermeldungen** (Mobile): Im Form-Subtitle explizit als TODO markiert. Backend-Persistenz (S3 vs. Vercel Blob) noch ungeklärt.
- **Bulk-Aktionen auf Aufgaben**: bisher nur Einzel-Status-Updates; kein Mehrfach-Markieren.

### UI-Audit 2026-05-07 — kritische offene Findings

| ID | Titel | Schwere |
|----|-------|---------|
| F-01 | Sidebar zeigt rollenfremde Links ohne Hinweis | Kritisch |
| F-03 | Backoffice-Karte ist ein Fake-Mockup | Kritisch |
| F-14 | Mobile-Karte ist hartcodiert | Kritisch |
| F-04 | Sitzung-Detail editierbar trotz Status `freigegeben` | Hoch |
| F-05 | Sitzungs-Detail-Link ohne `/app`-Prefix (Auth-Lücke?) | Hoch |
| F-12 | 6 Bottom-Tabs überschreitet Apple-HIG-Empfehlung | Hoch |
| F-13 | Login-Wortmarke ist Bildmontage statt Logo-Asset | Hoch |
| F-21 | Keine geteilten Design-Tokens (Web vs. Mobile) | Hoch |

Vollständige Findings: [docs/ui-audit-2026-05-07.md](./docs/ui-audit-2026-05-07.md)

### GIP und Standort

- GIP-Bounding-Box noch nicht mit dem tatsächlichen Revier abgeglichen.
- Production-Fallwild-Standortauflösung mit Google-Server-Key und gebündeltem GIP-Index im iPhone-Smoke noch ausständig.

### Mobile und E2E

- Mobile-E2E-Strategie über den dokumentierten Geräte-Smoke hinaus noch nicht festgelegt.
- Android-Emulator-Smoke noch nicht durchgelaufen.

---

## Nächste empfohlene Schritte

1. **F-01** schließen — Sidebar rollen-aware filtern (höchste Auswirkung auf Demo-Tauglichkeit).
2. **F-03 / F-14** schließen — echte Google Maps im Web- und Mobile-Client.
3. **Mobile Standalone-Aufgaben-Erstellungsformular** fertigstellen.
4. **iPhone-Smoke auf Production** wiederholen: Foto-Upload, Standortauflösung, leere Queue.
5. **GIP-Bounding-Box** mit dem tatsächlichen Revier abgleichen.

---

## Verifikationsbefehle

```bash
# TypeScript-Check
pnpm typecheck

# Unit-Tests
pnpm test

# E2E-Tests (erfordert laufende lokale E2E-Datenbank)
pnpm test:e2e

# Preview-Smoke gegen einen Vercel-Preview-Deploy
pnpm --filter @hege/web smoke:preview -- <preview-url>

# Release-Check gegen Production
pnpm --filter @hege/web smoke:release -- https://hege.app
```
