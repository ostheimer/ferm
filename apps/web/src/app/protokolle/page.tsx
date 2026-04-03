import { demoData } from "@ferm/domain";

export default function ProtokollePage() {
  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Sitzungsprotokolle</p>
            <h1>Entwürfe, Beschlüsse und Veröffentlichung</h1>
          </div>
        </header>

        <div className="card-grid">
          {demoData.sitzungen.map((entry) => (
            <article key={entry.id} className="detail-card">
              <div className="detail-card-header">
                <div>
                  <p className="eyebrow">{entry.status === "entwurf" ? "Entwurf" : "Freigegeben"}</p>
                  <h2>{entry.title}</h2>
                </div>
                <span className="status-pill status-warning">{entry.status}</span>
              </div>

              <p>{entry.locationLabel}</p>
              <p>{new Date(entry.scheduledAt).toLocaleString("de-AT")}</p>

              <div className="simple-list">
                {entry.versions[0]?.beschluesse.map((beschluss) => (
                  <div key={beschluss.id}>
                    <strong>{beschluss.title}</strong>
                    <span>{beschluss.decision}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
