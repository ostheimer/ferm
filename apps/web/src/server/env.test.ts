import { afterEach, describe, expect, it } from "vitest";

import { getServerEnv } from "./env";

const STORAGE_ENV_KEYS = [
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_PUBLIC_BASE_URL",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "AUTH_TOKEN_SECRET",
  "VERCEL_ENV"
] as const;

const originalEnv = new Map<string, string | undefined>(
  STORAGE_ENV_KEYS.map((key) => [key, process.env[key]])
);

afterEach(() => {
  for (const key of STORAGE_ENV_KEYS) {
    const value = originalEnv.get(key);

    if (typeof value === "string") {
      process.env[key] = value;
    } else {
      delete process.env[key];
    }
  }
});

describe("server env", () => {
  it("normalisiert Whitespace in Storage-Umgebungsvariablen", () => {
    process.env.VERCEL_ENV = "production";
    process.env.S3_ENDPOINT = " https://example-account.r2.cloudflarestorage.com\n";
    process.env.S3_REGION = "auto\n";
    process.env.S3_BUCKET = " hege-assets ";
    process.env.S3_PUBLIC_BASE_URL = "https://assets.hege.app/\n";
    process.env.S3_ACCESS_KEY = " access-key\n";
    process.env.S3_SECRET_KEY = " secret-key\n";
    process.env.AUTH_TOKEN_SECRET = "test-auth-secret";

    const env = getServerEnv();

    expect(env.s3Endpoint).toBe("https://example-account.r2.cloudflarestorage.com");
    expect(env.s3Region).toBe("auto");
    expect(env.s3Bucket).toBe("hege-assets");
    expect(env.s3PublicBaseUrl).toBe("https://assets.hege.app/");
    expect(env.s3AccessKey).toBe("access-key");
    expect(env.s3SecretKey).toBe("secret-key");
  });

  it("behandelt leere Storage-Werte in Vercel als nicht konfiguriert", () => {
    process.env.VERCEL_ENV = "production";
    process.env.S3_ENDPOINT = " ";
    process.env.S3_REGION = "\n";
    process.env.S3_BUCKET = "\t";
    process.env.S3_PUBLIC_BASE_URL = "";
    process.env.S3_ACCESS_KEY = " ";
    process.env.S3_SECRET_KEY = "\n";
    process.env.AUTH_TOKEN_SECRET = "test-auth-secret";

    const env = getServerEnv();

    expect(env.s3Endpoint).toBeUndefined();
    expect(env.s3Region).toBeUndefined();
    expect(env.s3Bucket).toBeUndefined();
    expect(env.s3PublicBaseUrl).toBeUndefined();
    expect(env.s3AccessKey).toBeUndefined();
    expect(env.s3SecretKey).toBeUndefined();
  });
});
