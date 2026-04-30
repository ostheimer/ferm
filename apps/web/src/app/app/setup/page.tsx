import { requireSetupPageAuth } from "../../../server/auth/guards";

import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const viewer = await requireSetupPageAuth();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Einrichtung erforderlich</p>
          <h1>Das Revier ist noch nicht vollständig eingerichtet.</h1>
          <p className="hero-copy">
            {viewer.revier.name} ist angemeldet, aber die Setup-Schritte sind noch offen. Sobald die
            Einrichtung abgeschlossen ist, leitet das System automatisch zur App weiter.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Aktuelles Revier</span>
          <strong>{viewer.revier.name}</strong>
          <p>{viewer.membership.jagdzeichen}</p>
        </div>
      </section>

      <section className="section-card">
        <header className="section-header">
          <div>
            <p className="eyebrow">Setup</p>
            <h2>Bitte Revierdaten vervollständigen</h2>
          </div>
        </header>

        <SetupForm
          defaultValues={{
            revierName: viewer.revier.name,
            bundesland: viewer.revier.bundesland,
            bezirk: viewer.revier.bezirk,
            flaecheHektar: viewer.revier.flaecheHektar
          }}
          viewerName={viewer.user.name}
        />
      </section>
    </div>
  );
}
