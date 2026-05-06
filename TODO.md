# TODO

## Offen

- iPhone-/iOS-Geräte-Smoke auf Production erneut auf erfolgreichen Foto-Upload, automatische Standortauflösung und leere Queue prüfen.
- Echten WebAuthn-/Passkey-Login serverseitig planen; Mobile kann zunächst nur eine bestehende Sitzung lokal per Face ID entsperren.
- GIP-Bounding-Box für Jagdgesellschaft Gänserndorf fachlich prüfen und bei Bedarf größeren Revier-Ausschnitt als `GIP_ROAD_KILOMETER_INDEX_PATH` deployen.
- Mobile-spezifische E2E-Strategie für Expo und native Oberflächen über den dokumentierten Geräte-Smoke hinaus festziehen.
- Android-Emulator-Smoke nach [Android-Smoke-Runbook](docs/mobile-smoke-android.md) als optionalen Zweitpfad vorbereiten, falls später Android-Abdeckung ohne physisches Gerät benötigt wird.
- Rollen- und Empfängergruppenmodell für zielgerichtete Sichtbarkeit von Nachrichten, Aufgaben und Veranstaltungen gegen [Rollen/Aufgaben/Nachrichten v1](docs/rollen-aufgaben-nachrichten-v1.md) festziehen.
- Veranstaltungsmodul mit Ankündigung, Treffpunkt, Erinnerungen und optionaler Teilnahmebestätigung planen.
- WhatsApp-Anstoß aus der App fachlich und technisch gegen interne Nachrichten und Aufgaben abgrenzen.

## Erledigt

