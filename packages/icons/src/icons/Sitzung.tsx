import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Sitzung — runder Tisch in Aufsicht mit vier Stuehlen / Personen drum.
 *
 * Aufsicht statt Seitenansicht, weil die Seitenansicht im 24x24 zu sehr
 * nach "Cafe" aussieht. Aufsicht = Versammlung, Beschluss, Schriftfuehrung.
 */
export function Sitzung(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Sitzung" {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <ellipse cx="12" cy="4.5" rx="1.6" ry="1.2" />
      <ellipse cx="12" cy="19.5" rx="1.6" ry="1.2" />
      <ellipse cx="4.5" cy="12" rx="1.2" ry="1.6" />
      <ellipse cx="19.5" cy="12" rx="1.2" ry="1.6" />
    </IconBase>
  );
}
