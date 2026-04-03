import { exportFallwildCsv } from "../../../../../server/modules/fallwild/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(await exportFallwildCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=fallwild.csv"
    }
  });
}
