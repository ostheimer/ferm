import type { Role } from "@hege/domain";

import { sanitizeStorageFileName } from "../../storage/s3";

export const FALLWILD_ALLOWED_ROLES = [
  "jaeger",
  "ausgeher",
  "schriftfuehrer",
  "revier-admin"
] as const satisfies readonly Role[];

export const FALLWILD_PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png"] as const;

export const FALLWILD_MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024;

export const FALLWILD_MAX_PHOTO_COUNT = 3;

export function deriveFallwildPhotoTitle(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "").trim();
  return withoutExtension.length > 0 ? withoutExtension : "Foto";
}

export function sanitizeFallwildPhotoFileName(fileName: string) {
  return sanitizeStorageFileName(fileName);
}

export function isAllowedFallwildPhotoContentType(contentType: string) {
  return FALLWILD_PHOTO_CONTENT_TYPES.includes(contentType as (typeof FALLWILD_PHOTO_CONTENT_TYPES)[number]);
}
