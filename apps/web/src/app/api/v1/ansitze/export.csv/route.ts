import { exportAnsitzeCsv } from "../../../../../server/modules/ansitze/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await exportAnsitzeCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=ansitze.csv"
    }
  });
}
