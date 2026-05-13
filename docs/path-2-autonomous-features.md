# Pfad-2-Iteration — 10 autonom liefer- und testbare Features

> Stand 2026-05-13: **alle 10 Features ausgeliefert und gemerged**.
> Plus drei P2-Roadmap-Items (P2.2 Rollen-Dashboards, P2.3 Notification-
> Center, P2.5 Onboarding-Wizard) ergänzt. Pfad 2 damit vollständig
> abgeschlossen.

## Kriterien

Features in diesem Plan erfüllen drei Bedingungen:

1. **Implementierbar ohne User-Setup** — keine neuen Auth-Provider,
   keine Tenant-Migrationen, keine externen API-Keys.
2. **Testbar via Unit-Tests + EAS-Sideload / Vercel-Preview** —
   Erfolg ist objektiv verifizierbar (Build grün, Tests grün,
   Playwright-Screenshot stimmt, App startet und Funktion reagiert).
3. **Eigenständig** — keine Inter-Dependencies, jedes ist eine eigene PR.

## Mobile (5)

| ID | Titel | Status | PR |
|----|-------|--------|----|
| **M1** | Filter + Suche **Fallwild-Tab** (Search-Input, Bergungsstatus-/Zeitraum-Chips, Sortier-Toggle) | ✅ | #60 |
| **M2** | Filter + Suche **Reviereinrichtungen** (Search, Typ-Chips, Zustand-Chips) | ✅ | #62 |
| **M3** | Filter + Suche **Ansitze-Tab** (Search, alle/eigene/aktiv-beendet, Datum) | ✅ | #63 |
| **M4** | **Smart Defaults Fallwild-Form** (Wildart-Vorschlag aus History, Standort-Vorschlag aus letzter Position) | ✅ | #66 |
| **M5** | **App-Info-Seite „Über hege"** (Version, Build-Hash, Commit-SHA, Lizenzen, About-Text) | ✅ | #69 |

## Web (5)

| ID | Titel | Status | PR |
|----|-------|--------|----|
| **W1** | **Such-Feld + Filter-Chips** in allen Listen (Sitzungen/Fallwild/Ansitze/Reviereinrichtungen/Mitglieder) | ✅ | #61, #75 (Filter-Chips als Folge) |
| **W2** | **Klickbare Sortier-Spalten-Header** (Sort-Pfeil, ASC/DESC-Toggle) | ✅ | #64 |
| **W3** | **CSV-Export** für Ansitze + Reviereinrichtungen (Pattern aus Fallwild übernehmen) | ✅ | #65 |
| **W4** | **Versions-Timeline** auf Sitzungs-Detail (wer hat wann publiziert) | ✅ | #67 |
| **W5** | **Print-Stylesheet** für Sitzungs-Protokolle (sauberer ad-hoc-Druck) | ✅ | #68 |

## Ergänzungs-Features aus Pfad-2-Roadmap

| ID | Titel | Status | PR |
|----|-------|--------|----|
| **P2.2** | Rollen-spezifische Heute-Dashboards (Mobile) | ✅ | #70 |
| **P2.3** | Notification-Center mit Read/Unread (Mobile + Web) | ✅ | #71, #73 |
| **P2.4** | Web-Filter-Chips für alle Listen (Web-Pendant zu M1-M3) | ✅ | #75 |
| **P2.5** | Onboarding-Wizard (Web, vier Schritte, Pflicht- + optionale Steps) | ✅ | #74 |
| **Compact Hero** | Warteschlangen-Status als kleine Pille im Hero (~150 px gewonnen) | ✅ | #76 |

## Liefer-Rhythmus

Pro Feature ein eigener PR mit Branch `feat/<id>-<kurzname>`. Nach Merge:
- Mobile: EAS-Build (preview) + Sideload via `xcrun devicectl` aufs iPhone
- Web: Vercel-Preview-URL, Screenshot via Playwright

Der User wird am Ende jeder Feature-Auslieferung informiert, kann
jederzeit unterbrechen oder die Reihenfolge ändern.

## Reihenfolge (rückblickend)

1. ✅ **M1** — Fallwild-Filter (größter Impact, 30+ Demo-Einträge)
2. ✅ **W1** — Web-Suche (Pattern-Parität)
3. ✅ **M2** + **M3** — Mobile-Filter komplettieren
4. ✅ **W2** + **W3** — Web-Sortier + Export
5. ✅ **M4** — Smart Defaults (baut auf Filter-Datenflüssen aus M1)
6. ✅ **W4** + **W5** — Sitzungs-Detail-Polish
7. ✅ **M5** — App-Info (Routine)

Plus zusätzliche Pfad-2-Items (P2.2, P2.3, P2.4, P2.5) und das User-Feedback-getriebene **Compact-Hero**-Refactoring.

## Test- und Code-Volumen-Bilanz

| | Vor Pfad-2 | Nach Pfad-2 |
|---|---|---|
| Web-Tests | 163 | 228 |
| Mobile-Tests | 47 | 118 |
| **Summe** | **210** | **346** |
| Neue Komponenten (Web) | – | 4 (ListSearchBar, ListFilterChips, SortableTh, structured-data) |
| Neue Komponenten (Mobile) | – | 11 (FilterChipRow, SearchInput, ViewToggle, EntityMap, PinDetailSheet, ErfassenFab, QueueBadge, ActivityFeed, RoleHeadline, QueueStatusPill, MapStage) |
| Neue Helpers | – | 12 (Filter-, Sort-, Smart-Default-, Dashboard-Role-, Activity-Feed-, Notifications-Read-State-Helper) |
| PR-Anzahl Pfad-2 | – | 18 (#58-#76) |
