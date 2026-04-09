import { timingSafeEqual } from "node:crypto";

import { runDatabaseMaintenance } from "../../../../server/db/maintenance";
import { RouteError } from "../../../../server/http/errors";
import { jsonError, jsonOk } from "../../../../server/http/responses";

const MAINTENANCE_KEY = "hege-prod-db-sync-20260409-u7q2h5mf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertMaintenanceKey(request);
    return jsonOk(await runDatabaseMaintenance());
  } catch (error) {
    return jsonError(error);
  }
}

function assertMaintenanceKey(request: Request) {
  const received = request.headers.get("x-hege-maintenance-key");

  if (!received) {
    throw new RouteError("Maintenance-Key fehlt.", 401, "unauthenticated");
  }

  const expectedBuffer = Buffer.from(MAINTENANCE_KEY, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    throw new RouteError("Maintenance-Key ist ungueltig.", 401, "unauthenticated");
  }
}
