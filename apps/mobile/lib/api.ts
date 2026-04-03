declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

export function getApiBaseUrl(): string {
  return trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);
}

export function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
