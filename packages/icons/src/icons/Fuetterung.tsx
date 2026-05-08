import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Fuetterung — Futtertrog auf zwei Stelzen mit Schutzdach, drei Streufurchen
 * im Trog (Heu/Ruebenschnitzel-Andeutung).
 *
 * Bewusst nicht "Heuballen" gewaehlt — Heuballen lesen sich auf 18px wie
 * eine Spirale. Trog liest sich klar als "Futter".
 */
export function Fuetterung(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Fuetterung" {...props}>
      <path d="M3.5 7.5 L12 3 L20.5 7.5" />
      <path d="M4.75 7.5 L19.25 7.5" />
      <path d="M5.5 12.5 L8 18.5 L16 18.5 L18.5 12.5 Z" />
      <path d="M8 15 L9 15" />
      <path d="M11.5 15 L12.5 15" />
      <path d="M15 15 L16 15" />
      <path d="M8 18.5 L7 21" />
      <path d="M16 18.5 L17 21" />
      <path d="M7 7.5 L7 10.5" />
      <path d="M17 7.5 L17 10.5" />
    </IconBase>
  );
}
