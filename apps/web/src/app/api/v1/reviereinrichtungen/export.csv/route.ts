import { exportReviereinrichtungenCsv } from "../../../../../server/modules/reviereinrichtungen/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await exportReviereinrichtungenCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=reviereinrichtungen.csv"
    }
  });
}
