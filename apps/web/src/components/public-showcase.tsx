import {
  Ansitz,
  Fallwild,
  Fuetterung,
  HegeWordmark,
  Hochstand,
  Mitglied,
  Protokoll,
  Reviereinrichtung,
  Sitzung
} from "@hege/icons";
import { LayoutDashboard } from "lucide-react";

/**
 * Live-gerenderter Produkt-Showcase fuer die oeffentliche Landing-Seite.
 *
 * Statt statischer PNG-Screenshots zeigen wir das Produkt als HTML/CSS-
 * Komposition in den Marken-Tokens. Das hat drei Vorteile:
 *  - scharf bei jeder Pixeldichte (kein Image-Resampling, kein Asset-Pipeline)
 *  - aenderungstreu — wenn Tokens, Logo oder Icons sich aendern, zieht der
 *    Showcase automatisch nach
 *  - keine LCP-Last durch grosse Hero-Bilder
 *
 * Das ist eine Illustration, kein Screenshot — die Werte sind eingefroren
 * und enthalten keine echten Mandantendaten. Das `aria-label` auf der Bühne
 * macht das fuer Screenreader explizit.
 */

interface SidebarItem {
  label: string;
  Icon: (props: { size?: number; strokeWidth?: number }) => React.ReactNode;
  active?: boolean;
}

const SIDEBAR_ITEMS: ReadonlyArray<SidebarItem> = [
  { label: "Dashboard", Icon: LayoutDashboard, active: true },
  { label: "Sitzungen", Icon: Sitzung },
  { label: "Ansitze", Icon: Ansitz },
  { label: "Reviereinrichtungen", Icon: Reviereinrichtung },
  { label: "Fallwild", Icon: Fallwild },
  { label: "Protokolle", Icon: Protokoll },
  { label: "Mitglieder", Icon: Mitglied }
];

const METRICS = [
  { label: "Offene Wartungen", value: "3", trend: "−2 vs. Vorwoche" },
  { label: "Aktive Ansitze", value: "12", trend: "Jetzt im Revier" },
  { label: "Protokolle in Freigabe", value: "2", trend: "Versionen gepruefte" }
] as const;

const MAP_PINS = [
  { x: 22, y: 32, label: "Hochstand" },
  { x: 58, y: 24, label: "Fuetterung" },
  { x: 71, y: 58, label: "Hochstand" },
  { x: 38, y: 70, label: "Salzleck" }
] as const;

interface MobileTile {
  label: string;
  Icon: (props: { size?: number; strokeWidth?: number; color?: string }) => React.ReactNode;
}

const MOBILE_TILES: ReadonlyArray<MobileTile> = [
  { label: "Ansitz starten", Icon: Ansitz },
  { label: "Fallwild melden", Icon: Fallwild },
  { label: "Hochstand", Icon: Hochstand },
  { label: "Fuetterung", Icon: Fuetterung }
];

export function PublicShowcase() {
  return (
    <section className="public-showcase" aria-label="Produkt-Vorschau">
      <div className="public-section-head">
        <p className="eyebrow">Backoffice und App</p>
        <h2>Eine Datenbasis, zwei Oberflaechen.</h2>
        <p className="public-section-note public-section-note-left">
          Web fuer Revierleitung und Schriftfuehrung, App fuers Jagdteam im Feld. Die Werte unten sind
          eine Illustration, keine Screenshots.
        </p>
      </div>

      <div className="public-showcase-stage">
        <BackofficeMockup />
        <MobileMockup />
      </div>
    </section>
  );
}

