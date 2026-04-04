import { MetricCard } from "../components/metric-card";
import { TerritoryPanel } from "../components/territory-panel";
import { requirePageAuth } from "../server/auth/guards";
import { getDashboardSnapshot } from "../server/modules/dashboard/queries";
import { listReviereinrichtungen } from "../server/modules/reviereinrichtungen/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const context = await requirePageAuth();
  const [dashboard, einrichtungen] = await Promise.all([
    getDashboardSnapshot({ context }),
    listReviereinrichtungen()
  ]);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Interner Leitstand</p>
          <h1>Revierbetrieb, Protokolle und Fallwild auf einen Blick.</h1>
          <p className="hero-copy">
            Aktive Ansitze, Reviereinrichtungen, Protokollfreigaben und Fallwild-Ereignisse laufen in
            einer Oberflaeche zusammen. Das Backoffice ist fuer Revierleitung und Schriftfuehrung
            ausgelegt.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Aktives Revier</span>
          <strong>{dashboard.revier.name}</strong>
          <p>
            {dashboard.revier.bundesland} | {dashboard.revier.bezirk} | {dashboard.revier.flaecheHektar} ha
          </p>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          label="Aktive Ansitze"
          value={dashboard.overview.aktiveAnsitze}
          detail={`${dashboard.overview.ansitzeMitKonflikt} Konflikte benoetigen Aufmerksamkeit.`}
        />
        <MetricCard
          label="Offene Wartungen"
          value={dashboard.overview.offeneWartungen}
          detail="Aus Reviereinrichtungen und Kontrollmeldungen."
        />
        <MetricCard
          label="Heutige Fallwild-Bergungen"
          value={dashboard.overview.heutigeFallwildBergungen}
          detail="Mit Foto- und Standortdokumentation."
        />
        <MetricCard
          label="Entwuerfe"
          value={dashboard.overview.unveroeffentlichteProtokolle}
          detail="Sitzungsprotokolle warten auf Freigabe."
        />
      </section>

      <div className="content-grid">
        <TerritoryPanel ansitze={dashboard.activeAnsitze} einrichtungen={einrichtungen} fallwild={dashboard.recentFallwild} />

        <section className="activity-panel">
          <header className="section-header">
            <div>
              <p className="eyebrow">Aktuelle Lage</p>
              <h2>Letzte Benachrichtigungen</h2>
            </div>
          </header>

          <div className="timeline">
            {dashboard.overview.letzteBenachrichtigungen.map((entry) => (
              <article key={entry.id} className="timeline-item">
                <span>{entry.channel === "push" ? "Push" : "In-App"}</span>
                <strong>{entry.title}</strong>
                <p>{entry.body}</p>
                <time>{formatDateTime(entry.createdAt)}</time>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="split-panel">
        <article className="panel-card">
          <p className="eyebrow">Naechste Sitzung</p>
          <h2>{dashboard.overview.naechsteSitzung?.title ?? "Keine Sitzung geplant"}</h2>
          <p>{dashboard.overview.naechsteSitzung?.locationLabel ?? "Noch kein Ort hinterlegt"}</p>
          {dashboard.overview.naechsteSitzung ? <span>{formatDateTime(dashboard.overview.naechsteSitzung.scheduledAt)}</span> : null}
        </article>

        <article className="panel-card">
          <p className="eyebrow">Aktive Ansitze</p>
          <div className="simple-list">
            {dashboard.activeAnsitze.map((entry) => (
              <div key={entry.id}>
                <strong>{entry.standortName}</strong>
                <span>{formatTime(entry.startedAt)}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Vienna"
  }).format(new Date(value));
}
