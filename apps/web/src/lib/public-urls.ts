const DEFAULT_APP_URL = "http://localhost:3000";
const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

export function getPublicAppUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL;
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const deploymentUrl = process.env.VERCEL_URL;

  if (explicitUrl) {
    return trimTrailingSlash(explicitUrl);
  }

  if (productionUrl) {
    return trimTrailingSlash(`https://${productionUrl}`);
  }

  if (deploymentUrl) {
    return trimTrailingSlash(`https://${deploymentUrl}`);
  }

  return trimTrailingSlash(DEFAULT_APP_URL);
}

export function getPublicApiBaseUrl(): string {
  const explicitApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (explicitApiBaseUrl) {
    return trimTrailingSlash(explicitApiBaseUrl);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL) {
    return `${getPublicAppUrl()}/api`;
  }

  return trimTrailingSlash(DEFAULT_API_BASE_URL);
}

export function toPublicApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getPublicApiBaseUrl()}${normalizedPath}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
