export function readApiErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const candidate = payload.error;

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }

    if (
      candidate &&
      typeof candidate === "object" &&
      "message" in candidate &&
      typeof candidate.message === "string" &&
      candidate.message.trim().length > 0
    ) {
      return candidate.message;
    }
  }

  return fallback;
}
