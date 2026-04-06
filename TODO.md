# TODO

## Offen

- Preview-Smoke als festen PR- oder CI-Check automatisiert an jeden relevanten Web-Deploy haengen.
- Echten Android-Emulator- oder Device-Smoke mit Expo lokal durchlaufen und dokumentiert gegenpruefen.
- Mobile-spezifische E2E-Strategie fuer Expo und native Oberflaechen ueber den Android-Smoke hinaus festziehen.
- Fachkonzept fuer Reviermeldungen zu Fuetterungen, Wasserungen und Einrichtungen mit Fotos, Kurztext und Aufgabenbezug ausarbeiten.
- Rollen- und Empfaengergruppenmodell fuer zielgerichtete Sichtbarkeit von Nachrichten, Aufgaben und Veranstaltungen festziehen.
- Veranstaltungsmodul mit Ankuendigung, Treffpunkt, Erinnerungen und optionaler Teilnahmebestaetigung planen.
- WhatsApp-Anstoss aus der App fachlich und technisch gegen interne Nachrichten und Aufgaben abgrenzen.

## Erledigt

- Echte Auth-Session mit Login, Refresh, `GET /api/v1/me` und Revierkontext fuer Web und App umgesetzt.
- Login in Web und App auf E-Mail- oder Benutzername plus vierstellige PIN umgestellt und den sichtbaren Demo-Konten-Block entfernt.
- Web-Logout mit sichtbarer Sidebar-Aktion und Rueckleitung auf `/login` umgesetzt.
- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web als read-only Server-Slices eingefuehrt.
- Web-Sitzungen mit Liste, Detail, Versionen, Freigabe und PDF-Download-Grundlage implementiert.
- Mobile Session-Restore, Login und zentralen API-Client fuer die Read-Slices umgesetzt.
- Mobile Offline-Queue mit Retry-Status fuer `Ansitz` und `Fallwild` eingebaut.
- Mobile `Ansitz`- und `Fallwild`-Tab auf echte Eingabeformulare mit Queue-Fallback umgestellt.
- Web-E2E fuer Login, Logout, Rollen-Schutz sowie Sitzungs-Mutation und Freigabe erweitert.
- Vitest fuer `@hege/web` sauber von Playwright getrennt.
- Fallwild-Detail und Foto-Upload ueber `media_assets` und S3-kompatibles Storage eingefuehrt.
- Preview-Smoke fuer Login, `me`, Dashboard, Reviereinrichtungen, Protokolle, Sitzungen und Dokument-Download umgesetzt.
- Mobile Fallwild-Fotoauswahl mit bis zu drei Bibliotheksbildern eingefuehrt.
- Mobile Queue auf `pending`, `syncing`, `uploading`, `failed` und `conflict` erweitert.
- Android-Smoke-Helfer fuer Expo, `adb` und Testbild-Erzeugung hinzugefuegt.
