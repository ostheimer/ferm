import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { getServerEnv } from "../env";
import { RouteError } from "../http/errors";
import { createDbFromPool, createPool } from "./client";

const MIGRATIONS_SCHEMA = "drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

export interface DatabaseMaintenanceResult {
  databaseName: string;
  totalMigrationFiles: number;
  appliedMigrations: number;
}

export async function runDatabaseMaintenance(): Promise<DatabaseMaintenanceResult> {
  const pool = createPool(getServerEnv().migrationDatabaseUrl);
  const db = createDbFromPool(pool);
  const migrationsFolder = resolveMigrationsFolder();

  try {
    await migrate(db, {
      migrationsFolder
    });

    const [databaseName, appliedMigrations] = await Promise.all([
      readDatabaseName(db),
      readAppliedMigrations(db)
    ]);

    return {
      databaseName,
      totalMigrationFiles: readTotalMigrationFiles(migrationsFolder),
      appliedMigrations
    };
  } finally {
    await pool.end();
  }
}

function resolveMigrationsFolder() {
  const folder = path.join(process.cwd(), "drizzle");

  if (!existsSync(folder)) {
    throw new RouteError("Der Migrationsordner ist in der Laufzeit nicht verfuegbar.", 500, "internal-error");
  }

  return folder;
}

function readTotalMigrationFiles(migrationsFolder: string) {
  return readdirSync(migrationsFolder).filter((fileName) => fileName.endsWith(".sql")).length;
}

async function readDatabaseName(db: ReturnType<typeof createDbFromPool>) {
  const result = await db.execute(sql`select current_database() as database_name`);
  const row = result.rows[0] as { database_name?: string } | undefined;

  return row?.database_name ?? "unknown";
}

async function readAppliedMigrations(db: ReturnType<typeof createDbFromPool>) {
  const result = await db.execute(
    sql.raw(`select count(*)::int as count from "${MIGRATIONS_SCHEMA}"."${MIGRATIONS_TABLE}"`)
  );
  const row = result.rows[0] as { count?: number } | undefined;

  return Number(row?.count ?? 0);
}
