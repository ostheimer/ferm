import Link from "next/link";

import { PUBLIC_PRICING_PLANS } from "../lib/public-site";

const features = [
  {
    title: "Revierbetrieb auf einer Linie",
    text: "Ansitze, Einrichtungen, Fallwild und Protokolle greifen auf dieselbe Revierbasis zu."
  },
  {
    title: "Freigaben ohne Medienbruch",
    text: "Sitzungen, Versionen, Freigaben und Dokument-Download bleiben in einem klaren Arbeitsfluss."
  },
  {
    title: "Backoffice und App zusammen",
    text: "Web fuer Leitung und Schriftfuehrung, App fuer Jagdteam und Meldungen aus dem Feld."
  },
  {
    title: "Offline zuerst gedacht",
    text: "Ansitz- und Fallwild-Eintraege koennen unterwegs vorgemerkt und spaeter synchronisiert werden."
  }
] as const;

const useCases = [
  {
    eyebrow: "Revierleitung",
    title: "Schneller Ueberblick statt verstreuter Tabellen",
    text: "Offene Wartungen, aktive Ansitze und aktuelle Meldungen stehen ohne Wechsel zwischen Werkzeugen bereit."
  },
  {
    eyebrow: "Schriftfuehrung",
    title: "Sitzungen bis zur Freigabe sauber fuehren",
    text: "Agenda, Beschluesse, Versionen und PDF-Download folgen einem nachvollziehbaren Ablauf."
  },
  {
    eyebrow: "Jagdteam",
    title: "Weniger Tippen, mehr Feldarbeit",
    text: "Ansitz und Fallwild lassen sich direkt erfassen, auch wenn die Verbindung nicht perfekt ist."
  }
] as const;

const faq = [
  {
    q: "Ist hege nur fuer das Backoffice gedacht?",
    a: "Nein. Die Plattform verbindet das interne Reviermanagement mit einer klaren oeffentlichen Produktseite und einem spaeteren Self-Serve-Einstieg."
  },
  {
    q: "Was kostet der Einstieg?",
    a: "Die Preisstufen sind vorbereitet. Starter und Revier sind Self-Serve, Organisation bleibt als Kontaktpaket."
  },
  {
    q: "Brauche ich zuerst eine komplexe Einrichtung?",
    a: "Nein. Der Einstieg ist bewusst schmal gehalten. Ein Revier kann schnell angelegt und im Setup vervollstaendigt werden."
  },
  {
    q: "Funktioniert die App auch unterwegs?",
    a: "Ja. Die mobilen Kernflows sind auf kurze Erfassung, Queue und spaetere Synchronisierung ausgelegt."
  }
] as const;

