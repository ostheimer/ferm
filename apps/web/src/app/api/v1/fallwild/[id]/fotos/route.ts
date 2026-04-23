import { Buffer } from "node:buffer";

import { getRequestContext } from "../../../../../../server/auth/context";
import { assertRole } from "../../../../../../server/auth/service";
import { jsonCreated, jsonError } from "../../../../../../server/http/responses";
import { validationError } from "../../../../../../server/http/validation";
import {
  FALLWILD_ALLOWED_ROLES,
  FALLWILD_MAX_PHOTO_SIZE_BYTES,
  FALLWILD_PHOTO_CONTENT_TYPES
} from "../../../../../../server/modules/fallwild/media";
import { uploadFallwildPhoto } from "../../../../../../server/modules/fallwild/service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { role, membershipId, revierId } = await getRequestContext();
    assertRole(role, [...FALLWILD_ALLOWED_ROLES]);

    const { id } = await context.params;
    const { file, title } = await parsePhotoUploadFormData(request);

    return jsonCreated({
      photo: await uploadFallwildPhoto({
        body: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
        fallwildId: id,
        fileName: file.name,
        reportedByMembershipId: membershipId,
        revierId,
        title
      })
    });
  } catch (error) {
    return jsonError(error);
  }
}

async function parsePhotoUploadFormData(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw validationError("Der Request-Body muss multipart/form-data sein.");
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    throw validationError("Der Request-Body konnte nicht als multipart/form-data gelesen werden.");
  }

  const allowedKeys = new Set(["file", "title"]);

  for (const key of formData.keys()) {
    if (!allowedKeys.has(key)) {
      throw validationError("Nur die Felder file und title sind erlaubt.");
    }
  }

  const fileValues = formData.getAll("file");

  if (fileValues.length !== 1) {
    throw validationError("Genau eine Datei im Feld file ist erforderlich.");
  }

  const file = fileValues[0];

  if (!(file instanceof File)) {
    throw validationError("file muss eine Datei sein.");
  }

  if (file.size <= 0) {
    throw validationError("file darf nicht leer sein.");
  }

  if (file.size > FALLWILD_MAX_PHOTO_SIZE_BYTES) {
    throw validationError("Dateien dürfen maximal 10 MB groß sein.");
  }

  if (!FALLWILD_PHOTO_CONTENT_TYPES.includes(file.type as (typeof FALLWILD_PHOTO_CONTENT_TYPES)[number])) {
    throw validationError("Nur JPEG- und PNG-Dateien sind erlaubt.");
  }

  const titleValues = formData.getAll("title");

  if (titleValues.length > 1) {
    throw validationError("title darf nur einmal übermittelt werden.");
  }

  const titleValue = titleValues[0];

  if (titleValue != null && typeof titleValue !== "string") {
    throw validationError("title muss ein String sein.");
  }

  const title = typeof titleValue === "string" ? titleValue.trim() : undefined;

  return {
    file,
    title: title && title.length > 0 ? title : undefined
  };
}
