import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Protokoll — Dokumentblatt mit drei Textzeilen und einem Siegel-Kreis
 * unten rechts (beglaubigt).
 *
 * Das Siegel ist der entscheidende Unterschied zu einem normalen
 * Datei-Icon: Protokoll = unterzeichnet/abgeschlossen, nicht nur Datei.
 */
export function Protokoll(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Protokoll" {...props}>
      <path d="M5 3.5 L14.5 3.5 L19 8 L19 20.5 L5 20.5 Z" />
      <path d="M14.5 3.5 L14.5 8 L19 8" />
      <path d="M8 12 L15.5 12" />
      <path d="M8 14.5 L15.5 14.5" />
      <path d="M8 17 L12 17" />
      <circle cx="15.75" cy="17.25" r="1.5" />
    </IconBase>
  );
}
