import { listLiveAnsitze } from "../../server/modules/ansitze/queries";

export const dynamic = "force-dynamic";

export default async function AnsitzePage() {
  const activeAnsitze = await listLiveAnsitze();

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
              {activeAnsitze.length === 0 ? (
                <tr>
                  <td colSpan={5}>Keine aktiven Ansitze vorhanden.</td>
                </tr>
              ) : (
                activeAnsitze.map((entry) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
