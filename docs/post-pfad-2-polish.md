# Post-Pfad-2-Polish — PRs #79–#99

> Stand 2026-05-13: alle aufgelisteten PRs gemerged. Diese Iteration hat
> Pfad 2 fortgesetzt mit drei Schwerpunkten — **Pattern-Komplettierung**
> über alle Listen, **API↔UI-Lückenfüller** für die paar Endpoints, die
> bisher nur Mobile bedient hat, und **Code-Review-getriebene Hotfixes**.

## Schwerpunkte

### 1. Pattern-Komplettierung (#79–#90)

Pfad 2 hat Filter/Sort/Suche in einer Teilmenge der Listen eingeführt.
Diese 12 PRs zogen das Pattern konsequent durch — jede Liste auf Web
und Mobile spricht jetzt dieselbe Filter-/Sort-/Suche-Sprache, plus
CSV-Export für alle paperwork-Listen.

| PR | Inhalt |
|----|--------|
| **#79** | 4 Code-Review-Findings aus dem Pfad-2-Audit (a11y, race-conditions) |
| **#80** | Unread-Badge für Benachrichtigungen (Mobile Mehr-Tab + Web Sidebar) |
| **#81** | Heute-Tab-Cards tappable (Activity, Ansitze, Sitzung) — Mobile |
| **#82** | Smart Defaults für Ansitz-Erfassung (Mobile) — Standort + Dauer aus History |
| **#83** | Pull-to-Refresh in Reviereinrichtungen + Mehr-Tab (Mobile) |
| **#84** | CSV-Export für Mitglieder (Web, W3-Erweiterung) |
| **#85** | Sortier-Chips für Mitglieder-Liste (Web) |
| **#86** | Sortier-Chips für Fallwild + Sitzungen + Reviereinrichtungen (Web) |
| **#87** | „Filter zurücksetzen"-Aktion in Empty-States aller Listen (Web) |
| **#88** | CSV-Export für Sitzungen (Web) |
| **#89** | Filter + Sortierung für Protokolle-Liste (Mobile) |
| **#90** | Filter + Sortierung für Aufgaben-Liste in Revierarbeit (Mobile) |

Ergebnis: alle 10 Hauptlisten (5× Web, 5× Mobile) haben jetzt
einheitliches Filter/Suche/Sort-Verhalten. Alle 5 Web-Paperwork-Listen
haben CSV-Export.

### 2. API↔UI-Lückenfüller (#93–#95, #98, #99)

Mehrere API-Endpoints existierten seit Tag 1, hatten aber keine UI.
Schriftführung musste sich auf Mobile-User verlassen — die diese
Endpoints von Hand kuratieren.

| PR | Inhalt | API gab's seit … |
|----|--------|-------------------|
| **#93** | Web-Aufgaben-Liste mit Filter, Sort, Status-Aktionen | Tag 1 (`GET /api/v1/aufgaben`) |
| **#94** | Web-Reviermeldungen-Index mit Filter, Sort, CSV-Export | Tag 1 (`GET /api/v1/reviermeldungen`) |
| **#95** | Web-Aufgaben-Erstellungs-Form mit Assignee-Picker | Tag 1 (`POST /api/v1/aufgaben`) |
| **#98** | Web Reviermeldung → Aufgabe One-Click-Konversion | `sourceType: "reviermeldung"` im Schema seit Tag 1 |
| **#99** | Mobile Reviermeldung → Aufgabe One-Click-Konversion | gleiche API; Mobile-Client hatte `createAufgabe()` seit Tag 1 |

Mit #98/#99 ist der Workflow geschlossen: ein Jäger im Feld kann eine
Meldung absetzen UND direkt eine Aufgabe daraus erzeugen, ohne dass
Backoffice eingreifen muss.

### 3. Hotfixes & Code-Review-Followup (#91, #92, #96, #97)

