import * as React from "react";
import { IconBase, type HegeIconProps } from "./IconBase";

/**
 * Hochstand — erhoehter Ansitzstuhl auf vier Stelzen mit spitzem Pultdach.
 *
 * Ich habe bewusst **vier** Stelzen statt zwei gezeichnet (Realitaet im
 * Revier), Schraegstreben fuer Stabilitaet und ein leicht ueberhaengendes
 * Dach. Die kleine Diagonale rechts ist die Aufstiegsleiter — wichtig, weil
 * "ohne Leiter" wie ein Vogelhaus aussehen wuerde.
 */
export function Hochstand(props: HegeIconProps): React.JSX.Element {
  return (
    <IconBase defaultAriaLabel="Hochstand" {...props}>
      <path d="M3.5 7.5 L12 3 L20.5 7.5" />
      <path d="M5.5 7.5 L5.5 12 L18.5 12 L18.5 7.5" />
      <path d="M9 9.25 L15 9.25" />
      <path d="M6.5 12 L4.5 21" />
      <path d="M9.5 12 L8.5 21" />
      <path d="M14.5 12 L15.5 21" />
      <path d="M17.5 12 L19.5 21" />
      <path d="M5.5 16.5 L18.5 16.5" />
      <path d="M16 14.25 L17 14.25" />
      <path d="M15.5 19 L16.5 19" />
    </IconBase>
  );
}
