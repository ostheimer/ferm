# Android-Emulator-Smoke für Expo

## Status

Der Android-Emulator-Smoke ist ein optionaler Zweitpfad für Expo. Er ist vorbereitet, aber nicht blockierend.

Der primäre native Abnahmepfad bleibt iOS, also iPhone oder iOS Simulator über Expo. Android wird fachlich weiterhin mitgedacht.
Lokale Freigaben sollen dadurch aber nicht aufgehalten werden, solange kein Android-spezifisches Thema geprüft werden muss.

## Ziel

Der Smoke prüft manuell, ob die mobile Expo-App auf einem Android-Emulator grundsätzlich bedienbar bleibt:

- Login lädt und akzeptiert ein gültiges internes Testkonto.
- Dashboard, Ansitz und Fallwild sind erreichbar.
- Fallwild-Fotoauswahl kann mit einem Testbild geprüft werden; Speichern erfolgt nur in einem abgestimmten Test-Revier.
- Offline-Queue und anschließender Queue-Sync sind sichtbar nachvollziehbar.

Der Ablauf ist kein Ersatz für den iOS-Smoke und kein automatisierter E2E-Test.

## Voraussetzungen

- Android Studio mit eingerichtetem Android-Emulator.
- `adb` im `PATH`, zum Beispiel über `~/Library/Android/sdk/platform-tools`.
- Node.js und `pnpm`.
- Ein gültiges internes Testkonto für die Mobile-App.
- Optional: PowerShell, wenn der bestehende Helfer `apps/mobile/scripts/android-smoke.ps1` genutzt wird.

Wenn `adb` nicht gefunden wird:

```sh
export PATH="$PATH:$HOME/Library/Android/sdk/platform-tools"
```

## Emulator starten

Der Emulator kann über den Android Studio Device Manager gestartet werden.
Alternativ kann ein vorhandenes AVD über die Shell gestartet werden:

```sh
emulator -list-avds
emulator -avd <AVD_NAME>
adb devices
```

Für diesen Smoke reicht ein Eintrag mit Status `device`.
Wenn mehrere Emulatoren oder Geräte verbunden sind, den gewünschten `adb`-Serial notieren, zum Beispiel `emulator-5554`.

## Expo starten

In einem separaten Terminal:

```sh
pnpm --filter @hege/mobile dev
```

Wenn Metro bereit ist, die App im Android-Emulator öffnen:

- über `a` im Metro-Terminal, oder
- über die angezeigte Expo-URL in Expo Go beziehungsweise im Dev Client.

Falls der Emulator Metro nicht erreicht, kann Expo testweise mit Tunnel gestartet werden:

```sh
pnpm --filter @hege/mobile dev -- --tunnel
```

## Helfer nutzen

Der vorhandene PowerShell-Helfer bleibt nutzbar.
Er erzeugt bei Bedarf ein Testbild, pusht es in den Android-Download-Ordner und gibt die manuelle Checkliste aus:

```sh
pwsh -File apps/mobile/scripts/android-smoke.ps1 -ExpoUrl "exp://..."
```

Für macOS/zsh gibt es zusätzlich eine Bash-Variante:

```sh
bash apps/mobile/scripts/android-smoke.sh --expo-url "exp://..."
```

Bei mehreren verbundenen Geräten:

```sh
bash apps/mobile/scripts/android-smoke.sh --device emulator-5554 --expo-url "exp://..."
```

Oder per Umgebung:

```sh
ANDROID_SERIAL=emulator-5554 bash apps/mobile/scripts/android-smoke.sh --expo-url "exp://..."
```

Beide Helfer starten keinen Emulator, installieren keine App und erzwingen keinen Smoke.
Sie setzen nur einen bereits laufenden Android-Emulator oder ein verbundenes Gerät voraus.

## Manuelle Checkliste

1. Android-Emulator starten und mit `adb devices` prüfen.
2. Expo mit `pnpm --filter @hege/mobile dev` starten.
3. App auf Android öffnen und prüfen, ob der Login-Screen lädt.
4. Mit gültigem internem Testkonto anmelden.
5. Dashboard öffnen und prüfen, ob Revierdaten und Queue-Status sichtbar sind.
6. Ansitz öffnen und prüfen, ob die Liste lädt; nur in einem abgestimmten Test-Revier einen einfachen Ansitz starten.
7. Fallwild öffnen, Pflichtfelder ausfüllen und bis zu drei Fotos auswählen.
8. Das vom Helfer gepushte Bild `hege-android-smoke.png` aus `Download` verwenden, falls kein anderes Testbild verfügbar ist.
9. Nur in einem abgestimmten Test-Revier speichern und prüfen, ob Online-Speicherung oder Queue-Fallback verständlich angezeigt wird.
10. Netzwerk im Emulator deaktivieren, einen weiteren Fallwild-Vorgang im Test-Revier vormerken, Netzwerk wieder aktivieren und `Queue synchronisieren` auslösen.
11. Prüfen, ob die Queue leer wird oder verbleibende Einträge klar als wartend oder fehlgeschlagen markiert sind.

## Ergebnisbewertung

Der Android-Smoke gilt als erfolgreich, wenn die App ohne Android-spezifischen Crash durch Login, Dashboard, Ansitz,
Fallwild mit Foto und Queue-Sync geführt werden kann.

Fehlschläge blockieren den iOS-Abnahmepfad nicht.
Android-spezifische Auffälligkeiten werden als Folgearbeit notiert und priorisiert, sobald Android-Abdeckung verbindlich wird.

## Häufige Probleme

- `adb` fehlt: Android SDK `platform-tools` in den `PATH` aufnehmen.
- Kein Gerät mit Status `device`: Emulator starten, Boot abwarten und `adb devices` erneut prüfen.
- Mehrere Geräte verbunden: `--device` oder `ANDROID_SERIAL` verwenden.
- Expo-URL nicht erreichbar: Metro neu starten oder `-- --tunnel` verwenden.
- Testbild fehlt in der Galerie: Im Android-Dateimanager den Ordner `Download` öffnen.
  Die Helfer stoßen zusätzlich einen Media-Scan an, sofern der Emulator ihn unterstützt.
