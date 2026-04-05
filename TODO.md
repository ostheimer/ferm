# TODO

## Offen

- Web-E2E-Strecke nach Auth, Rollen und Sitzungen um Dashboard-, Reviereinrichtungen- und Protokoll-Details weiter vertiefen.
- Preview-Smoke-Checks fuer Web-Deployments weiter standardisieren.
- Mobile-spezifische E2E-Strategie fuer Expo und native Oberflaechen festziehen.
- Offline-Mutations-Queue fuer `Ansitz` und `Fallwild` nach den neuen Formularen um Foto-Upload und feinere Konfliktbehandlung erweitern.
- Fachkonzept fuer Reviermeldungen zu Fuetterungen, Wasserungen und Einrichtungen mit Fotos, Kurztext und Aufgabenbezug ausarbeiten.
- Rollen- und Empfaengergruppenmodell fuer zielgerichtete Sichtbarkeit von Nachrichten, Aufgaben und Veranstaltungen festziehen.
- Veranstaltungsmodul mit Ankuendigung, Treffpunkt, Erinnerungen und optionaler Teilnahmebestaetigung planen.
- WhatsApp-Anstoss aus der App fachlich und technisch gegen interne Nachrichten und Aufgaben abgrenzen.

## Erledigt

- Echte Auth-Session mit Login, Refresh, `GET /api/v1/me` und Revierkontext fuer Web und App umgesetzt.
- Web-Logout mit sichtbarer Sidebar-Aktion und Rueckleitung auf `/login` umgesetzt.
- Dashboard im Web von `demoData` auf die Server-Schicht mit Session-/Revier-Kontext umgestellt.
- Reviereinrichtungen und Protokolle im Web als read-only Server-Slices eingefuehrt.
- Web-Sitzungen mit Liste, Detail, Versionen, Freigabe und PDF-Download-Grundlage implementiert.
- Mobile Session-Restore, Login und zentralen API-Client fuer die Read-Slices umgesetzt.
- Mobile Offline-Queue mit Retry-Status fuer `Ansitz` und `Fallwild` eingebaut.
- Mobile `Ansitz`- und `Fallwild`-Tab auf echte Eingabeformulare mit Queue-Fallback umgestellt.
- Web-E2E fuer Login, Logout, Rollen-Schutz sowie Sitzungs-Mutation und Freigabe erweitert.
- Vitest fuer `@hege/web` sauber von Playwright getrennt.