| PR | Inhalt |
|----|--------|
| **#91** | Umlaute in Revierarbeit-Filter-Labels (Hotfix aus #90: ASCII statt UTF-8 versehentlich gepusht) |
| **#92** | ASCII-Umlaute in `dashboard-role.helpers.ts` (17 Stellen) + Auth-Errors (3 Stellen) |
| **#96** | 3 Code-Review-Findings: CSV-Escape verpasst `\r`, Shared-State-Bug in Aufgaben-Client, ListFilterChips ohne Arrow-Key-Navigation |
| **#97** | Status-Count-Hints in Aufgaben-Chips (`Offen (12) · Erledigt (3) · Alle (18)`) — verhindert silent-disappear von `abgelehnt`/`archiviert` Aufgaben |

## Zwei Code-Review-Rounds

Während dieser Iteration habe ich zweimal explizit den Code-Review-
Subagent über die zuletzt gemergten PRs gejagt:

- **#79** — Audit nach Pfad-2-Abschluss → 4 High-Confidence-Findings,
  alle gefixt.
- **#96** — Audit nach Batch #85–#95 → 3 P1-Findings (Bugs), 2
  Findings zurückgestellt (1 UX-Follow-up wurde dann #97; 1 nicht-
  reachable theoretische Inkonsistenz).

Beide Audits haben echte Bugs gefunden, die zur Zeit-druck-Iteration
gehören. Erkenntnis: nach jedem Batch von 5–10 PRs lohnt sich ein
Audit-Run.

## Test- und Code-Volumen-Bilanz

| | Nach Pfad-2 | Nach Polish |
|---|---|---|
| Web-Tests | 228 | 244 |
| Mobile-Tests | 118 | 147 |
| **Summe** | **346** | **391** |
| Neue Web-Pages | – | 2 (`/app/aufgaben`, `/app/reviermeldungen`) |
| Neue Mobile-Helper | – | 2 (`protokoll-filter.helpers.ts`, `aufgabe-filter.helpers.ts`) |
| Neue CSV-Exporte | 3 (Fallwild, Ansitze, Reviereinrichtungen) | 5 (+ Mitglieder, Sitzungen, Reviermeldungen) |
| PR-Anzahl Polish | – | 21 (#79–#99) |

## Reihenfolge (rückblickend)

1. #79–#83 — Code-Review-Findings + Mobile-Polish-Kleinkram (Tappable
   Cards, Smart Defaults, Pull-to-Refresh, Unread-Badges).
2. #84–#88 — Web-Sort/Filter/CSV-Pattern auf alle Listen ausrollen.
3. #89–#90 — Mobile-Filter-Pattern auf die zwei verbleibenden Listen
   (Protokolle, Aufgaben in Revierarbeit) ziehen.
4. #91–#92 — Umlaute-Hotfixes.
5. #93–#95 — Web-UI für die Mobile-only-APIs (Aufgaben + Reviermeldungen).
6. #96–#97 — Code-Review-Findings + UX-Followup.
7. #98–#99 — Workflow-Loop schließen: Reviermeldung → Aufgabe direkt
   konvertieren, sowohl Web als auch Mobile.

## Folge-Iteration: was offen ist

- **Foto-Upload für Reviermeldung** (Mobile) — explizit als TODO im
  Form-Subtitle: „Fotos folgen im nächsten Medien-Slice." Backend-
  Persistenz noch nicht klar (S3 vs. Vercel Blob), deshalb verschoben.
- **Aufgaben-Detail-Page** (Web) — aktuell nur Card-Summary, kein
  Detail-View mit History/Beschreibung-Full.
- **Mobile Aufgabe-Erstellungs-Form** — Mobile hat zwar `createAufgabe`
  über die Reviermeldung-Konversion (#99), aber keine direkte Stand-
  alone-Form (das Web-Pendant #95 existiert).
- **Bulk-Aktionen** auf Aufgaben (mehrere als erledigt markieren) —
  bisher nur einzelne Status-Updates.