export function PublicLanding() {
  return (
    <main className="public-landing">
      <div className="public-landing-backdrop" aria-hidden="true">
        <div className="public-landing-orb public-landing-orb-left" />
        <div className="public-landing-orb public-landing-orb-right" />
      </div>

      <div className="public-landing-shell">
        <header className="public-topbar">
          <div className="public-brand">
            <div className="public-brand-mark">h</div>
            <div>
              <p className="eyebrow">Reviermanagement</p>
              <strong>hege</strong>
            </div>
          </div>

          <nav className="public-topbar-actions" aria-label="Schnellzugriff">
            <Link className="button-control button-control-secondary" href="/login">
              Anmelden
            </Link>
            <Link className="button-control" href="#preise">
              Preise ansehen
            </Link>
          </nav>
        </header>

        <section className="public-hero">
          <div className="public-hero-copy">
            <p className="eyebrow">Revierdigitalisierung</p>
            <h1>Revierbetrieb, Protokolle und Feldmeldungen in einer klaren Oberflaeche.</h1>
            <p className="public-hero-text">
              hege verbindet die Arbeit im Backoffice mit der Erfassung draussen. Fuer Revierleitung,
              Schriftfuehrung und Jagdteam, die ohne Tool-Wirrwarr arbeiten wollen.
            </p>

            <div className="public-hero-actions">
              <Link className="button-control" href="#preise">
                Passendes Paket waehlen
              </Link>
              <Link className="button-control button-control-secondary" href="/login">
                Anmelden
              </Link>
            </div>

            <dl className="public-stat-row" aria-label="Kurzfakten">
              <div className="public-stat">
                <dt>1 Datenbasis</dt>
                <dd>Web und App greifen auf dieselben Revierdaten zu.</dd>
              </div>
              <div className="public-stat">
                <dt>3 Rollen</dt>
                <dd>Revier-Admin, Schriftfuehrung und Jagdteam im selben System.</dd>
              </div>
              <div className="public-stat">
                <dt>Offline-Fokus</dt>
                <dd>Feldmeldungen laufen mit Queue und spaeterer Synchronisierung.</dd>
              </div>
            </dl>
          </div>

          <aside className="public-hero-panel">
            <p className="eyebrow">Was hege abdeckt</p>
            <ul className="public-hero-list">
              <li>Dashboard fuer Revierleitung und Lagebild</li>
              <li>Sitzungen, Versionen, Freigaben und PDF-Download</li>
              <li>Ansitze, Reviereinrichtungen und Fallwild</li>
              <li>Mobile Erfassung mit Queue und Offline-Vormerkung</li>
            </ul>
            <div className="public-proof">
              <span>Fuer Jagdgesellschaften in Oesterreich</span>
              <strong>einfacher Einstieg, klare Rollen, saubere Datenbasis.</strong>
            </div>
          </aside>
        </section>

        <section className="public-section" id="features">
          <div className="public-section-head">
            <p className="eyebrow">Nutzen</p>
            <h2>Warum hege im Alltag weniger Reibung erzeugt.</h2>
          </div>

          <div className="public-feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="public-card public-feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-head">
            <p className="eyebrow">Rollen</p>
            <h2>Jeder sieht, was er wirklich braucht.</h2>
          </div>

          <div className="public-usecase-grid">
            {useCases.map((item) => (
              <article key={item.title} className="public-card public-usecase-card">
                <span>{item.eyebrow}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section" id="preise">
          <div className="public-section-head public-section-head-row">
            <div>
              <p className="eyebrow">Pricing</p>
              <h2>Transparente Pakete mit klarem Einstieg.</h2>
            </div>
            <p className="public-section-note">
              Starter und Revier sind Self-Serve. Organisation ist als begleitetes Paket gedacht.
            </p>
          </div>

          <div className="public-pricing-grid">
            {PUBLIC_PRICING_PLANS.map((plan) => (
              <article key={plan.key} className="public-card public-pricing-card">
                <div className="public-pricing-head">
                  <div>
                    <p className="eyebrow">{plan.audience}</p>
                    <h3>{plan.name}</h3>
                  </div>
                  <div className="public-price">{plan.priceLabel}</div>
                </div>

                <p className="public-pricing-text">{plan.description}</p>

                <ul className="public-bullet-list">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>

                <div className="public-pricing-actions">
                  <Link className="button-control" href={plan.ctaHref}>
                    {plan.ctaLabel}
                  </Link>
                  {plan.isSelfServe ? (
                    <Link className="button-control button-control-secondary" href="/login">
                      Bereits Kunde? Anmelden
                    </Link>
                  ) : (
                    <a className="button-control button-control-secondary" href="mailto:info@hege.app">
                      Kurz anfragen
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="public-section">
          <div className="public-section-head">
            <p className="eyebrow">FAQ</p>
            <h2>Die wichtigsten Fragen auf einen Blick.</h2>
          </div>

          <div className="public-faq-grid">
            {faq.map((entry) => (
              <details key={entry.q} className="public-card public-faq-card">
                <summary>{entry.q}</summary>
                <p>{entry.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="public-cta-band">
          <div>
            <p className="eyebrow">Naechster Schritt</p>
            <h2>hege fuer dein Revier starten oder direkt einsteigen.</h2>
          </div>
          <div className="public-cta-actions">
            <Link className="button-control" href="/login">
              Anmelden
            </Link>
            <Link className="button-control button-control-secondary" href="#preise">
              Registrierung waehlen
            </Link>
          </div>
        </section>

        <footer className="public-footer">
          <span>Kontakt: info@hege.app</span>
          <span>Produkt fuer Reviermanagement in Oesterreich</span>
        </footer>
      </div>
    </main>
  );
}
