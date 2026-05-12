import { requireSetupPageAuth } from "../../../server/auth/guards";

import { SetupWizard } from "./setup-wizard";

export const dynamic = "force-dynamic";

/**
 * Onboarding-Setup nach Public-Registration (P2.5). Statt einer
 * Single-Step-Form fuer Revierdaten leitet der Wizard durch vier
 * Schritte: Revierdaten (Pflicht), Einrichtungs-Hinweis (optional),
 * erste Einladung (optional), Fertig.
 *
 * Die `requireSetupPageAuth`-Gate sorgt dafuer, dass User mit
 * abgeschlossenem Setup automatisch zur App weiterspringen.
 */
export default async function SetupPage() {
  const viewer = await requireSetupPageAuth();

  return (
    <SetupWizard
      defaultValues={{
        revierName: viewer.revier.name,
        bundesland: viewer.revier.bundesland,
        bezirk: viewer.revier.bezirk,
        flaecheHektar: viewer.revier.flaecheHektar
      }}
      viewerName={viewer.user.name}
    />
  );
}
