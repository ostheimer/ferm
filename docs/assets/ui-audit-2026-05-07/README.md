# UI-Audit 2026-05-07 — Visuelle Evidenz

Dieser Ordner sammelt die Screenshots, die zum [UI-Audit vom 2026-05-07](../../ui-audit-2026-05-07.md) gehören.

## Konvention

- Format: JPEG, ~1.400 px Breite, Qualität ausreichend für Lesbarkeit (~150–250 KB).
- Naming: `NN-<finding-kurz>-<kontext>.jpg` mit zweistelliger Sortier-Nummer.

## Empfohlene Auswahl

| Datei | Zeigt | Audit-Finding |
|-------|-------|----------------|
| `01-dashboard-fake-karte.jpg` | Dashboard mit grünem Grid und „Google Maps geplant"-Pill | F-03 |
| `02-sitzungen-e2e-muell.jpg` | Sitzungen-Liste als revier-admin mit 15 Einträgen `E2E Freigabe …` | F-02 |
| `03-sitzungsdetail-rollen-caps.jpg` | Sitzung-Detail mit `AUSGEHER · AO-01`, `JAEGER · LH-07` | F-06 |
| `04-reviereinrichtungen-pill.jpg` | Reviereinrichtungen-Karten mit Status-Pill `wartung-faellig` | F-07 |
| `05-login-engineer-hero.jpg` | Login-Card mit Hero „Backoffice und App jetzt mit echter Session." | F-08 |
| `06-fallwild-e2e-muell.jpg` | Fallwild-Liste mit echtem Reh-Eintrag und mehreren `E2E Gemeinde …` | F-02 |

Bilder werden in einem Folge-Commit ergänzt, sobald das Screenshot-Tooling stabil ist (Chrome-MCP `save_to_disk` lieferte beim ersten Lauf keinen zugreifbaren Pfad zurück; Alternativen: lokales Playwright-Skript oder manuelle Aufnahme).
