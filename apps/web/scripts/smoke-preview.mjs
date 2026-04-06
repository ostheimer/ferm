#!/usr/bin/env node

import assert from "node:assert/strict";

const DEMO_IDENTIFIER = "ostheimer";
const DEMO_PIN = "9526";
const publishedProtokollId = "sitzung-2";
const publishedDocumentId = "document-sitzung-2";

const previewUrl = normalizePreviewUrl(process.argv[2] ?? process.env.PREVIEW_URL);

if (!previewUrl) {
  fail("Usage: node ./scripts/smoke-preview.mjs <preview-url>");
}

await runSmoke(previewUrl);

async function runSmoke(baseUrl) {
  console.log(`Preview smoke against ${baseUrl}`);

  await checkHtmlPage(baseUrl, "/login", {
    label: "/login",
    expectedText: ["Anmelden"]
  });

  const login = await postJson(baseUrl, "/api/v1/auth/login", {
    identifier: DEMO_IDENTIFIER,
    pin: DEMO_PIN
  });

  assert.equal(login.status, 200, `Expected /api/v1/auth/login to return 200, got ${login.status}.`);
  assert.ok(login.json?.tokens?.accessToken, "Expected access token in auth response.");
  assert.ok(login.json?.tokens?.refreshToken, "Expected refresh token in auth response.");

  const accessToken = login.json.tokens.accessToken;
  const authHeaders = {
    authorization: `Bearer ${accessToken}`
  };

  await checkJsonEndpoint(baseUrl, "/api/v1/me", authHeaders, {
    label: "/api/v1/me",
    expectedFields: ["user", "membership", "revier", "activeRevierId"]
  });

  await checkJsonEndpoint(baseUrl, "/api/v1/dashboard", authHeaders, {
    label: "/api/v1/dashboard",
    expectedFields: ["overview", "activeAnsitze", "recentFallwild"]
  });

  await checkJsonEndpoint(baseUrl, "/api/v1/reviereinrichtungen", authHeaders, {
    label: "/api/v1/reviereinrichtungen"
  });

  await checkJsonEndpoint(baseUrl, "/api/v1/protokolle", authHeaders, {
    label: "/api/v1/protokolle"
  });

  await checkHtmlPage(baseUrl, "/sitzungen", {
    label: "/sitzungen",
    headers: authHeaders,
    expectedText: ["Sitzungen"]
  });

  await checkHtmlPage(baseUrl, "/reviereinrichtungen", {
    label: "/reviereinrichtungen",
    headers: authHeaders,
    expectedText: ["Standorte, Kontrollen und Wartungen im Blick."]
  });

  await checkHtmlPage(baseUrl, "/protokolle", {
    label: "/protokolle",
    headers: authHeaders,
    expectedText: ["Freigegebene Protokolle und Beschluesse", "Dokument oeffnen"]
  });

  await checkHtmlPage(baseUrl, `/protokolle/${publishedProtokollId}`, {
    label: `/protokolle/${publishedProtokollId}`,
    headers: authHeaders,
    expectedText: ["Freigegebenes Protokoll", "PDF oeffnen"]
  });

  await checkDownload(baseUrl, `/api/v1/documents/${publishedDocumentId}/download`, authHeaders, "winterabschluss-2025-protokoll.pdf");

  console.log("Preview smoke passed.");
}

async function checkJsonEndpoint(baseUrl, path, headers = {}, options = {}) {
  const { label = path, expectedFields = [] } = options;
  const response = await fetchJson(baseUrl, path, headers);

  assert.equal(response.status, 200, `Expected ${label} to return 200, got ${response.status}.`);
  assert.ok(
    response.contentType.includes("application/json"),
    `Expected ${label} to return application/json, got ${response.contentType ?? "missing content-type"}.`
  );

  for (const field of expectedFields) {
    assert.ok(field in response.json, `Expected ${label} JSON to include "${field}".`);
  }
}

async function checkHtmlPage(baseUrl, path, options = {}) {
  const { label = path, headers = {}, expectedText = [] } = options;
  const response = await fetchText(baseUrl, path, headers);

  assert.equal(response.status, 200, `Expected ${label} to return 200, got ${response.status}.`);
  assert.ok(
    response.contentType.includes("text/html"),
    `Expected ${label} to return HTML, got ${response.contentType || "missing content-type"}.`
  );

  for (const text of expectedText) {
    assert.ok(response.text.includes(text), `Expected ${label} HTML to include "${text}".`);
  }
}

async function checkDownload(baseUrl, path, headers, expectedFileName) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers: {
      ...headers
    }
  });

  assert.equal(response.status, 200, `Expected ${path} to return 200, got ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? "";
  const disposition = response.headers.get("content-disposition") ?? "";

  assert.ok(
    contentType.includes("application/pdf"),
    `Expected ${path} to return application/pdf, got ${contentType || "missing content-type"}.`
  );
  assert.ok(
    disposition.includes(expectedFileName),
    `Expected ${path} to reference "${expectedFileName}" in content-disposition, got ${disposition || "missing content-disposition"}.`
  );
}

async function postJson(baseUrl, path, body) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return {
    status: response.status,
    json: await parseJsonResponse(response)
  };
}

async function fetchJson(baseUrl, path, headers = {}) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers
  });

  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    json: await parseJsonResponse(response)
  };
}

async function fetchText(baseUrl, path, headers = {}) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers
  });

  return {
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    text: await response.text()
  };
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Expected JSON response, got ${contentType || "missing content-type"} with body: ${text.slice(0, 500)}`);
  }

  return response.json();
}

function baseUrlFor(baseUrl, path) {
  return new URL(path, ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizePreviewUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
