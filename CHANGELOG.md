# Changelog

Alle relevanten Aenderungen an `hege` werden hier festgehalten.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) und das Projekt nutzt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

### Added

- Playwright-E2E- und Visual-Regression-Tests fuer die wichtigsten Web-Use-Cases in `Ansitze` und `Fallwild` auf Desktop und Mobile.
- Isolierter lokaler E2E-Datenbank-Setup mit Seed-Reset pro Testfall fuer reproduzierbare Browser-Tests.
- Eigene Vitest-Konfiguration fuer `apps/web`, damit Unit- und Integrationstests von Playwright getrennt laufen.

### Changed

- Root- und Web-Skripte um E2E-, Snapshot-Update- und Visual-Test-Kommandos erweitert.
- Typecheck- und Lint-Skripte in `apps/web` gegen stale `tsconfig.tsbuildinfo` abgesichert.
- README, Doku-Uebersicht und `TESTCASES.md` um die neue Teststrategie erweitert.
- Produktplanung fuer Reviermeldungen, rollenbasierte Sichtbarkeit, Aufgaben, Veranstaltungen und WhatsApp-Anstoss in den Fachdokumenten erweitert.
