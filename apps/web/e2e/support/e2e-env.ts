import path from "node:path";

export const repoRoot = path.resolve(__dirname, "../../../..");
export const e2eDatabaseName = requiredEnv("HEGE_E2E_DB_NAME");
export const e2eDatabaseUrl = requiredEnv("HEGE_E2E_DATABASE_URL");
export const e2eDatabaseUrlUnpooled = requiredEnv("HEGE_E2E_DATABASE_URL_UNPOOLED");
export const e2eBaseUrl = requiredEnv("HEGE_E2E_BASE_URL");
export const visualStylePath = path.resolve(__dirname, "visual.css");

export function getE2eDbEnv() {
  return {
    DATABASE_URL: e2eDatabaseUrl,
    DATABASE_URL_UNPOOLED: e2eDatabaseUrlUnpooled,
    HEGE_USE_DEMO_STORE: "false"
  };
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Expected environment variable ${name} to be set for Playwright E2E tests.`);
  }

  return value;
}
