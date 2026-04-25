# Rollen, Aufgaben und Nachrichten v1

## Ziel

Dieses Dokument beschreibt die fachliche Richtung für Rollen, Aufgaben, Nachrichten, Reviermeldungen und Veranstaltungen. Es ergänzt das bestehende Rollenmodell, ohne eine verbindliche Migration oder vollständige Implementierung für diesen Sprint festzulegen.

Ziel ist ein internes Arbeits- und Kommunikationsmodell für Reviere in Österreich. Die App bleibt die fachliche Quelle der Wahrheit. Externe Messenger können später ergänzen, ersetzen aber nicht das eigene Modell.

Der konkrete nächste Umsetzungsschnitt für Reviermeldungen und Aufgaben liegt in [Reviermeldungen und Aufgaben v1](./reviermeldungen-aufgaben-v1-plan.md).

## Grundprinzipien

- alle Inhalte sind pro `revier_id` getrennt
- technische Zuordnung läuft über `membership`
- eine Mitgliedschaft kann mehrere Rollen haben
- Berechtigungen werden aus Rollen und Kontext abgeleitet
- Sichtbarkeit wird explizit über Empfängergruppen, Rollen oder Ressourcenbezug gesteuert
- Aufgaben und Nachrichten können auf fachliche Objekte verweisen
- WhatsApp ist kein führender Datenkanal

## Rollenbild

### Bestehende Kernrollen

- `Revier Admin`: Verwaltung, Freigaben, Rollen- und Mitgliederüberblick
- `Schriftführer`: Sitzungen, Protokolle, Beschlüsse und protokollbezogene Aufgaben
- `Jäger`: mobile Feldnutzung, Ansitz, Fallwild, Reviereinrichtungen, eigene Aufgaben

### Fachlich vorgesehene Erweiterungen

- `Pächter`
- `Jagdleiter`
- `Jagdaufseher`
- `Kassier`
- `Ausgeher`
- `Gesellschafter`
- `Gastjäger`

Diese Rollen sind fachliche Zielrichtung. Sie müssen nicht sofort technisch vollständig getrennt werden.

## Sichtbarkeit

Sichtbarkeit wird nicht allein aus Rollen abgeleitet. Entscheidend sind Revier, Rolle, Empfängergruppe und optional der Bezug zu einer Ressource.

### Grundregeln

- Mitglieder sehen nur Inhalte ihres aktiven Reviers
- adressierte Mitglieder sehen direkte Nachrichten und zugewiesene Aufgaben
- Rollen sehen Inhalte, die explizit an ihre Rolle adressiert sind
- Revier Admins sehen alle operativen Inhalte ihres Reviers
- Schriftführer sehen protokoll- und sitzungsbezogene Inhalte
- Jäger sehen feldrelevante Inhalte, eigene Aufgaben und an sie gerichtete Nachrichten
- Gastjäger sehen nur Inhalte, die für ihre Teilnahme oder Einladung nötig sind

### Sichtbarkeitsstufen

- `private`: nur Ersteller und direkt adressierte Mitglieder
- `targeted`: definierte Mitglieder, Rollen oder Gruppen
- `revier`: alle aktiven Mitglieder im Revier
- `admin`: Revier Admins und berechtigte Leitungsrollen
- `resource`: Sichtbarkeit folgt der referenzierten Ressource

Die konkrete technische Policy kann später feiner werden. Für v1 reicht ein klarer, nachvollziehbarer Sichtbarkeitsentscheid pro Inhalt.

## Empfängergruppen

Nachrichten, Aufgaben, Reviermeldungen und Veranstaltungen können an unterschiedliche Empfängergruppen gerichtet sein.

Mögliche Zielgruppen:

- einzelne `membership_id`
- mehrere Mitgliedschaften
- alle Mitglieder eines Reviers
- bestimmte Rollen im Revier
- Teilnehmer einer Veranstaltung
- Verantwortliche einer Aufgabe
- Mitglieder mit Bezug zu einer Reviereinrichtung
- Mitglieder mit Bezug zu einem Beschluss oder Protokollpunkt

Empfängergruppen sollen nachvollziehbar gespeichert werden. Eine Nachricht an `alle Jäger` darf nicht nur als Text gespeichert werden, sondern braucht eine strukturierte Zielgruppe.

## Aufgaben

Aufgaben sind interne Arbeitseinheiten im Revier. Sie können einmalig, wiederkehrend oder projektartig sein.

