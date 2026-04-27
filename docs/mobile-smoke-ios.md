# iOS-Smoke-Runbook

## Ziel

Dieses Runbook beschreibt die reproduzierbare native Smoke-Abnahme der Expo-Mobile-App auf einem iPhone-Simulator. iOS ist der primäre native Abnahmepfad für die Mobile-App; Android bleibt fachlich Zielplattform, wird aber separat standardisiert.

Der Smoke prüft keine vollständige Regression, sondern die wichtigsten nativen Pfade:

- Login mit vorhandenem internen Testkonto
- Dashboard laden und aktualisieren
- Ansitz-Screen laden und optional in einem abgestimmten Test-Revier starten
- Fallwild-Fotoauswahl prüfen und nur in einem abgestimmten Test-Revier speichern
- Offline-Queue v2, Retry-Hinweise und anschließenden Sync prüfen

## Voraussetzungen

- macOS mit installiertem Xcode und iOS-Simulator.
- Xcode Command Line Tools sind aktiv: `xcode-select -p`.
- Repository-Abhängigkeiten sind installiert, zum Beispiel mit `pnpm install`.
- Die Mobile-App kann aus `apps/mobile` mit Expo gestartet werden.
- Netzwerkzugriff auf `https://hege.app`.
- Ein vorhandenes internes Login-Testkonto aus den bestehenden Testdaten ist verfügbar.
- Keine Zugangsdaten, Tokens oder neuen Test-Secrets in dieses Runbook eintragen.

## Simulator-Auswahl

1. Verfügbare iPhone-Simulatoren prüfen:

   ```sh
   xcrun simctl list devices available | grep -E "iPhone 17|iPhone"
   ```

2. Wenn lokal vorhanden, bevorzugt einen `iPhone 17`-Simulator verwenden.

3. Falls kein `iPhone 17` verfügbar ist, den neuesten verfügbaren iPhone-Simulator verwenden.

4. Simulator vor dem Start öffnen oder booten:

   ```sh
   open -a Simulator
   ```

   Optional kann ein konkretes Gerät über Xcode > Window > Devices and Simulators oder über die Simulator-App ausgewählt werden.

## Testbild vorbereiten und importieren

Das Fallwild-Foto wird über die iOS-Fotoauswahl getestet. Dafür ein reproduzierbares Testbild erzeugen und in den gebooteten Simulator importieren:

```sh
node apps/mobile/scripts/create-test-image.mjs
xcrun simctl addmedia booted apps/mobile/tmp/hege-test-image.png
```

Wenn der Simulator nicht gebootet ist, zuerst den gewünschten iPhone-Simulator starten und den Import danach erneut ausführen.

## App starten

Aus dem Mobile-Verzeichnis starten, damit Expo die App-Konfiguration eindeutig findet:

```sh
cd apps/mobile
EXPO_PUBLIC_API_BASE_URL=https://hege.app/api/v1 npx expo start --ios --clear
```

Wichtig: Die API-Basis für diesen Smoke ist `EXPO_PUBLIC_API_BASE_URL=https://hege.app/api/v1`. Nicht auf lokale API-URLs oder Demo-Fallbacks ausweichen, außer die Abnahme wird ausdrücklich als lokale Entwicklervariante dokumentiert.

## Login

1. App im iPhone-Simulator öffnen.
2. Mit dem vorhandenen internen Login-Testkonto anmelden.
3. Das Testkonto muss aus bestehenden internen Testdaten, einem freigegebenen Passwortmanager oder dem vereinbarten Seed-Datensatz stammen.
4. Keine neuen Zugangsdaten erfinden und keine Secrets in Git, Tickets oder Screenshots dokumentieren.

Erwartung:

- Login ist erfolgreich.
- Die App wechselt auf die geschützte Hauptnavigation.
- Das aktive Test-Revier ist sichtbar oder fachlich eindeutig erkennbar.

## Dashboard-Smoke

1. Den Dashboard-Tab öffnen.
2. Sichtbare Kennzahlen, Meldungen oder Revier-Informationen prüfen.
3. Manuell aktualisieren, zum Beispiel per Pull-to-Refresh.

Erwartung:

- Dashboard-Daten werden aus der API geladen.
- Kein dauerhafter Ladezustand bleibt stehen.
- Fehlerzustände sind verständlich und blockieren die Navigation nicht.

## Ansitz-Smoke

1. Den Tab `Ansitz` öffnen.
2. Liste aktiver Ansitze laden oder manuell aktualisieren.
3. Wenn ein abgestimmtes Test-Revier oder ein explizit freigegebener Testdatensatz verfügbar ist, einen neuen Ansitz starten.
4. Wenn Standortauswahl erforderlich ist, einen vorhandenen Test-Hochstand oder die aktuelle Simulator-Position verwenden.
5. Optional eine kurze Testnotiz eintragen, zum Beispiel `iOS Smoke`.
6. Den erstellten Ansitz in der aktiven Liste prüfen.
7. Falls die mobile Oberfläche das Beenden unterstützt, den eigenen Test-Ansitz wieder beenden; andernfalls die offene Bereinigung separat notieren.

Erwartung:

- Der Ansitz-Screen lädt ohne App-Neustart.
- Optional erstellte Test-Ansitze sind nach dem Start sichtbar.
- Nicht bereinigte Testdaten werden mit Zeitpunkt und Testkonto-Bezug dokumentiert.

## Fallwild-Fotoauswahl-Smoke

