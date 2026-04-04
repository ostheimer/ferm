import { Client } from "pg";

import { getE2eDbEnv, e2eDatabaseUrl } from "./e2e-env";
import { getPnpmCommand, runCommand } from "./run-command";

export async function resetE2eDatabase() {
  const client = new Client({
    connectionString: e2eDatabaseUrl
  });

  await client.connect();

  try {
    await client.query("truncate table ansitz_sessions, fallwild_vorgaenge");
  } finally {
    await client.end();
  }

  runCommand(getPnpmCommand(), ["--filter", "@hege/web", "db:seed"], getE2eDbEnv());
}
