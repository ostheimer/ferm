import Link from "next/link";

import { requirePageAuth } from "../../../server/auth/guards";
import { listProtokolle } from "../../../server/modules/protokolle/queries";

export const dynamic = "force-dynamic";

export default async function ProtokollePage() {
  await requirePageAuth({ next: "/app/protokolle" });
  const protokolle = await listProtokolle();

  return (
    <div className="page-stack">
      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Sitzungsprotokolle</p>
            <h1>Freigegebene Protokolle und Beschluesse</h1>
          </div>
          <span className="badge">{protokolle.length} veroeffentlicht</span>
        </header>

        <div className="card-grid">
          {protokolle.length === 0 ? (
            <article className="detail-card">
              <p className="eyebrow">Protokolle</p>
              <h2>Keine freigegebenen Protokolle vorhanden</h2>
              <p>Sobald ein Protokoll veroeffentlicht wird, erscheint es hier samt Download-Referenz.</p>
            </article>
          ) : (
            protokolle.map((entry) => (
              <article key={entry.id} className="detail-card">
                <div className="detail-card-header">
                  <div>
                    <p className="eyebrow">Freigegeben</p>
                    <h2>{entry.title}</h2>
                  </div>
                  <span className="status-pill status-ok">{entry.status}</span>
                </div>

                <p>{entry.locationLabel}</p>
                <p>{formatDateTime(entry.scheduledAt)}</p>
                {entry.summaryPreview ? <p>{entry.summaryPreview}</p> : null}

                <div className="simple-list">
                  <div>
                    <strong>{entry.beschlussCount} Beschluesse</strong>
                    <span>{entry.latestVersionCreatedAt ? `Letzte Version: ${formatDateTime(entry.latestVersionCreatedAt)}` : "Keine Version"}</span>
                  </div>
                  {entry.publishedDocument ? (
                    <div>
                      <strong>PDF verfuegbar</strong>
                      <Link href={entry.publishedDocument.downloadUrl}>Dokument oeffnen</Link>
                    </div>
                  ) : null}
                </div>

                <Link className="button-link" href={`/app/protokolle/${entry.id}`}>
                  Protokoll lesen
                </Link>
              </article>
            ))
          )}
        </div>
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
