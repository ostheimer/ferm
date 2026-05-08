/**
 * `@hege/icons` — geteilte Iconography fuer hege.
 *
 * Enthaelt:
 *
 * - **Wordmark** (`HegeWordmark`, `HegeWordmarkLight`) — typografisches
 *   "hege"-Lockup als reines SVG, mit Fraunces als Brand-Schrift und
 *   Georgia als System-Fallback.
 * - **Domain-Icons** (acht Stueck) im Lucide-Linienstil
 *   (24×24 viewBox, `currentColor`, stroke-width 1.8, Round-Caps).
 *
 * Das **bestehende Mark** (das `h` mit Reh-Silhouette) bleibt als PNG in
 * `apps/web/public/brand/hege-logo-clean.png` erhalten und wird
 * bewusst **nicht** in diesem Package re-implementiert. Eine
 * vektorisierte Mini-Variante waere bei der vorhandenen Render-Aufloesung
 * eine Qualitaets-Regression. Aufrufer, die das Mark brauchen, laden
 * weiterhin das PNG.
 */
export type { HegeIconProps } from "./icons/IconBase";

export { Hochstand } from "./icons/Hochstand";
export { Fuetterung } from "./icons/Fuetterung";
export { Ansitz } from "./icons/Ansitz";
export { Fallwild } from "./icons/Fallwild";
export { Reviereinrichtung } from "./icons/Reviereinrichtung";
export { Sitzung } from "./icons/Sitzung";
export { Protokoll } from "./icons/Protokoll";
export { Mitglied } from "./icons/Mitglied";

export { HegeWordmark } from "./wordmark/HegeWordmark";
export type { HegeWordmarkProps } from "./wordmark/HegeWordmark";
export { HegeWordmarkLight } from "./wordmark/HegeWordmarkLight";
export type { HegeWordmarkLightProps } from "./wordmark/HegeWordmarkLight";
