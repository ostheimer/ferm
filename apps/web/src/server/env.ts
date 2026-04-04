const LOCAL_DATABASE_URL = "postgresql://hege:hege@127.0.0.1:5432/hege";
const LOCAL_AUTH_SECRET = "hege-local-auth-secret-change-me";
const LOCAL_DEMO_PASSWORD = "hege-demo-2026";

export interface ServerEnv {
  databaseUrl: string;
  migrationDatabaseUrl: string;
  useDemoStore: boolean;
  authTokenSecret: string;
  demoPassword: string;
}

export function getServerEnv(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL;
  const migrationDatabaseUrl = process.env.DATABASE_URL_UNPOOLED ?? databaseUrl;
  const useDemoStore = process.env.HEGE_USE_DEMO_STORE === "true" || process.env.NODE_ENV === "test";
  const authTokenSecret = process.env.AUTH_TOKEN_SECRET ?? fallbackAuthSecret();
  const demoPassword = process.env.HEGE_DEMO_PASSWORD ?? LOCAL_DEMO_PASSWORD;

  return {
    databaseUrl,
    migrationDatabaseUrl,
    useDemoStore,
    authTokenSecret,
    demoPassword
  };
}

function fallbackAuthSecret() {
  if (process.env.VERCEL_ENV) {
    throw new Error("AUTH_TOKEN_SECRET muss fuer Preview- und Production-Deployments gesetzt sein.");
  }

  return LOCAL_AUTH_SECRET;
}
