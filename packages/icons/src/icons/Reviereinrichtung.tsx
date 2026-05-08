import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Reviereinrichtung — Karten-Pin mit innerem Tannen-Symbol.
 *
 * Pin = "Standort einer Einrichtung im Revier", Tanne im Pin-Kopf macht
 * die Bedeutung domain-spezifisch. Ohne die Tanne waere es ein generischer
 * Maps-Pin.
 */
export function Reviereinrichtung(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Reviereinrichtung" {...props}>
      <path d="M12 21 C 7 15.5 5 12.5 5 9.5 A7 7 0 0 1 19 9.5 C 19 12.5 17 15.5 12 21 Z" />
      <path d="M12 12 L12 13.5" />
      <path d="M9.75 11.5 L12 6 L14.25 11.5 Z" />
      <path d="M10.5 9.5 L13.5 9.5" />
    </IconBase>
  );
}
