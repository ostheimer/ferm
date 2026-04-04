import { jsonError } from "../../../../../../server/http/responses";
import { renderSitzungPdf } from "../../../../../../server/modules/sitzungen/pdf";
import { getDocumentDownloadRef, getSitzungById } from "../../../../../../server/modules/sitzungen/queries";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const documentRef = await getDocumentDownloadRef(id);

    if (!documentRef) {
      throw Object.assign(new Error("Dokument wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    const sitzung = await getSitzungById(documentRef.sitzungId);

    if (!sitzung) {
      throw Object.assign(new Error("Sitzung wurde nicht gefunden."), {
        status: 404,
        code: "not-found"
      });
    }

    if (documentRef.document.contentType === "application/pdf") {
      return new Response(renderSitzungPdf(sitzung), {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="${documentRef.document.fileName}"`
        }
      });
    }

    return new Response("Dieses Dokument ist in der Demo nur als PDF-Download verfuegbar.", {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
