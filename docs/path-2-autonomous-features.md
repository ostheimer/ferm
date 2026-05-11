# Pfad-2-Iteration — 10 autonom liefer- und testbare Features

> Stand 2026-05-11. Plan vom User abgesegnet (`los`). Iteration nach Pfad-1
> (Visual Polish) und dem Map-First-Rollback. Konkrete Folge auf das
> bestätigte Dashboard-Konzept + Karten-in-Locations-Tabs.

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
| **M1** | Filter + Suche **Fallwild-Tab** (Search-Input, Bergungsstatus-/Zeitraum-Chips, Sortier-Toggle) | in Arbeit | — |
| **M2** | Filter + Suche **Reviereinrichtungen** (Search, Typ-Chips, Zustand-Chips) | offen | — |
| **M3** | Filter + Suche **Ansitze-Tab** (Search, alle/eigene/aktiv-beendet, Datum) | offen | — |
| **M4** | **Smart Defaults Fallwild-Form** (Wildart-Vorschlag aus History, Standort-Vorschlag aus letzter Position) | offen | — |
| **M5** | **App-Info-Seite „Über hege"** (Version, Build-Hash, Commit-SHA, Lizenzen, About-Text) | offen | — |

## Web (5)

| ID | Titel | Status | PR |
|----|-------|--------|----|
| **W1** | **Such-Feld + Filter-Chips** in allen Listen (Sitzungen/Fallwild/Ansitze/Reviereinrichtungen/Mitglieder) | offen | — |
| **W2** | **Klickbare Sortier-Spalten-Header** (Sort-Pfeil, ASC/DESC-Toggle) | offen | — |
| **W3** | **CSV-Export** für Ansitze + Reviereinrichtungen (Pattern aus Fallwild übernehmen) | offen | — |
| **W4** | **Versions-Timeline** auf Sitzungs-Detail (wer hat wann publiziert) | offen | — |
| **W5** | **Print-Stylesheet** für Sitzungs-Protokolle (sauberer ad-hoc-Druck) | offen | — |

## Liefer-Rhythmus

Pro Feature ein eigener PR mit Branch `feat/<id>-<kurzname>`. Nach Merge:
- Mobile: EAS-Build (preview) + Sideload via `xcrun devicectl` aufs iPhone
- Web: Vercel-Preview-URL, Screenshot via Playwright

Der User wird am Ende jeder Feature-Auslieferung informiert, kann
jederzeit unterbrechen oder die Reihenfolge ändern.

## Reihenfolge (Vorschlag)

1. **M1** — Fallwild-Filter (größter Impact, 30+ Demo-Einträge)
2. **W1** — Web-Suche (Pattern-Parität)
3. **M2** + **M3** — Mobile-Filter komplettieren
4. **W2** + **W3** — Web-Sortier + Export
5. **M4** — Smart Defaults (baut auf Filter-Datenflüssen aus M1)
6. **W4** + **W5** — Sitzungs-Detail-Polish
7. **M5** — App-Info (Routine)