function BackofficeMockup() {
  return (
    <div
      className="public-mockup public-mockup-web"
      role="img"
      aria-label="Schematische Darstellung des hege Backoffice mit Seitenleiste, Kennzahlen und Reviergebiet"
    >
      <div className="public-mockup-chrome">
        <span className="public-mockup-dot" />
        <span className="public-mockup-dot" />
        <span className="public-mockup-dot" />
        <span className="public-mockup-url">app.hege / Dashboard</span>
      </div>

      <div className="public-mockup-body">
        <aside className="public-mockup-sidebar" aria-hidden="true">
          <div className="public-mockup-brand">
            <HegeWordmark size={22} color="#f5f1e7" />
          </div>
          <nav className="public-mockup-nav">
            {SIDEBAR_ITEMS.map((item) => (
              <span
                key={item.label}
                className={`public-mockup-nav-item${item.active ? " is-active" : ""}`}
              >
                <item.Icon size={16} strokeWidth={1.6} />
                <span>{item.label}</span>
              </span>
            ))}
          </nav>
          <div className="public-mockup-user">
            <span className="public-mockup-avatar">JG</span>
            <div>
              <strong>Jaegerschaft</strong>
              <small>Revier-Admin</small>
            </div>
          </div>
        </aside>

        <div className="public-mockup-main">
          <div className="public-mockup-hero" aria-hidden="true">
            <div>
              <p className="eyebrow">Heute im Revier</p>
              <h3>3 offene Wartungen, 12 aktive Ansitze.</h3>
            </div>
            <span className="public-mockup-pill">Live</span>
          </div>

          <div className="public-mockup-metrics" aria-hidden="true">
            {METRICS.map((metric) => (
              <div key={metric.label} className="public-mockup-metric">
                <small>{metric.label}</small>
                <strong>{metric.value}</strong>
                <span>{metric.trend}</span>
              </div>
            ))}
          </div>

          <div className="public-mockup-map" aria-hidden="true">
            <div className="public-mockup-map-grid" />
            {MAP_PINS.map((pin, index) => (
              <span
                key={`${pin.label}-${index}`}
                className="public-mockup-pin"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span className="public-mockup-pin-dot" />
              </span>
            ))}
            <div className="public-mockup-map-caption">
              <span className="eyebrow">Reviergebiet</span>
              <strong>4 Einrichtungen sichtbar</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileMockup() {
  return (
    <div
      className="public-mockup public-mockup-mobile"
      role="img"
      aria-label="Schematische Darstellung des Heute-Tabs der hege App mit Schnellaktionen"
    >
      <div className="public-mockup-phone">
        <div className="public-mockup-phone-notch" aria-hidden="true" />
        <div className="public-mockup-phone-screen">
          <div className="public-mockup-phone-status" aria-hidden="true">
            <span>9:41</span>
            <span className="public-mockup-phone-status-icons">
              <span className="public-mockup-phone-status-bar" />
              <span className="public-mockup-phone-status-bar" />
              <span className="public-mockup-phone-status-battery" />
            </span>
          </div>

          <div className="public-mockup-phone-body">
            <div className="public-mockup-phone-eyebrow">
              <span className="eyebrow">Heute</span>
              <strong>Donnerstag</strong>
            </div>
            <h3 className="public-mockup-phone-title">Servus Andreas, was steht an?</h3>

            <div className="public-mockup-phone-card" aria-hidden="true">
              <div>
                <small>Naechster Ansitz</small>
                <strong>Hochstand 4 · 17:30</strong>
              </div>
              <span className="public-mockup-phone-pill">Vorgemerkt</span>
            </div>

            <div className="public-mockup-phone-grid" aria-hidden="true">
              {MOBILE_TILES.map((tile) => (
                <div key={tile.label} className="public-mockup-phone-tile">
                  <span className="public-mockup-phone-tile-icon">
                    <tile.Icon size={20} strokeWidth={1.6} color="currentColor" />
                  </span>
                  <span>{tile.label}</span>
                </div>
              ))}
            </div>

            <div className="public-mockup-phone-queue" aria-hidden="true">
              <span className="eyebrow">Queue</span>
              <strong>2 Eintraege warten auf Sync</strong>
              <small>Wird beim naechsten Online-Status uebertragen.</small>
            </div>
          </div>

          <div className="public-mockup-phone-tabbar" aria-hidden="true">
            <span className="public-mockup-phone-tab is-active">Heute</span>
            <span className="public-mockup-phone-tab">Ansitze</span>
            <span className="public-mockup-phone-tab">Fallwild</span>
            <span className="public-mockup-phone-tab">Mehr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
