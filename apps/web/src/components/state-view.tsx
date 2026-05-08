import { AlertTriangle, CircleDashed, Loader2, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type StateViewMode = "loading" | "empty" | "error";

interface StateViewActionLink {
  label: string;
  href: string;
}

interface StateViewActionButton {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

type StateViewAction = StateViewActionLink | StateViewActionButton;

interface StateViewProps {
  mode: StateViewMode;
  /**
   * Headline like "Noch keine Reviermeldungen". Pflicht.
   */
  title: string;
  /**
   * Beschreibung in 1-2 Saetzen, was als Naechstes passiert.
   */
  description?: string;
  /**
   * Custom-Icon ueberschreibt das Default-Icon je Mode.
   */
  icon?: LucideIcon;
  /**
   * Optionaler CTA. Link oder Button.
   */
  action?: StateViewAction;
  /**
   * Falls die Komponente in einem Layout-Container haengt, der schon
   * eine Card-Surface hat, kann das eigene Card-Wrapping abgeschaltet werden.
   */
  bare?: boolean;
}

/**
 * Vereinheitlichte Empty/Loading/Error-Anzeige fuer das Backoffice.
 *
 * Voice-Regeln (siehe docs/design-system-v1.md):
 * - Title beschreibt den Zustand, nicht den Tool-Vorgang.
 * - Description sagt, was als Naechstes passiert oder was der Nutzer tun kann.
 * - Action ist verb-getrieben.
 */
export function StateView({ mode, title, description, icon, action, bare }: StateViewProps) {
  const Icon = icon ?? defaultIcon(mode);
  const containerClass = bare ? "state-view state-view-bare" : "state-view";
  const iconClass = mode === "loading" ? "state-view-icon-svg state-view-icon-spin" : "state-view-icon-svg";

  return (
    <section
      aria-live={mode === "error" ? "assertive" : "polite"}
      className={containerClass}
      role={mode === "error" ? "alert" : "status"}
    >
      <div className={`state-view-icon state-view-icon-${mode}`} aria-hidden="true">
        <Icon className={iconClass} size={24} strokeWidth={1.8} />
      </div>
      <div className="state-view-body">
        <h2 className="state-view-title">{title}</h2>
        {description ? <p className="state-view-description">{description}</p> : null}
      </div>
      {action ? <div className="state-view-action">{renderAction(action)}</div> : null}
    </section>
  );
}

function defaultIcon(mode: StateViewMode): LucideIcon {
  switch (mode) {
    case "loading":
      return Loader2;
    case "error":
      return AlertTriangle;
    case "empty":
    default:
      return CircleDashed;
  }
}

function renderAction(action: StateViewAction) {
  if ("href" in action) {
    return (
      <Link className="button-control button-control-secondary" href={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button
      className="button-control button-control-secondary"
      disabled={action.disabled}
      onClick={action.onClick}
      type="button"
    >
      {action.label}
    </button>
  );
}