- Echte Auth-Session mit Login, Refresh, `GET /api/v1/me` und Revierkontext fuer Web und App umgesetzt.
- Login in Web und App auf E-Mail- oder Benutzername plus vierstellige PIN umgestellt und den sichtbaren Demo-Konten-Block entfernt.
- Public-Web-Block mit Landing auf `/`, Pricing-CTAs, Login-/Registrieren-Einstieg und Onboarding-Redirects fuer `/app` und `/app/setup` als Sprint-1.5-Strecke dokumentiert.
- Production-Kompatibilitaetsfallback fuer Legacy-Schema bei Login und Fallwild-Reads umgesetzt.
- Web-Logout mit sichtbarer Sidebar-Aktion und Rueckleitung auf `/login` umgesetzt.
- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web als read-only Server-Slices eingefuehrt.
- Web-Sitzungen mit Liste, Detail, Versionen, Freigabe und PDF-Download-Grundlage implementiert.
- Mobile Session-Restore, Login und zentralen API-Client fuer die Read-Slices umgesetzt.
- Mobile Session-Restore um lokalen `locked`-Status und Entsperren per Face ID/Touch ID für gespeicherte Sitzungen erweitert.
- Face-ID-Entsperren einer gespeicherten Mobile-Session am 2026-05-06 auf dem angeschlossenen iPhone bestätigt.
- Mobile Offline-Queue mit Retry-Status fuer `Ansitz` und `Fallwild` eingebaut.
- Mobile `Ansitz`- und `Fallwild`-Tab auf echte Eingabeformulare mit Queue-Fallback umgestellt.
- Web-E2E fuer Login, Logout, Rollen-Schutz sowie Sitzungs-Mutation und Freigabe erweitert.
- Web-E2E und Smoke fuer Public Landing, Login, Registrierung und `/api/v1/me` erweitert.
- Vitest fuer `@hege/web` sauber von Playwright getrennt.
- Fallwild-Detail und Foto-Upload ueber `media_assets` und S3-kompatibles Storage eingefuehrt.
- Preview-Smoke fuer Public Web, `POST /api/v1/auth/login`, `GET /api/v1/me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download umgesetzt.
- GitHub-Workflow `.github/workflows/preview-smoke.yml` fuer erfolgreiche Preview-Deployments und manuellen `workflow_dispatch` hinzugefuegt.
- Preview-Smoke in GitHub auf `main` als verpflichtenden Check markiert.
- Release-Check fuer erfolgreiche Production-Deployments und manuellen `workflow_dispatch` ueber `.github/workflows/release-check.yml` hinzugefuegt.
- Release-Check in Vercel Deployment Checks als blockierender Production-Check aktiviert.
- Mobile Fallwild-Fotoauswahl mit bis zu drei Bibliotheksbildern eingefuehrt.
- Mobile Queue auf `pending`, `syncing`, `uploading`, `failed` und `conflict` erweitert.
- Android-Smoke-Helfer fuer Expo, `adb` und Testbild-Erzeugung hinzugefuegt.
- iPhone-/iOS-Simulator-Smoke mit Expo lokal durchlaufen und nach [iOS-Smoke-Runbook](docs/mobile-smoke-ios.md) dokumentiert gegengeprüft.
- Web Storage-Rollback fuer Fallwild-Foto-Uploads als best-effort `DeleteObjectCommand` nach fehlgeschlagenem `media_assets`-Insert umgesetzt.
- Mobile Queue v2 mit `nextAttemptAt`, Retry-Backoff, dynamischer Sync-Schleife, manuellem Retry und Verwerfen problematischer Eintraege umgesetzt.
- Mobile Vitest-Abdeckung fuer Foto-Normalisierung, maximal drei Fotos, Submission-Fallback, recoverable Upload-Fehler und Queue-Retry-Policy eingefuehrt.
- iPhone-/iOS-Simulator-Smoke auf dem Medien-/Queue-v2-Pfad am 2026-04-26 mit Testdaten durchlaufen: Pflichtfeldvalidierung, 3-Foto-Limit, Queue-Status, Retry-Zeitpunkt, `Erneut versuchen` und Dashboard-Zaehler sind nachvollziehbar.
- Cloudflare R2-Bucket `hege-assets` im `hege.app`-Account angelegt, `assets.hege.app` als Custom Domain aktiviert und die Vercel-Storage-Variablen inklusive `S3_ACCESS_KEY` und `S3_SECRET_KEY` fuer Preview und Production gesetzt.
- Production-R2-Foto-Upload am 2026-04-27 gegen `https://hege.app/api/v1` verifiziert: Fallwild-Foto-Upload liefert `201`, die erzeugte `assets.hege.app`-Datei liefert `HTTP 200`.
- Reviermeldungen und Aufgaben v1 als naechsten fachlichen Codeblock geplant und gegen Rollen-/Nachrichten-Konzept abgegrenzt.
- Neues `hege`-Logo für iOS-App und Website eingebaut; Website-Logo ist auf `https://hege.app` produktiv verfügbar.
- Public Landing, Login, Registrierung und Setup-Flow auf Production visuell geprüft und mit Playwright gegen Desktop und Mobile durchlaufen.
- Sichtbare deutsche Web-Copy in den berührten Auth-/Setup-/Landing-/Sitzungsflächen auf echte Umlaute korrigiert.
- Fallwild-Standort v1 umgesetzt: Mobile übernimmt iPhone-Position, `POST /api/v1/geo/fallwild-location` ist produktiv erreichbar und speichert Standort-/Straßenkilometer-Metadaten am Fallwild-Vorgang; Adresse/Straße folgen nach gesetztem Google-Server-Key.
- Mock-/Provider-Schicht für Fallwild-Standort umgesetzt: Ohne Google- oder GIP-Key kann `HEGE_GEO_PROVIDER=mock` lokale Gänserndorf-Testdaten liefern, während UI und API klare Hinweise für manuelle Ergänzungen anzeigen.
- Google-Maps-Ausrichtung inklusive GIP-Abgrenzung für österreichische Straßenkilometer in [Google-Maps-Konzept](docs/maps-google-v1.md) und [API v1](docs/api-v1.md) dokumentiert.
- iPhone-Release-Build am 2026-04-30 mit `EXPO_PUBLIC_API_BASE_URL=https://hege.app/api/v1` auf `Andreas iPhone` installiert und App `app.hege.revier` gestartet.
- Reviermeldungen und Aufgaben v1 als Backend-/Mobile-API-Schnitt umgesetzt: Drizzle-Tabellen, Seed-Daten, `GET/POST/PATCH /api/v1/reviermeldungen`, `GET/POST/PATCH /api/v1/aufgaben`, Rollenprüfung, Aufgaben-Sichtbarkeit und Dashboard-Zähler stehen.
- Mobile-Tab `Meldungen` für Reviermeldungen und Aufgaben v1 umgesetzt: Reviermeldung erfassen, eigene/offene Aufgaben lesen und Aufgabenstatus ändern.
- iPhone-Smoke für den Mobile-Tab `Meldungen` am 2026-05-05 lokal gegen `http://10.0.0.242:3000/api/v1` durchlaufen: Login `ostheimer`, Aufgabenliste laden, Aufgabe auf `In Arbeit` setzen und Reviermeldung `Smoke Test` speichern liefern serverseitig `200`/`201`.
- GIP-Resolver-Vertrag für Fallwild am 2026-05-05 gehärtet: Neben einfachen JSON- und GeoJSON-Antworten werden ArcGIS-ähnliche `features[].attributes`, österreichische Straßennamen-Varianten wie `Landesstraße 9`/`L9` und Kilometerfelder wie `KM_VON` verarbeitet.
- Google Maps Server-Key für Preview/Production gesetzt und `POST /api/v1/geo/fallwild-location` gegen `hege.app` auf Adresse, Gemeinde und Straße geprüft.
- GIP-OGD-BEPU-Indexpfad umgesetzt: `GIP_ROAD_KILOMETER_INDEX_PATH`, Suchradius-Konfiguration, lokaler JSON-Resolver und `pnpm --filter @hege/web geo:gip:index` für den Export aus `gip_reference_ogd.gpkg`.
- Regionaler GIP-OGD-BEPU-Index für Gänserndorf aus dem offiziellen Referenzexport geschnitten und als gebündelter Backend-Fallback für `HEGE_GEO_PROVIDER=live` eingebaut.
