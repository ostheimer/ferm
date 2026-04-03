import { listLiveAnsitze } from "../../server/modules/ansitze/queries";
import { AnsitzeClient } from "./ansitze-client";

export const dynamic = "force-dynamic";

export default async function AnsitzePage() {
  const activeAnsitze = await listLiveAnsitze();

  return <AnsitzeClient activeAnsitze={activeAnsitze} />;
}
