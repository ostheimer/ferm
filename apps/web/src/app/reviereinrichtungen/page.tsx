import { demoData } from "@ferm/domain";

export default function ReviereinrichtungenPage() {
  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Reviereinrichtungen</p>
            <h1>Standorte, Zustand und Wartung</h1>
          </div>
        </header>

        <div className="card-grid">
          {demoData.reviereinrichtungen.map((entry) => (
            <article key={entry.id} className="detail-card">
              <div className="detail-card-header">
                <div>
                  <p className="eyebrow">{entry.type}</p>
                  <h2>{entry.name}</h2>
                </div>
                <span
                  className={
                    entry.status === "gut" ? "status-pill status-ok" : "status-pill status-warning"
                  }
                >
                  {entry.status}
                </span>
              </div>

              <p>{entry.beschreibung}</p>
              <strong>{entry.location.label}</strong>
              <p>{entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}</p>

              <div className="simple-list">
                {entry.wartung.length > 0 ? (
                  entry.wartung.map((wartung) => (
                    <div key={wartung.id}>
                      <strong>{wartung.title}</strong>
                      <span>Fällig bis {new Date(wartung.dueAt).toLocaleString("de-AT")}</span>
                    </div>
                  ))
                ) : (
                  <div>
                    <strong>Keine offene Wartung</strong>
                    <span>Zuletzt kontrolliert: {entry.kontrollen[0] ? new Date(entry.kontrollen[0].createdAt).toLocaleDateString("de-AT") : "Noch keine Kontrolle"}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
