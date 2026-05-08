import * as React from "react";

/**
 * `<HegeWordmark />` — Wortmarken-Lockup "hege" als reines SVG.
 *
 * ## Render-Methode
 *
 * Der Schriftzug wird ueber ein SVG-`<text>`-Element gesetzt, mit dem
 * Fraunces-Stack als primaere Schrift und Georgia als verlaesslichem
 * System-Fallback. Die Begruendung gegen ausvektorisierte Glyph-Pfade:
 *
 * 1. Fraunces ist die offizielle Brand-Heading-Schrift (siehe `tokens`).
 *    Wenn der Aufrufer Fraunces geladen hat (Web tut das via `next/font`),
 *    rendert der Schriftzug pixelgenau in der Marken-Schrift.
 * 2. Wer Fraunces nicht geladen hat (E-Mail, externe Tools), bekommt
 *    Georgia — eine humanistische Serif mit aehnlichem Charakter, kein
 *    Stilbruch.
 * 3. Ausvektorisierte Pfade waeren bei jeder Font-Variation
 *    (Optical-Size, Weight) hart festgenagelt und liessen sich nicht
 *    ohne Asset-Update nachjustieren.
 *
 * Das **kleine, vorangestellte hege-Mark** (das stilisierte `h` mit
 * Reh-Silhouette) ist als separates PNG-Asset im Web-App-Public-Ordner
 * vorhanden (`/brand/hege-logo-clean.png`). Wir referenzieren es bewusst
 * **nicht** in dieser Component — die Wortmarke ist allein typografisch
 * gedacht und bleibt damit als pures SVG portierbar (E-Mail, PDF, Mobile).
 * Wer Mark + Wort kombiniert braucht, setzt beide Components nebeneinander.
 */
export interface HegeWordmarkProps {
  /** Hoehe des Wordmarks in px. Breite skaliert proportional via viewBox. Default 60. */
  size?: number;
  /** Schriftfarbe. Default `#24493a` (accentStrong, Tannengruen). */
  color?: string;
  /** Zusaetzliche CSS-Klasse(n). */
  className?: string;
  /** Inline-Style-Override. */
  style?: React.CSSProperties;
  /** Optionales aria-label. Default `"hege"`. */
  "aria-label"?: string;
}

const VIEW_W = 200;
const VIEW_H = 60;

export function HegeWordmark({
  size = 60,
  color = "#24493a",
  className,
  style,
  "aria-label": ariaLabel = "hege"
}: HegeWordmarkProps): React.JSX.Element {
  const width = (size * VIEW_W) / VIEW_H;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={size}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      {/*
        Feine horizontale Linie als typografischer Akzent ueber dem Wort —
        referenziert die "Reviergrenze" und gibt dem Lockup Halt.
        Bewusst sehr kurz, nur ueber dem `h`.
      */}
      <line
        x1="20"
        y1="14"
        x2="40"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text
        x="20"
        y="48"
        fill={color}
        fontFamily="var(--font-heading), 'Fraunces', Georgia, 'Times New Roman', serif"
        fontSize="44"
        fontWeight="500"
        letterSpacing="-0.5"
      >
        hege
      </text>
    </svg>
  );
}
