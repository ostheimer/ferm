import { createHmac, timingSafeEqual } from "node:crypto";

import { getRequestContext } from "../../../../server/auth/context";
import { getServerEnv } from "../../../../server/env";
import { runDatabaseMaintenance } from "../../../../server/db/maintenance";
import { RouteError } from "../../../../server/http/errors";
import { jsonError, jsonOk } from "../../../../server/http/responses";

const ALLOWED_ROLES = new Set(["platform-admin", "revier-admin"]);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertMaintenanceKey(request);

    const context = await getRequestContext();

    if (!ALLOWED_ROLES.has(context.role)) {
      throw new RouteError("Diese Aktion ist fuer die aktuelle Rolle nicht erlaubt.", 403, "forbidden");
    }

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

  const expected = createMaintenanceKey();
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    throw new RouteError("Maintenance-Key ist ungueltig.", 401, "unauthenticated");
  }
}

function createMaintenanceKey() {
  return createHmac("sha256", getServerEnv().authTokenSecret).update("db-sync").digest("hex");
}
