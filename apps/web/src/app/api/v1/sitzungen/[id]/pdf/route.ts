import { jsonError } from "../../../../../../server/http/responses";
import { renderSitzungPdf } from "../../../../../../server/modules/sitzungen/pdf";
import { getSitzungById } from "../../../../../../server/modules/sitzungen/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sitzung = await getSitzungById(id);

    if (!sitzung) {
      throw Object.assign(new Error("Sitzung wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    if (sitzung.status !== "freigegeben") {
      throw Object.assign(new Error("PDF ist erst nach der Freigabe verfügbar."), {
        status: 409,
        code: "conflict"
      });
    }

    return new Response(renderSitzungPdf(sitzung), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${createFileName(sitzung.title)}"`
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}

function createFileName(title: string) {
  return `${title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}.pdf`;
}