1. Den Tab `Fallwild` öffnen.
2. Pflichtfelder in einem abgestimmten Test-Revier ausfüllen.
3. Foto hinzufügen und die iOS-Fotoauswahl öffnen.
4. Das zuvor importierte Testbild auswählen.
5. Prüfen, dass maximal drei Fotos auswählbar bleiben.
6. Nur wenn Testdaten in diesem Revier ausdrücklich erlaubt sind, den Fallwild-Vorgang speichern.

Erwartung:

- Die native iOS-Fotoauswahl öffnet sich.
- Das importierte Testbild ist auswählbar.
- Die Vorschau zeigt Dateiname und Anhang nachvollziehbar an.
- Beim Speichern im Test-Revier wird der Foto-Upload abgeschlossen oder landet nachvollziehbar in der Offline-Queue.

## Queue-Sync-Smoke

Der Queue-Sync soll zeigen, dass Kernaktionen bei kurzzeitig fehlendem Netz vorgemerkt und später synchronisiert werden. Der aktuelle Pfad nutzt Queue v2 mit separaten Foto-Upload-Einträgen, Retry-Backoff und manuellen Aktionen für problematische Einträge.

1. App und Dashboard einmal online vollständig laden.
2. Netzwerkverbindung des Macs kurz trennen oder mit Network Link Conditioner eine Offline-Situation simulieren.
3. Einen kleinen Testvorgang in einem abgestimmten Test-Revier erzeugen, bevorzugt Fallwild mit dem importierten Testbild.
4. Prüfen, dass die App den Vorgang als ausstehend, offline oder in der Warteschlange erkennbar macht.
5. Netzwerk wiederherstellen.
6. Dashboard, Ansitz oder Fallwild manuell aktualisieren.
7. Warten, bis die Queue abgearbeitet ist.
8. Wenn ein Eintrag fehlschlägt, Fehlertext und nächsten Retry-Zeitpunkt prüfen.
9. Für einen fehlgeschlagenen oder konfliktbehafteten Testeintrag die sichtbaren Aktionen `Erneut versuchen` und `Verwerfen` prüfen, aber nur im abgestimmten Test-Revier verwerfen.

Erwartung:

- Die App bleibt bedienbar.
- Der Vorgang geht nicht verloren.
- Ausstehende Queue-Einträge werden nach wiederhergestelltem Netz synchronisiert.
- Erfolgreich synchronisierte Einträge verschwinden aus dem Pending-Zustand oder werden als synchronisiert angezeigt.
- Fehlgeschlagene Einträge zeigen den nächsten Retry-Zeitpunkt und lassen sich manuell erneut versuchen oder verwerfen.
- Konflikte werden nicht automatisch endlos wiederholt.

## Bekannte Stolperstellen

### Expo-Go-Developer-Menü

- Im iOS-Simulator öffnet `Cmd+D` das Expo-Go-Developer-Menü.
- Wenn das Menü versehentlich offen bleibt, kann es Eingaben blockieren oder den Eindruck erwecken, die App reagiere nicht.
- Bei Hängern zuerst das Menü schließen und die App über `Reload` oder `R` neu laden.
- Sicherstellen, dass Expo Go mit dem aktuellen Metro-Prozess verbunden ist und nicht mit einem alten Projekt.

### Babel-/Metro-Cache

- Änderungen an `EXPO_PUBLIC_*`-Variablen, Babel-Konfiguration oder Metro-Konfiguration werden nicht zuverlässig durch reines Reload übernommen.
- Expo mit `Ctrl+C` beenden und mit Cache-Clear neu starten:

  ```sh
  EXPO_PUBLIC_API_BASE_URL=https://hege.app/api/v1 npx expo start --ios --clear
  ```

- Wenn der Simulator weiter alten Code zeigt, Expo Go vollständig beenden, den Simulator neu öffnen und den Startbefehl erneut ausführen.

### Storage-Konfiguration

- Wenn Foto-Queue-Einträge mit `Storage ist nicht konfiguriert.` fehlschlagen, ist der Mobile-Queue-Pfad erwartungsgemäß aktiv, aber die Zielumgebung hat noch keine S3/R2-Storage-Konfiguration.
- In diesem Fall Retry-Zeitpunkt, Fehlertext, `Erneut versuchen`, `Verwerfen` und Dashboard-Zähler dokumentieren.
- Nach korrigierter Storage-Konfiguration denselben Smoke erneut ausführen und prüfen, dass die Foto-Queue nach dem Sync leer ist.
- Production-Stand vom 2026-04-27: R2-Storage ist aktiv, `https://hege.app/api/v1` akzeptiert Fallwild-Foto-Uploads und die erzeugten Dateien sind unter `https://assets.hege.app` öffentlich abrufbar.

## Abschlusskriterien

Der iOS-Smoke gilt als bestanden, wenn:

- Login mit internem Testkonto funktioniert.
- Dashboard online lädt und aktualisiert.
- Ansitz geladen und optional im Test-Revier gestartet werden kann.
- Fallwild inklusive nativer Fotoauswahl mit importiertem Testbild geprüft und optional im Test-Revier gespeichert werden kann.
- Offline erzeugte Aktionen in der Queue sichtbar sind und nach Netzrückkehr synchronisieren.
- Fehlerhafte Queue-Einträge Retry-Zeitpunkt, Fehlertext sowie die Aktionen `Erneut versuchen` und `Verwerfen` nachvollziehbar anzeigen.

Alle Abweichungen mit Simulator-Modell, iOS-Version, Zeitpunkt, Testkonto-Bezug ohne Secret und beobachtetem Screen dokumentieren.
