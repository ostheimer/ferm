# Sprint 1 Backlog

## Sprintziel

Die erste nutzbare Web-Version fuer Schriftfuehrer und Revier-Admins soll nicht nur fachlich komplett, sondern reproduzierbar abgesichert sein. Der aktuelle Restblock ist deshalb kein neuer Editor-Sprint mehr, sondern Sprint-1-Haertung.

Sprint 1 setzt Sprint 0 als abgeschlossen voraus.

## Status

- Dashboard, Sitzungsliste, Sitzungsdetail, Protokoll-Leseansicht, Freigabe und PDF-Basis sind umgesetzt.
- Auth, Rollen, Revier-Scope und Dokument-Downloads laufen produktiv ueber `apps/web`.
- Browserabdeckung fuer Dashboard, Reviereinrichtungen, Protokoll-Liste, Protokoll-Detail, Dokument-Download sowie Public-Web-/Onboarding-Contracts liegt in `apps/web/e2e`.
- `smoke:preview` prueft Public Web, Auth-Login, `GET /api/v1/me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und den Dokument-Download gegen den Preview-Deploy.
- `.github/workflows/preview-smoke.yml` startet denselben Smoke bei erfolgreichen Preview-Deployments sowie manuell per `workflow_dispatch`.
- Offener Sprint-1-Rest liegt vor allem in der finalen Aktivierung dieses Checks in GitHub/Vercel, in manueller Abnahme, Dokumentation und den letzten Regressionen rund um Protokolle, Downloads und Setup-Abschluss.

## Bereits umgesetzt

- Web-Backoffice fuer Schriftfuehrer und Revier-Admins
- Dashboard
- Sitzungsliste und Sitzungsdetail
- Versionierung und Freigabe-Workflow
- PDF-Download-Grundlage
- Read-only-Lageuebersicht fuer Ansitze und Fallwild

## Restscope in Sprint 1

- Preview-Smoke-Workflow in GitHub und optional in Vercel Deployment Checks als verpflichtenden Check markieren
- manuelle Abnahme fuer Desktop und Mobile-Viewport
- Dokumentation und Testfaelle auf den aktuellen Implementierungsstand ziehen

## Sprint 1.5: Public Web und Onboarding

### Ziel

Die oeffentliche Produktseite und der erste Onboarding-Einstieg sind browserseitig abgesichert; der Preview-Smoke deckt inzwischen den oeffentlichen Einstieg, den Session-Grundvertrag und die wichtigsten Read-Pfade des App-Blocks ab.

### Stand

Browserseitig und im aktuellen Smoke bereits umgesetzt:

- Public Landing auf `/` mit Pricing-CTAs und Login-Zugang
- Login-Redirect auf `/app` und Setup-Redirect auf `/app/setup`
- `toSafePostAuthPath` und die Auth-Guards fuer `/login`, `/registrieren` und `/app`-Ziele
- Preview-Smoke fuer `/`, `/login`, `/registrieren`, `POST /api/v1/auth/login`, `GET /api/v1/me`, den authentifizierten Redirect von `/login`, `/app`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und den Dokument-Download

Restblock:

- Setup-Abschluss in den reproduzierbaren Preview-/CI-Abnahmerahmen ziehen
- Registrierungs- und App-Redirects in die finale Browser-Abnahme und Dokumentation ziehen

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

1. Preview-Smoke-Workflow als festen Zwischencheck zwischen Local und Production markieren
2. Dokumentation, TESTCASES und manuelle Abnahme angleichen
3. letzte Regressionen rund um Protokolle, Downloads und Setup-Abschluss nachziehen
4. danach Sprint-3-Medien- und Queue-Themen auf denselben Haertungsstandard ziehen

## Epic S1-H1: Web-Haertung

### Ziel

Die produktiven Schriftfuehrer-Seiten sind browserbasiert abgesichert und auf Desktop sowie Mobile-Viewport verifiziert.

### Stand

Bereits umgesetzt:

- Dashboard-Ansicht per Playwright
- Reviereinrichtungen per Playwright
- Protokoll-Liste und Protokoll-Detail per Playwright
- Dokument-Download inklusive Dateiname
- Horizontal-Overflow-Pruefung im Mobile-Viewport

Restblock:

- bestehende Browserabdeckung bei fachlichen Aenderungen aktuell halten
- die manuelle Desktop- und Mobile-Abnahme als Abschluss-Schritt dokumentieren

Akzeptanzkriterien:

- kritische Schriftfuehrer-Flows laufen reproduzierbar lokal durch
- Desktop- und Mobile-Viewport bleiben ohne Horizontal-Overflow bedienbar

## Epic S1-H2: Preview-Smoke und Deploy-Check

### Ziel

Jede relevante PR kann vor einem Merge per einfachem HTTP-/HTML-Smoke gegen die Preview validiert werden.

### Stand

Bereits umgesetzt:

- `smoke:preview` fuer `/`, `/login`, `/registrieren`, `POST /api/v1/auth/login`, `GET /api/v1/me`, den authentifizierten Redirect von `/login`, `/app`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und den Dokument-Download

Restblock:

- Preview-URL und Zugangsdaten als reproduzierbarer Check dokumentieren
- Workflow in GitHub und optional in Vercel Deployment Checks als verpflichtenden Check markieren

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

- `.github/workflows` fuer den spaeteren Preview-/CI-Check
- `.github/workflows/preview-smoke.yml`
- `apps/web/scripts`
- `apps/web/e2e`
- `docs/api-v1.md`
- Root-Dokumentation (`ROADMAP.md`, `README.md`, `TESTCASES.md`, `CHANGELOG.md`, `TODO.md`)
- `docs/README.md` und `docs/roadmap-v1.md`

## Sprint-Abnahme

Sprint 1 ist in dieser Ausbaustufe fertig, wenn:

- Dashboard, Reviereinrichtungen und Protokolle browserbasiert abgesichert sind
- ein Dokument-Download ueber die freigegebene Protokollansicht funktioniert
- Preview-Smoke gegen die PR-URL gruen laeuft
- Desktop- und Mobile-Viewport manuell geprueft sind

## Multi-Agent-Schnitt

Die empfohlene Parallelisierung fuer den aktuellen Sprint-1-Restblock ist separat beschrieben:

- [Agent-Workstreams Sprint 1](./agent-workstreams-sprint-1.md)
