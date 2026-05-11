import { requirePageAuth } from "../../../server/auth/guards";
import { listReviereinrichtungen } from "../../../server/modules/reviereinrichtungen/queries";
import { ReviereinrichtungenListClient } from "./reviereinrichtungen-list-client";

export const dynamic = "force-dynamic";

export default async function ReviereinrichtungenPage() {
  await requirePageAuth({ next: "/app/reviereinrichtungen" });
  const entries = await listReviereinrichtungen();
  const offeneWartungen = entries.reduce((sum, entry) => sum + entry.offeneWartungen, 0);
  const kontrollenHeute = entries.filter((entry) => entry.letzteKontrolleAt).length;

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Reviereinrichtungen</p>
          <h1>Standorte, Kontrollen und Wartungen im Blick.</h1>
          <p className="hero-copy">
            Hochstände, Fütterungen und weitere Einrichtungen mit Status, letzter Kontrolle und offenen
            Wartungen — gleicher Datenstand in Web und App.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Aktiver Bestand</span>
          <strong>{entries.length}</strong>
          <p>
            {offeneWartungen} offene Wartungen und {kontrollenHeute} Einrichtungen mit letzter Kontrolle.
          </p>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <span>Einrichtungen</span>
          <strong>{entries.length}</strong>
          <p>Gesamtzahl im aktiven Revier.</p>
        </article>
        <article className="metric-card">
          <span>Offene Wartungen</span>
          <strong>{offeneWartungen}</strong>
          <p>Beinhaltet nur noch offene Aufgaben.</p>
        </article>
        <article className="metric-card">
          <span>Kontrolliert</span>
          <strong>{kontrollenHeute}</strong>
          <p>Einrichtungen mit mindestens einer dokumentierten Kontrolle.</p>
        </article>
        <article className="metric-card">
          <span>Standorte</span>
          <strong>{entries.filter((entry) => entry.location.label).length}</strong>
          <p>Mit verwertbarer Lagebezeichnung.</p>
        </article>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Liste</p>
            <h2>Reviereinrichtungen und Status</h2>
          </div>
          <div className="section-actions">
            <a className="button-link" href="/api/v1/reviereinrichtungen/export.csv">
              CSV-Export
            </a>
          </div>
        </header>

        <ReviereinrichtungenListClient entries={entries} />
      </section>
    </div>
  );
}
