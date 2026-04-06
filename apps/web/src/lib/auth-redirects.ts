export function toSafePostAuthPath(next: string | null | undefined, fallback = "/app") {
  if (!next) {
    return fallback;
  }

  if (!next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  if (next === "/login" || next === "/registrieren") {
    return fallback;
  }

  return next;
}
