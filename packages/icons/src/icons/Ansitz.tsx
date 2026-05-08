import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Ansitz — Fernglas (Frontalansicht) mit Steg.
 *
 * Liest sich auf jeder Groesse als "schauen / beobachten". Ich habe die
 * inneren Pupillen-Punkte weggelassen, weil sie auf 18px zu Augen mutieren
 * und das Symbol unterhaltsam statt geerdet wirkt.
 */
export function Ansitz(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Ansitz" {...props}>
      <path d="M3.5 6.5 L7.5 6.5" />
      <path d="M16.5 6.5 L20.5 6.5" />
      <path d="M4 6.5 L4 16 A3 3 0 0 0 10 16 L10 9.5" />
      <path d="M14 9.5 L14 16 A3 3 0 0 0 20 16 L20 6.5" />
      <path d="M10 9.5 L14 9.5" />
      <path d="M10 11.5 L14 11.5" />
      <path d="M11.5 8 L12.5 8" />
    </IconBase>
  );
}