### Typische Aufgaben

- Hochstand kontrollieren
- Hochstand reparieren
- Fütterung betreuen
- Salzlecke auffüllen
- Kirrung prüfen
- Wildkamera warten
- Fallwild-Nachbearbeitung erledigen
- Arbeitseinsatz vorbereiten
- Veranstaltungsdienst übernehmen
- Beschluss aus einer Sitzung umsetzen

### Aufgabenbezug

Eine Aufgabe kann ohne Bezug manuell entstehen oder auf eine Ressource verweisen.

Mögliche Bezüge:

- `reviereinrichtung`
- `fallwild_vorgang`
- `reviermeldung`
- `veranstaltung`
- `sitzung`
- `beschluss`
- `protokoll_version`
- `ansitz_session`

Der Bezug soll als `source_type` und `source_id` modellierbar sein, damit Aufgaben nicht für jede Quelle ein eigenes Sondermodell benötigen.

### Aufgabenstatus

Mögliche Statuswerte:

- `offen`
- `angenommen`
- `in_arbeit`
- `blockiert`
- `erledigt`
- `abgelehnt`
- `archiviert`

### Aufgabenfelder

Mögliche fachliche Felder:

- Titel
- Beschreibung
- Revier
- Ersteller
- Verantwortliche
- Beobachter oder informierte Empfänger
- Priorität
- Fälligkeitsdatum
- Startdatum
- Wiederholungsregel
- Standort oder Ressourcenbezug
- Status
- Abschlussnotiz
- Anhänge oder Fotos

Diese Felder sind eine Richtung für spätere API- und Datenmodellierung, keine verbindliche Migration.

## Nachrichten

Nachrichten sind interne, strukturierte Kommunikation im Revier. Sie sind nicht als vollständiger Chat-Ersatz für beliebige Privatkommunikation gedacht.

### Nachrichtentypen

- allgemeine Reviernachricht
- direkte Nachricht an Mitglieder
- rollenbezogene Nachricht
- aufgabenbezogene Nachricht
- veranstaltungsbezogene Nachricht
- protokoll- oder beschlussbezogene Nachricht
- Systemhinweis

### Nachrichtenregeln

- jede Nachricht hat einen Revierkontext
- jede Nachricht hat einen Ersteller oder einen Systemauslöser
- jede Nachricht hat strukturierte Empfänger
- Nachrichten können gelesen, archiviert oder als erledigt markiert werden
- fachlich relevante Nachrichten können auf Aufgaben, Reviermeldungen oder Veranstaltungen verweisen
- Push-Benachrichtigungen sind Auslieferung, nicht Quelle der Wahrheit

### Abgrenzung zu Notifications

`notifications` bleiben technische oder produktinterne Hinweise, zum Beispiel `Protokoll freigegeben` oder `neue Aufgabe`. Nachrichten sind dagegen fachliche Inhalte, die Nutzer bewusst erstellen oder beantworten.

Beide Konzepte können zusammenarbeiten: Eine neue Nachricht kann eine Notification auslösen, aber die Notification ersetzt die Nachricht nicht.

## Reviermeldungen

Reviermeldungen sind strukturierte Beobachtungen oder Hinweise aus dem Revier. Sie liegen zwischen einfacher Nachricht und fachlichem Vorgang.

### Typische Reviermeldungen

- Wildsichtung
- Schaden
- Gefahr
- Sperre oder Einschränkung
- Mangel an Reviereinrichtung
- auffällige Beobachtung
- Hinweis für andere Jäger

### Eigenschaften

- Standort optional, aber empfohlen
- Zeitpunkt verpflichtend
- Kategorie verpflichtend
- Status nachvollziehbar
- Fotos optional
- Sichtbarkeit abhängig von Kategorie und Empfängergruppe
- Meldung kann zu Aufgabe, Nachricht oder Veranstaltung führen

### Statuswerte

- `neu`
- `geprüft`
- `in_bearbeitung`
- `erledigt`
- `verworfen`
- `archiviert`

Fallwild bleibt ein eigener fachlicher Vorgang. Eine Reviermeldung kann auf Fallwild hinweisen, ersetzt aber nicht die strukturierte Fallwild-Erfassung.

## Veranstaltungen

Veranstaltungen bündeln Termine, Teilnehmer, Aufgaben und Kommunikation.

### Typische Veranstaltungen

