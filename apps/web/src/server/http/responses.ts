export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, {
    status: 200,
    ...init
  });
}

export function jsonError(message: string, status = 400): Response {
  return Response.json(
    {
      error: message
    },
    {
      status
    }
  );
}
