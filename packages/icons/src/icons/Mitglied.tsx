import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Mitglied — Kopf-und-Schulter-Silhouette mit angedeutetem Kragen.
 *
 * Bewusst ohne Hut/Stetson — das Icon steht fuer alle Rollen
 * (Schriftfuehrung, Jaeger, Ausgeher, Admin). Der kleine Kragen-Knick
 * macht es zur "Person im Verein", nicht zu einem generischen User-Icon.
 */
export function Mitglied(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Mitglied" {...props}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.5 20.5 C 4.5 16.5 7.75 13.5 12 13.5 C 16.25 13.5 19.5 16.5 19.5 20.5" />
      <path d="M10.25 14 L12 16 L13.75 14" />
    </IconBase>
  );
}
