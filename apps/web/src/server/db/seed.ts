import { loadCliEnv } from "../env/load-cli-env";
import { createDbFromPool, createPool } from "./client";
import { SEED_COMPLETION_MESSAGE, seedDatabase } from "./seed-data";

loadCliEnv();

async function main() {
  const pool = createPool();
  const db = createDbFromPool(pool);

  try {
    await seedDatabase(db);
    console.log(SEED_COMPLETION_MESSAGE);
  } finally {
    await pool.end();
  }
}

void main();
