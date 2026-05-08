import * as React from "react";

/**
 * Geteilte Props fuer alle hege-Domain-Icons.
 *
 * Konvention: Lucide-Linienstil, 24x24 viewBox, `currentColor` und
 * `stroke-width` 1.8 als Default. Damit fuegen sich die Icons in jede
 * Sidebar/Empty-State ein, ohne dass der Aufrufer Farben verteilen muss.
 *
 * Wir verzichten bewusst auf `React.forwardRef` — kein Aufrufer braucht
 * eine Ref auf das Icon-SVG, und die `ForwardRefExoticComponent`-Tipps
 * sind ueber Workspace-Grenzen hinweg fragil (uneinheitliche
 * `ReactNode`-Resolutionen). Plain Function-Components reichen.
 */
export interface HegeIconProps {
  /** Quadratische Render-Groesse in px. Default 24. */
  size?: number | string;
  /** Strichfarbe. Default `currentColor`. */
  color?: string;
  /** Strichstaerke. Default 1.8 (matcht Lucide-Wirkung). */
  strokeWidth?: number;
  /** Zusaetzliche CSS-Klasse(n). */
  className?: string;
  /** Inline-Style-Override. */
  style?: React.CSSProperties;
  /** Optionales aria-label. Wenn gesetzt, wird `role="img"` ergaenzt. */
  "aria-label"?: string;
  /** Optionales aria-hidden. */
  "aria-hidden"?: boolean | "true" | "false";
}

interface IconBaseProps extends HegeIconProps {
  children: React.ReactNode;
  /** Default aria-label, wenn der Aufrufer keinen setzt. */
  defaultAriaLabel: string;
}

export function IconBase({
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
  className,
  style,
  children,
  defaultAriaLabel,
  ...aria
}: IconBaseProps) {
  const ariaLabel = aria["aria-label"] ?? defaultAriaLabel;
  const ariaHidden = aria["aria-hidden"];
  // Wenn der Aufrufer aria-hidden explizit setzt, gewinnt das. Sonst gilt
  // role=img + aria-label, weil die Icons benannt sind.
  const accessibility =
    ariaHidden !== undefined
      ? { "aria-hidden": ariaHidden }
      : { role: "img" as const, "aria-label": ariaLabel };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...accessibility}
    >
      {children}
    </svg>
  );
}
