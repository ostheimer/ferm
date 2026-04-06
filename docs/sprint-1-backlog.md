# Sprint 1 Backlog

## Sprintziel

Die erste nutzbare Web-Version fuer Schriftfuehrer und Revier-Admins soll nicht nur fachlich komplett, sondern reproduzierbar abgesichert sein. Der aktuelle Restblock ist deshalb kein neuer Editor-Sprint mehr, sondern Sprint-1-Haertung.

Sprint 1 setzt Sprint 0 als abgeschlossen voraus.

## Status

- Dashboard, Sitzungsliste, Sitzungsdetail, Protokoll-Leseansicht, Freigabe und PDF-Basis sind umgesetzt.
- Auth, Rollen, Revier-Scope und Dokument-Downloads laufen produktiv ueber `apps/web`.
- Offener Sprint-1-Rest liegt in Tests, Preview-Smoke, Dokumentation und den letzten Regressionen rund um Protokolle und Downloads.

## Bereits umgesetzt

- Web-Backoffice fuer Schriftfuehrer und Revier-Admins
- Dashboard
- Sitzungsliste und Sitzungsdetail
- Versionierung und Freigabe-Workflow
- PDF-Download-Grundlage
- Read-only-Lageuebersicht fuer Ansitze und Fallwild

## Restscope in Sprint 1

- Playwright fuer Dashboard, Reviereinrichtungen, Protokoll-Liste, Protokoll-Detail und Dokument-Download
- Preview-Smoke-Checks gegen jede PR-URL
- manuelle Abnahme fuer Desktop und Mobile-Viewport
- Dokumentation und Testfaelle auf den aktuellen Implementierungsstand ziehen

## Sprint 1.5: Public Web und Onboarding

### Ziel

Die oeffentliche Produktseite und der erste Onboarding-Einstieg sind browserseitig und per Smoke abgesichert.

### Tasks

- Public Landing auf `/` mit Pricing-CTAs und Login-Zugang absichern
- Login-Redirect auf `/app` und Setup-Redirect auf `/app/setup` testen
- `toSafePostAuthPath` und die Auth-Guards fuer `/login`, `/registrieren` und `/app`-Ziele absichern
- Preview-Smoke um `/`, `/login`, `/registrieren` und `GET /api/v1/me` erweitern

Akzeptanzkriterien:

- Gaeste sehen zuerst die Public Landing
- Pricing-CTAs zeigen auf die richtigen Ziele
- eingeloggte Nutzer landen im App-Block
- die Setup-Strecke ist als Redirect-Contract dokumentiert

## Nicht in Scope

- neue Fachmodule wie Aufgaben, Nachrichten oder Veranstaltungen
- komplexe Reviereinrichtungsbearbeitung im Web
- native Mobile-E2E ausserhalb des Android-Smoke-Standards
- digitale Signaturen oder Behoerdenexporte

## Reihenfolge fuer den Restblock

1. Public-Web- und Onboarding-Contracts schliessen
2. Web-E2E fuer Dashboard, Reviereinrichtungen, Protokolle und Downloads schliessen
3. Preview-Smoke als festen Zwischencheck zwischen Local und Production verankern
4. Dokumentation, TESTCASES und manuelle Abnahme angleichen
5. danach Sprint-3-Medien- und Queue-Themen auf denselben Haertungsstandard ziehen

## Epic S1-H1: Web-Haertung

### Ziel

Die produktiven Schriftfuehrer-Seiten sind browserbasiert abgesichert und auf Desktop sowie Mobile-Viewport verifiziert.

### Tasks

- Dashboard-Ansicht per Playwright absichern
- Reviereinrichtungen per Playwright absichern
- Protokoll-Liste und Protokoll-Detail per Playwright absichern
- Dokument-Download inklusive Dateiname pruefen

Akzeptanzkriterien:

- kritische Schriftfuehrer-Flows laufen reproduzierbar lokal durch
- Desktop- und Mobile-Viewport bleiben ohne Horizontal-Overflow bedienbar

## Epic S1-H2: Preview-Smoke und Deploy-Check

### Ziel

Jede relevante PR kann vor einem Merge per einfachem HTTP-/HTML-Smoke gegen die Preview validiert werden.

### Tasks

- `smoke:preview` fuer Login, `me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download
- Preview-URL und Zugangsdaten als reproduzierbarer Check dokumentieren

Akzeptanzkriterien:

- ein Preview-Deploy kann ohne Browserautomation auf Kernfunktionen geprueft werden
- der Smoke bricht bei fehlender Session, falschem HTML oder fehlendem Download klar ab

## Epic S1-H3: Abnahme und Doku

### Ziel

Roadmap, API-Doku, Testfaelle und TODO spiegeln den echten Sprint-1-Stand.

### Tasks

- Root-Roadmap auf den aktuellen Ist-Stand ziehen
- `docs/api-v1.md` fuer die produktiven Endpunkte aktualisieren
- `TESTCASES.md`, `CHANGELOG.md` und `TODO.md` auf Sprint-1-Haertung anpassen

Akzeptanzkriterien:

- Repo-Dokumentation behauptet nicht mehr, Sprint 0 oder der Demo-Store seien der aktuelle Hauptstand
- die Sprint-1-Abnahme ist als lokaler und Preview-basierter Ablauf beschrieben

## Abhaengigkeiten

- Sprint 1 bleibt auf Sprint 0 aufgebaut
- Dokument-Download und Protokoll-Detail brauchen stabile Sitzungs-/Dokument-Vertraege
- Preview-Smoke braucht produktive Login- und Read-Endpunkte

## Repo-Auswirkungen

Wahrscheinlich neu oder stark betroffen:

- `apps/web/e2e`
- `apps/web/scripts`
- `apps/web/src/app/page.tsx`
- `apps/web/src/components/public-landing.tsx`
- `apps/web/src/lib/auth-redirects.ts`
- `apps/web/src/app/reviereinrichtungen/page.tsx`
- `apps/web/src/app/protokolle/page.tsx`
- `apps/web/src/app/protokolle/[id]/page.tsx`
- `docs/api-v1.md`
- Root-Dokumentation (`ROADMAP.md`, `README.md`, `TESTCASES.md`, `CHANGELOG.md`, `TODO.md`)

## Sprint-Abnahme

Sprint 1 ist in dieser Ausbaustufe fertig, wenn:

- Dashboard, Reviereinrichtungen und Protokolle browserbasiert abgesichert sind
- ein Dokument-Download ueber die freigegebene Protokollansicht funktioniert
- Preview-Smoke gegen die PR-URL gruen laeuft
- Desktop- und Mobile-Viewport manuell geprueft sind

## Multi-Agent-Schnitt

Die empfohlene Parallelisierung fuer den aktuellen Sprint-1-Restblock ist separat beschrieben:

- [Agent-Workstreams Sprint 1](./agent-workstreams-sprint-1.md)
