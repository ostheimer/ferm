#!/usr/bin/env node

import assert from "node:assert/strict";

const DEMO_IDENTIFIER = "ostheimer";
const DEMO_PIN = "9526";

const previewUrl = normalizePreviewUrl(process.argv[2] ?? process.env.PREVIEW_URL);

if (!previewUrl) {
  fail("Usage: node ./scripts/smoke-preview.mjs <preview-url>");
}

await runSmoke(previewUrl);

async function runSmoke(baseUrl) {
  console.log(`Preview smoke against ${baseUrl}`);

  await checkHtmlPage(baseUrl, "/", {
    label: "/",
    expectedText: ["Revierbetrieb, Protokolle und Feldmeldungen in einer klaren Oberflaeche.", "Passendes Paket waehlen"]
  });

  await checkHtmlPage(baseUrl, "/login", {
    label: "/login",
    expectedText: ["Anmelden", "Backoffice und App jetzt mit echter Session."]
  });

  await checkHtmlPage(baseUrl, "/registrieren?plan=starter", {
    label: "/registrieren?plan=starter"
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

  await checkRedirect(baseUrl, "/login", authHeaders, "/app");

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

async function checkRedirect(baseUrl, path, headers = {}, expectedLocation) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers,
    redirect: "manual"
  });

  assert.ok(
    response.status >= 300 && response.status < 400,
    `Expected ${path} to redirect, got ${response.status}.`
  );

  const location = response.headers.get("location") ?? "";
  assert.ok(location.length > 0, `Expected ${path} to send a location header.`);
  assert.ok(
    location.endsWith(expectedLocation),
    `Expected ${path} to redirect to ${expectedLocation}, got ${location}.`
  );
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
