import type { ApiError, ApiErrorCode } from "@hege/domain";

const DEFAULT_ERROR_CODE: ApiErrorCode = "internal-error";

export class RouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: ApiErrorCode
  ) {
    super(message);
  }
}

export function isRouteError(error: unknown): error is RouteError {
  return error instanceof RouteError;
}

export function toApiError(error: unknown): ApiError {
  if (isRouteError(error)) {
    return {
      code: error.code,
      message: error.message,
      status: error.status
    };
  }

  if (error instanceof Error) {
    return {
      code: guessApiErrorCode(error),
      message: error.message,
      status: guessStatus(error)
    };
  }

  return {
    code: DEFAULT_ERROR_CODE,
    message: "Interner Serverfehler.",
    status: 500
  };
}

function guessStatus(error: Error): number {
  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  return 500;
}

function guessApiErrorCode(error: Error): ApiErrorCode {
  if ("code" in error && typeof error.code === "string") {
    return error.code as ApiErrorCode;
  }

  const status = guessStatus(error);

  switch (status) {
    case 401:
      return "unauthenticated";
    case 403:
      return "forbidden";
    case 404:
      return "not-found";
    case 409:
      return "conflict";
    case 422:
    case 400:
      return "validation-error";
    case 503:
      return "service-unavailable";
    default:
      return DEFAULT_ERROR_CODE;
  }
}
