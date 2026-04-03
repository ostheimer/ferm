import { defineConfig } from "drizzle-kit";

import { getServerEnv } from "./src/server/env";
import { loadCliEnv } from "./src/server/env/load-cli-env";

loadCliEnv();

const env = getServerEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.migrationDatabaseUrl
  }
});