- Gesellschaftsjagd
- Arbeitseinsatz
- Reviersitzung
- Schulung
- Hegemaßnahme
- Kontrolltermin
- gemeinsamer Treffpunkt

### Eigenschaften

- Titel
- Beschreibung
- Start- und Endzeit
- Ort oder Treffpunkt
- Empfängergruppe
- Teilnehmerstatus
- verantwortliche Rolle oder Mitgliedschaft
- optionale Aufgabenliste
- optionale Nachrichtenstrecke

### Teilnehmerstatus

- `eingeladen`
- `zugesagt`
- `abgesagt`
- `vielleicht`
- `teilgenommen`
- `nicht_erschienen`

Veranstaltungen können später Aufgaben erzeugen, zum Beispiel Dienste, Vorbereitung, Nachbereitung oder Kontrollgänge.

## WhatsApp-Abgrenzung

WhatsApp kann später als zusätzlicher Kanal betrachtet werden, ist aber nicht die fachliche Quelle.

### Nicht Ziel von v1

- automatische Synchronisierung von WhatsApp-Gruppen
- Import eingehender WhatsApp-Nachrichten als führende Fachdaten
- Aufgabensteuerung ausschließlich über WhatsApp
- Speicherung privater Chatverläufe
- Versand sensibler Standortdaten ohne explizite fachliche Entscheidung

### Mögliche spätere Nutzung

- Versand einer kurzen Benachrichtigung mit Link in die App
- Erinnerung an Veranstaltung oder Aufgabe
- Hinweis auf freigegebenes Protokoll
- Weiterleitung allgemeiner Revierinformationen an opt-in Empfänger

Der vollständige Inhalt und der verbindliche Status bleiben in der App.

## API-Richtung

Die API soll fachliche Ressourcen klar trennen und trotzdem Beziehungen zulassen.

Mögliche Endpunkte:

- `GET /api/v1/roles`
- `GET /api/v1/memberships`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `GET /api/v1/messages`
- `POST /api/v1/messages`
- `PATCH /api/v1/messages/:id`
- `GET /api/v1/reviermeldungen`
- `POST /api/v1/reviermeldungen`
- `PATCH /api/v1/reviermeldungen/:id`
- `GET /api/v1/veranstaltungen`
- `POST /api/v1/veranstaltungen`
- `PATCH /api/v1/veranstaltungen/:id`

Diese Liste ist eine Richtung. Sie legt keine Umsetzung in diesem Sprint fest.

## Datenmodell-Richtung

Mögliche Tabellen oder Ressourcen:

- `roles`
- `membership_roles`
- `tasks`
- `task_assignees`
- `task_comments`
- `messages`
- `message_recipients`
- `message_read_states`
- `reviermeldungen`
- `veranstaltungen`
- `veranstaltung_teilnehmer`
- `resource_links`

Wichtige gemeinsame Felder:

- `id`
- `revier_id`
- `created_by_membership_id`
- `visibility`
- `status`
- `source_type`
- `source_id`
- `created_at`
- `updated_at`
- `archived_at`

Für Empfängergruppen kann später eine generische Struktur entstehen, zum Beispiel `target_type` und `target_id` mit Werten wie `membership`, `role`, `revier`, `event_participants` oder `task_assignees`.

## Datenschutz und Nachvollziehbarkeit

- Nachrichten und Aufgaben sind revierinterne Daten
- private Kommunikation soll nicht unnötig in die Plattform gezogen werden
- sensible Standort- und Personendaten brauchen klare Sichtbarkeit
- Änderungen an Aufgabenstatus und Verantwortlichkeit sollen nachvollziehbar sein
- Revier Admins benötigen Überblick, aber keine unnötige Vermischung mit privater Kommunikation
- Audit-Logs sollen fachliche Entscheidungen erfassen, nicht jede gelesene Nachricht

## Akzeptanzkriterien für spätere Umsetzung

- Inhalte sind pro Revier getrennt
- Empfängergruppen werden strukturiert gespeichert
- Aufgaben können einzelnen Mitgliedern, Rollen oder Gruppen zugewiesen werden
- Aufgaben können auf fachliche Ressourcen verweisen
- Reviermeldungen sind von Fallwild und Nachrichten unterscheidbar
- Veranstaltungen können Teilnehmer, Ort und Aufgabenbezug tragen
- WhatsApp bleibt optionaler Ausgabekanal und nicht Quelle der Wahrheit
- das Dokument erzwingt keine Migration in diesem Sprint
