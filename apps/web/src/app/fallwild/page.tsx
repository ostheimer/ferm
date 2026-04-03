import { demoData } from "@hege/domain";

import { toPublicApiUrl } from "../../lib/public-urls";

export default function FallwildPage() {
  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Fallwild</p>
            <h1>Bergungen, Fotos und Export</h1>
          </div>
          <a className="button-link" href={toPublicApiUrl("/fallwild/export.csv")}>
            CSV-Export
          </a>
        </header>

        <div className="timeline">
          {demoData.fallwild.map((entry) => (
            <article key={entry.id} className="timeline-item">
              <span>{entry.wildart}</span>
              <strong>
                {entry.gemeinde} · {entry.strasse ?? "ohne Straße"}
              </strong>
              <p>
                {entry.geschlecht}, {entry.altersklasse} · Status {entry.bergungsStatus}
              </p>
              <time>{new Date(entry.recordedAt).toLocaleString("de-AT")}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
