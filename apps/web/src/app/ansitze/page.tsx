import { demoData } from "@ferm/domain";

export default function AnsitzePage() {
  const activeAnsitze = demoData.ansitze.filter((entry) => entry.status === "active");

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Ansitzmanagement</p>
            <h1>Aktive Ansitze und Konfliktlage</h1>
          </div>
          <span className="badge">{activeAnsitze.length} aktiv</span>
        </header>

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Standort</th>
                <th>Beginn</th>
                <th>Geplantes Ende</th>
                <th>Status</th>
                <th>Notiz</th>
              </tr>
            </thead>
            <tbody>
              {activeAnsitze.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <strong>{entry.standortName}</strong>
                    <span>{entry.location.label}</span>
                  </td>
                  <td>{new Date(entry.startedAt).toLocaleString("de-AT")}</td>
                  <td>{entry.plannedEndAt ? new Date(entry.plannedEndAt).toLocaleString("de-AT") : "Offen"}</td>
                  <td>
                    <span className={entry.conflict ? "status-pill status-danger" : "status-pill status-ok"}>
                      {entry.conflict ? "Warnung" : "Aktiv"}
                    </span>
                  </td>
                  <td>{entry.note ?? "Keine Notiz"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
