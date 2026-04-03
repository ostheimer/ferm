const LOCAL_DATABASE_URL = "postgresql://hege:hege@127.0.0.1:5432/hege";

export interface ServerEnv {
  databaseUrl: string;
  migrationDatabaseUrl: string;
  useDemoStore: boolean;
}

export function getServerEnv(): ServerEnv {
  const databaseUrl = process.env.DATABASE_URL ?? LOCAL_DATABASE_URL;
  const migrationDatabaseUrl = process.env.DATABASE_URL_UNPOOLED ?? databaseUrl;
  const useDemoStore = process.env.HEGE_USE_DEMO_STORE === "true" || process.env.NODE_ENV === "test";

  return {
    databaseUrl,
    migrationDatabaseUrl,
    useDemoStore
  };
}
