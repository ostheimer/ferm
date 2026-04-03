import type { AnsitzSession, FallwildVorgang, Membership, Revier, User } from "@hege/domain";

declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

export interface ApiMeResponse {
  user: User;
  membership: Membership;
  revier: Revier;
}

export interface DashboardSnapshot extends ApiMeResponse {
  ansitze: AnsitzSession[];
}

export type FallwildListItem = FallwildVorgang;

export function getApiBaseUrl(): string {
  return trimTrailingSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);
}

export function toApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

export async function fetchDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [meResponse, ansitzeResponse] = await Promise.all([
    fetchJson<ApiMeResponse>("/v1/me"),
    fetchJson<AnsitzSession[]>("/v1/ansitze/live")
  ]);

  return {
    ...meResponse,
    ansitze: ansitzeResponse
  };
}

export async function fetchFallwildList(): Promise<FallwildListItem[]> {
  return fetchJson<FallwildListItem[]>("/v1/fallwild");
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(toApiUrl(path));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}
