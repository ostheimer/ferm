#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (!args.input || !args.output) {
  printUsage();
  process.exit(1);
}

const inputPath = resolve(args.input);
const outputPath = resolve(args.output);
const bbox = args.bbox ? parseBbox(args.bbox) : undefined;
const limit = args.limit ? Number(args.limit) : undefined;
const sourceUrl = args.sourceUrl;
const extension = extname(inputPath).toLowerCase();
const rawRows =
  extension === ".gpkg" || extension === ".sqlite" || extension === ".db"
    ? readGpkgBepuRows({ bbox, inputPath, limit, sqlitePath: args.sqlite ?? "sqlite3" })
    : readJsonRows(inputPath);
const entries = rawRows.flatMap((row) => {
  const entry = normalizeRow(row);
  return entry ? [entry] : [];
});
const index = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    kind: extension === ".gpkg" ? "gip-ogd-bepu" : "json",
    input: sourceUrl ?? inputPath,
    version: extension === ".gpkg" ? readGpkgVersion(inputPath, args.sqlite ?? "sqlite3") : undefined
  },
  bbox,
  entries
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`GIP-Straßenkilometer-Index geschrieben: ${outputPath}`);
console.log(`Einträge: ${entries.length}`);

function parseArgs(rawArgs) {
  const parsed = {};

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (!arg.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const value = rawArgs[index + 1];

    if (!value || value.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function printUsage() {
  console.error(`
Usage:
  pnpm --filter @hege/web geo:gip:index -- \\
    --input /tmp/gip_reference_ogd.gpkg \\
    --output apps/web/data/gip-road-kilometer-index.json

Optional:
  --bbox "minLng,minLat,maxLng,maxLat"  Nur Ausschnitt exportieren
  --limit 1000                         Maximalzahl fuer Tests
  --sqlite sqlite3                      sqlite3-Binary
  --sourceUrl https://open.gip.gv.at/ogd/C_gip_reference_ogd.zip
`);
}

function parseBbox(value) {
  const parts = value.split(",").map((part) => Number(part.trim()));

  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error(`Ungültige bbox: ${value}`);
  }

  const [minLng, minLat, maxLng, maxLat] = parts;

  if (minLng >= maxLng || minLat >= maxLat) {
    throw new Error(`Ungültige bbox-Reihenfolge: ${value}`);
  }

  return { maxLat, maxLng, minLat, minLng };
}

function readGpkgBepuRows({ bbox, inputPath, limit, sqlitePath }) {
  const where = ["b.FROMKM >= 0", "b.TOKM >= 0", "b.FEATURENAME is not null"];
  const limitClause = Number.isFinite(limit) && limit > 0 ? ` limit ${Math.floor(limit)}` : "";

  if (bbox) {
    where.push(`r.maxx >= ${bbox.minLng}`);
    where.push(`r.minx <= ${bbox.maxLng}`);
    where.push(`r.maxy >= ${bbox.minLat}`);
    where.push(`r.miny <= ${bbox.maxLat}`);
  }

  const sql = `
    select
      cast(b.OBJECTID as text) as objectId,
      b.FROMKM as fromKm,
      b.TOKM as toKm,
      b.FEATURENAME as featureName,
      cast(b.EDGE_OBJECTID as text) as edgeObjectId,
      cast(b.ROUTEID as text) as routeId,
      ((r.minx + r.maxx) / 2.0) as lng,
      ((r.miny + r.maxy) / 2.0) as lat
    from BEPU_OGD b
    join rtree_BEPU_OGD_geom r on r.id = b.fid
    where ${where.join(" and ")}
    order by b.ROUTEID, b.FROMKM, b.OBJECTID
    ${limitClause};
  `;
  const stdout = execFileSync(sqlitePath, ["-json", inputPath, sql], {
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024
  });

  return JSON.parse(stdout || "[]");
}

function readGpkgVersion(inputPath, sqlitePath) {
  try {
    const stdout = execFileSync(sqlitePath, ["-json", inputPath, "select * from version limit 1;"], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024
    });
    const [row] = JSON.parse(stdout || "[]");
    return row ? Object.values(row).filter(Boolean).join(" ") : undefined;
  } catch {
    return undefined;
  }
}

function readJsonRows(inputPath) {
  const payload = JSON.parse(readFileSync(inputPath, "utf8"));

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.entries)) {
    return payload.entries;
  }

  if (Array.isArray(payload.features)) {
    return payload.features.map((feature) => {
      const [lng, lat] = feature.geometry?.type === "Point" ? feature.geometry.coordinates ?? [] : [];

      return {
        ...(feature.properties ?? {}),
        lat,
        lng
      };
    });
  }

  throw new Error("JSON-Quelle muss Array, { entries } oder GeoJSON FeatureCollection sein.");
}

function normalizeRow(row) {
  const lat = readNumber(row.lat);
  const lng = readNumber(row.lng);
  const featureName = readString(row.featureName ?? row.FEATURENAME ?? row.roadName);
  const parsedFeatureName = featureName ? parseFeatureName(featureName) : {};
  const roadName = readString(row.roadName) ?? parsedFeatureName.roadName;
  const roadKilometer = formatRoadKilometer(row.roadKilometer ?? row.fromKm ?? row.FROMKM) ?? parsedFeatureName.roadKilometer;

  if (typeof lat !== "number" || typeof lng !== "number" || !roadName || !roadKilometer) {
    return undefined;
  }

  return {
    lat,
    lng,
    roadName,
    roadKilometer,
    placeId: normalizeIdentifier(readString(row.objectId ?? row.OBJECTID ?? row.placeId)),
    roadCode: normalizeRoadCode(readString(row.roadCode) ?? extractRoadCode(roadName))
  };
}

function parseFeatureName(value) {
  const match = value.match(/^(?<kilometer>\d+(?:[,.]\d+)?)\s*km,\s*(?<roadName>.+)$/iu);

  if (!match?.groups) {
    return {};
  }

  const roadName = readString((match.groups.roadName ?? "").replace(/\s+(?:Hauptfahrbahn|Baulos|Kreisverkehr)\b.*$/iu, ""));
  const kilometer = readNumber(match.groups.kilometer);

  return {
    roadName,
    roadKilometer: typeof kilometer === "number" ? formatRoadKilometer(kilometer) : undefined
  };
}

function extractRoadCode(value) {
  return value?.match(/\b[ABLS]\s*[-.]?\s*\d+[A-Z]?\b/iu)?.[0];
}

function normalizeRoadCode(value) {
  return value?.replace(/\s+/g, "").replace(/[.-]/g, "").toUpperCase();
}

function readString(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeIdentifier(value) {
  return value?.replace(/\.0$/u, "");
}

function readNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value.trim().replace(",", "."));

  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatRoadKilometer(value) {
  const stringValue = readString(value);

  if (stringValue?.includes(",")) {
    return stringValue;
  }

  const numberValue = readNumber(value);

  if (typeof numberValue !== "number") {
    return stringValue;
  }

  return new Intl.NumberFormat("de-AT", {
    maximumFractionDigits: 3,
    useGrouping: false
  }).format(numberValue);
}
