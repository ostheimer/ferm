/**
 * Pure helpers for the E2E-data cleanup script.
 *
 * The cleanup script (`apps/web/scripts/cleanup-e2e-data.mjs`) wires these
 * helpers up to the live Drizzle client. The functions here are intentionally
 * dependency-free so they can be unit tested without any database connection.
 */

/**
 * Prefix used by the Playwright-based E2E suite for sitzungen titles.
 */
export const E2E_SITZUNG_TITLE_PREFIX = "E2E ";

/**
 * Prefix used by the E2E suite for Fallwild gemeinde names (e.g.
 * "E2E Gemeinde 1775426471423").
 */
export const E2E_FALLWILD_GEMEINDE_PREFIX = "E2E ";

/**
 * Prefix used by the E2E suite for Fallwild strasse names. The seed data uses
 * a hyphen ("E2E-Landesstrasse") rather than a space.
 */
export const E2E_FALLWILD_STRASSE_PREFIX = "E2E-";

export interface SitzungLikeRecord {
  id: string;
  title: string;
}

export interface FallwildLikeRecord {
  id: string;
  gemeinde: string;
  strasse: string | null;
}

/**
 * Returns true when a sitzung title was created by the E2E suite.
 *
 * The match is intentionally exact-prefix on `"E2E "` so that operator
 * sitzungen with titles like "Vorbereitung E2E" are not affected.
 */
export function isE2eSitzungTitle(title: string): boolean {
  return title.startsWith(E2E_SITZUNG_TITLE_PREFIX);
}

/**
 * Returns true when a fallwild record was created by the E2E suite.
 *
 * Matches either a gemeinde with prefix "E2E " (e.g. "E2E Gemeinde 1775...")
 * or a strasse with prefix "E2E-" (e.g. "E2E-Landesstrasse").
 */
export function isE2eFallwildRecord(record: FallwildLikeRecord): boolean {
  if (record.gemeinde.startsWith(E2E_FALLWILD_GEMEINDE_PREFIX)) {
    return true;
  }

  if (record.strasse !== null && record.strasse.startsWith(E2E_FALLWILD_STRASSE_PREFIX)) {
    return true;
  }

  return false;
}

/**
 * Filters a list of sitzungen records down to those created by the E2E suite
 * and returns just their ids in stable input order.
 */
export function filterE2eSitzungIds(records: ReadonlyArray<SitzungLikeRecord>): string[] {
  return records.filter((record) => isE2eSitzungTitle(record.title)).map((record) => record.id);
}

/**
 * Filters a list of fallwild records down to those created by the E2E suite
 * and returns just their ids in stable input order.
 */
export function filterE2eFallwildIds(records: ReadonlyArray<FallwildLikeRecord>): string[] {
  return records.filter(isE2eFallwildRecord).map((record) => record.id);
}

/**
 * Determines whether a database URL points at what looks like a managed
 * production Postgres cluster (Neon pooler, neon.tech, etc.). Used by the
 * cleanup script to require an explicit `CLEANUP_E2E_CONFIRM_PROD=yes`
 * acknowledgement before any DELETE runs against such a host.
 *
 * The heuristic deliberately errs on the side of "looks production": if the
 * hostname contains `pooler` or `neon.tech` AND does not contain any
 * stage-indicating keyword (`dev`, `development`, `preview`, `staging`,
 * `test`), the URL is treated as production-like.
 */
export function looksLikeProductionDatabaseUrl(databaseUrl: string): boolean {
  const host = extractHostname(databaseUrl);

  if (host === null) {
    return false;
  }

  const lowered = host.toLowerCase();
  const looksManaged = lowered.includes("pooler") || lowered.includes("neon.tech");

  if (!looksManaged) {
    return false;
  }

  const stageMarkers = ["dev", "development", "preview", "staging", "test"];

  return !stageMarkers.some((marker) => lowered.includes(marker));
}

function extractHostname(databaseUrl: string): string | null {
  try {
    const url = new URL(databaseUrl);

    return url.hostname || null;
  } catch {
    return null;
  }
}
