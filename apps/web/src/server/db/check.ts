import { sql } from "drizzle-orm";

import { loadCliEnv } from "../env/load-cli-env";
import { createDbFromPool, createPool } from "./client";

loadCliEnv();

async function main() {
  const pool = createPool();
  const db = createDbFromPool(pool);

  try {
    const result = await db.execute(sql`select current_database() as database_name, now() as server_time`);

    console.log("Database connection ready.");
    console.log(JSON.stringify(result.rows, null, 2));
  } finally {
    await pool.end();
  }
}

void main();
