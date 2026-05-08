import * as React from "react";
import { HegeWordmark, type HegeWordmarkProps } from "./HegeWordmark";

/**
 * Helle Variante des Wordmarks fuer dunkle Hintergruende
 * (Cream `#fff9ef`).
 *
 * Der Cream-Ton matcht das `surfaceCard`-Off-White und wirkt auf der
 * dunklen Sidebar-Surface waermer als reines Weiss. Die Komponente
 * setzt nur den Color-Default — alle anderen Props gehen 1:1 an
 * `<HegeWordmark />`.
 */
export type HegeWordmarkLightProps = Omit<HegeWordmarkProps, "color"> & {
  /** Optionales Override; Default ist der Cream-Ton `#fff9ef`. */
  color?: string;
};

export function HegeWordmarkLight({
  color = "#fff9ef",
  ...rest
}: HegeWordmarkLightProps): React.JSX.Element {
  return <HegeWordmark color={color} {...rest} />;
}
