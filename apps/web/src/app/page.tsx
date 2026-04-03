import { buildDashboardOverview, defaultRevierId, demoData } from "@ferm/domain";

import { MetricCard } from "../components/metric-card";
import { TerritoryPanel } from "../components/territory-panel";

export default function DashboardPage() {
  const overview = buildDashboardOverview(demoData, defaultRevierId);
  const activeAnsitze = demoData.ansitze.filter((entry) => entry.status === "active");

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Interner Leitstand</p>
          <h1>Revierbetrieb, Protokolle und Fallwild auf einen Blick.</h1>
          <p className="hero-copy">
            Live-Ansitze, Reviereinrichtungen, Protokollfreigaben und Fallwild-Ereignisse laufen in
            einer Oberfläche zusammen. Das Backoffice ist für Revierleitung und Schriftführung
            ausgelegt.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Aktives Revier</span>
          <strong>{overview.revier.name}</strong>
          <p>
            {overview.revier.bundesland} · {overview.revier.bezirk} · {overview.revier.flaecheHektar} ha
          </p>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          label="Aktive Ansitze"
          value={overview.aktiveAnsitze}
          detail={`${overview.ansitzeMitKonflikt} Konflikte benötigen Aufmerksamkeit.`}
        />
        <MetricCard
          label="Offene Wartungen"
          value={overview.offeneWartungen}
          detail="Aus Reviereinrichtungen und Kontrollmeldungen."
        />
        <MetricCard
          label="Heutige Fallwild-Bergungen"
          value={overview.heutigeFallwildBergungen}
          detail="Mit Foto- und Standortdokumentation."
        />
        <MetricCard
          label="Entwürfe"
          value={overview.unveroeffentlichteProtokolle}
          detail="Sitzungsprotokolle warten auf Freigabe."
        />
      </section>

      <div className="content-grid">
        <TerritoryPanel
          ansitze={activeAnsitze}
          einrichtungen={demoData.reviereinrichtungen}
          fallwild={demoData.fallwild}
        />

        <section className="activity-panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">Aktuelle Lage</p>
              <h2>Letzte Benachrichtigungen</h2>
            </div>
          </header>

          <div className="timeline">
            {overview.letzteBenachrichtigungen.map((entry) => (
              <article key={entry.id} className="timeline-item">
                <span>{entry.channel === "push" ? "Push" : "In-App"}</span>
                <strong>{entry.title}</strong>
                <p>{entry.body}</p>
                <time>{new Date(entry.createdAt).toLocaleString("de-AT")}</time>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="split-panel">
        <article className="panel-card">
          <p className="eyebrow">Nächste Sitzung</p>
          <h2>{overview.naechsteSitzung?.title}</h2>
          <p>{overview.naechsteSitzung?.locationLabel}</p>
          <span>{new Date(overview.naechsteSitzung?.scheduledAt ?? "").toLocaleString("de-AT")}</span>
        </article>

        <article className="panel-card">
          <p className="eyebrow">Aktive Ansitze</p>
          <div className="simple-list">
            {activeAnsitze.map((entry) => (
              <div key={entry.id}>
                <strong>{entry.standortName}</strong>
                <span>{new Date(entry.startedAt).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
