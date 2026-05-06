# Passkeys und Face ID v1

## Status

Die Mobile-App unterstützt zunächst lokales Entsperren per Face ID, Touch ID oder Geräteprüfung für eine bereits gespeicherte Sitzung. Nach einem erfolgreichen PIN-Login bleibt der Revierkontext lokal gespeichert; beim nächsten App-Start wird diese Sitzung auf Geräten mit eingerichteter Biometrie als `locked` markiert und muss lokal entsperrt werden.

Das ist bewusst noch kein serverseitiger WebAuthn-/Passkey-Login. Ein echter Passkey ersetzt später Benutzername/PIN mit Challenge, Credential-Registrierung und serverseitiger Signaturprüfung.

## Verhalten in der App

- Erstlogin bleibt E-Mail oder Benutzername plus vierstellige PIN.
- Ist eine Sitzung gespeichert und Face ID verfügbar, zeigt der Login-Screen `Mit Face ID entsperren`.
- Das Entsperren funktioniert ohne Netzwerk, damit die App im Revier auch bei schwachem Empfang nutzbar bleibt.
- API-Token werden weiterhin über die bestehende Refresh-Logik erneuert.
- Bei Abmeldung wird die gespeicherte Sitzung entfernt; ein erneuter PIN-Login ist nötig.

## Späterer Passkey-Ausbau

- WebAuthn-Tabellen für Credentials, Public Keys, Sign Counter und Gerätebezeichnungen ergänzen.
- API-Routen für Passkey-Registrierung und Passkey-Login mit Challenge/Response einführen.
- Mobile-Client mit nativer Passkey-Bibliothek anbinden, sobald Produkt- und Bibliotheksentscheidung stehen.
- Fallback auf PIN für Geräte ohne Passkey-Unterstützung beibehalten.
