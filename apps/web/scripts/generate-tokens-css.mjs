#!/usr/bin/env node
/**
 * Generiert `src/app/_generated-tokens.css` aus dem `@hege/tokens`-Paket.
 *
 * Laeuft als `prebuild`/`predev`-Hook, damit Vercel-Builds ohne speziellen
 * Custom-Build-Command auskommen. Die generierte Datei ist eingecheckt, damit
 * `next build` auch ohne vorherigen Token-Build deterministisch ist.
 *
 * Konsumiert wird sie via `@import "./_generated-tokens.css";` an erster
 * Stelle in `globals.css`.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const tokensDist = resolve(repoRoot, "packages", "tokens", "dist", "index.js");
const outFile = resolve(here, "..", "src", "app", "_generated-tokens.css");

async function ensureTokensBuilt() {
  try {
    return await import(tokensDist);
  } catch (error) {
    throw new Error(
      "@hege/tokens dist ist nicht gebaut. Bitte zuerst `pnpm --filter @hege/tokens build` laufen lassen.\n" +
        `Erwartet: ${tokensDist}\nUrsache: ${(error instanceof Error ? error.message : String(error))}`
    );
  }
}

const tokens = await ensureTokensBuilt();
const css = tokens.buildRootCss();

mkdirSync(dirname(outFile), { recursive: true });

let existing = "";
try {
  existing = readFileSync(outFile, "utf8");
} catch {
  existing = "";
}

if (existing === css) {
  console.log(`[tokens] ${outFile} ist bereits aktuell.`);
} else {
  writeFileSync(outFile, css, "utf8");
  console.log(`[tokens] ${outFile} regeneriert.`);
}
