import "dotenv/config";

import { defineConfig } from "drizzle-kit";

import { getServerEnv } from "./src/server/env";

const env = getServerEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: env.migrationDatabaseUrl
  }
});
