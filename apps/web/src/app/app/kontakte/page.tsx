import { requirePageAuth } from "../../../server/auth/guards";
import { getRequestContext } from "../../../server/auth/context";
import { listContactDirectory } from "../../../server/modules/contacts/service";
import { KontakteClient } from "./kontakte-client";

export const dynamic = "force-dynamic";

export default async function KontaktePage() {
  await requirePageAuth({ next: "/app/kontakte" });
  const requestContext = await getRequestContext();
  const directory = await listContactDirectory(requestContext);
  const freeContactCount = directory.lists.reduce((sum, list) => sum + list.entries.length, 0);

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Kontakte</p>
          <h1>Telefonlisten für Revier und Einsatzfälle.</h1>
          <p className="hero-copy">
            Mitglieder werden automatisch aus hege übernommen. Reviernachbarn, Notrufnummern und weitere
            Listen können frei gepflegt werden.
          </p>
        </div>
        <div className="hero-highlight">
          <span>Kontakte</span>
          <strong>{directory.registeredMembers.length + freeContactCount}</strong>
          <p>
            {directory.registeredMembers.length} registrierte Mitglieder und {freeContactCount} freie
            Listeneinträge.
          </p>
        </div>
      </section>

      <KontakteClient directory={directory} />
    </div>
  );
}
