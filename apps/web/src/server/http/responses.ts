import { toApiError } from "./errors";

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, {
    status: 200,
    ...init
  });
}

export function jsonCreated<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, {
    status: 201,
    ...init
  });
}

export function jsonError(error: unknown): Response {
  const apiError = toApiError(error);

  return Response.json(
    {
      error: apiError
    },
    {
      status: apiError.status
    }
  );
}
