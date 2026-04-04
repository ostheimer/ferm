import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { getServerEnv } from "../env";
import * as schema from "./schema";

declare global {
  var hegePool: Pool | undefined;
  var hegeDatabase: ReturnType<typeof createDb> | undefined;
}

export function createPool(databaseUrl = getServerEnv().databaseUrl) {
  return new Pool({
    connectionString: databaseUrl,
    max: 1
  });
}

export function createDbFromPool(pool: Pool) {
  return drizzle({
    client: pool,
    schema
  });
}

export type HegeDb = ReturnType<typeof createDbFromPool>;

export function createDb(databaseUrl = getServerEnv().databaseUrl) {
  return createDbFromPool(createPool(databaseUrl));
}

export function getDb() {
  globalThis.hegePool ??= createPool();
  globalThis.hegeDatabase ??= createDbFromPool(globalThis.hegePool);

  return globalThis.hegeDatabase;
}
