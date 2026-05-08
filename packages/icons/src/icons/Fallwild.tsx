import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Fallwild — Reh-/Hirschgeweih, sechs Enden, frontal-symmetrisch.
 *
 * Kein "totes Reh" und kein Schaedel — wuerde im UI hart wirken. Das
 * Geweih ist im Forst die universelle Markierung fuer Wild und liest
 * sich gleichzeitig respektvoll.
 */
export function Fallwild(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Fallwild" {...props}>
      <path d="M9.5 19 L12 16.5 L14.5 19" />
      <path d="M10.5 17.5 C 9 14 7 12 5 8" />
      <path d="M9.25 14.5 C 7.5 13 6 12 4 11" />
      <path d="M7.75 11 C 6.5 9.5 6 8 5.5 5" />
      <path d="M13.5 17.5 C 15 14 17 12 19 8" />
      <path d="M14.75 14.5 C 16.5 13 18 12 20 11" />
      <path d="M16.25 11 C 17.5 9.5 18 8 18.5 5" />
    </IconBase>
  );
}
