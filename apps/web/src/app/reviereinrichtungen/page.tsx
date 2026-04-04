import { requirePageAuth } from "../../server/auth/guards";
import { listReviereinrichtungen } from "../../server/modules/reviereinrichtungen/queries";

export default async function ReviereinrichtungenPage() {
  await requirePageAuth();
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
            Hochstaende, Fuetterungen und andere Einrichtungen werden lesend aus der Server-Schicht geladen.
            Zustandswechsel und Wartungsbedarf bleiben damit in Web und App auf derselben Datenbasis.
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
        </header>

        <div className="card-grid">
          {entries.map((entry) => (
            <article key={entry.id} className="detail-card">
              <div className="detail-card-header">
                <div>
                  <p className="eyebrow">{entry.type}</p>
                  <h2>{entry.name}</h2>
                </div>
                <span className={entry.status === "gut" ? "status-pill status-ok" : "status-pill status-warning"}>
                  {entry.status}
                </span>
              </div>

              <p>{entry.beschreibung ?? "Keine Beschreibung hinterlegt."}</p>
              <strong>{entry.location.label ?? "Ohne Lagebezeichnung"}</strong>
              <p>
                {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}
              </p>

              <div className="simple-list">
                <div>
                  <strong>Letzte Kontrolle</strong>
                  <span>
                    {entry.letzteKontrolleAt
                      ? new Date(entry.letzteKontrolleAt).toLocaleString("de-AT")
                      : "Noch keine Kontrolle"}
                  </span>
                </div>
                <div>
                  <strong>Offene Wartungen</strong>
                  <span>{entry.offeneWartungen}</span>
                </div>
                <div>
                  <strong>Kontrollen gesamt</strong>
                  <span>{entry.kontrollen.length}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
