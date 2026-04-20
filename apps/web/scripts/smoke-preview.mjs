#!/usr/bin/env node

import assert from "node:assert/strict";

const DEMO_IDENTIFIER = "ostheimer";
const DEMO_PIN = "9526";
const ACCESS_TOKEN_COOKIE = "hege_access_token";
const REFRESH_TOKEN_COOKIE = "hege_refresh_token";

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
  const cookieHeader = createSessionCookieHeader(login.json.tokens);
  const authHeaders = {
    cookie: cookieHeader,
    authorization: `Bearer ${accessToken}`
  };
  const browserHeaders = {
    cookie: cookieHeader
  };

  const me = await checkJsonEndpoint(baseUrl, "/api/v1/me", authHeaders, {
    label: "/api/v1/me",
    expectedFields: ["user", "membership", "revier", "activeRevierId", "setupRequired"],
    validateJson(json, label) {
      assertFields(json.user, ["id", "name"], `${label}.user`);
      assertFields(json.membership, ["id", "role", "jagdzeichen"], `${label}.membership`);
      assertFields(json.revier, ["id", "name", "bundesland", "bezirk"], `${label}.revier`);
    }
  });

  await checkRedirect(baseUrl, "/login", browserHeaders, ["/app", "/app/setup"]);

  await checkJsonEndpoint(baseUrl, "/api/v1/dashboard", authHeaders, {
    label: "/api/v1/dashboard",
    expectedFields: ["overview", "activeAnsitze", "recentFallwild"],
    validateJson(json, label) {
      assertFields(
        json.overview,
        [
          "revier",
          "aktiveAnsitze",
          "ansitzeMitKonflikt",
          "offeneWartungen",
          "heutigeFallwildBergungen",
          "unveroeffentlichteProtokolle",
          "letzteBenachrichtigungen"
        ],
        `${label}.overview`
      );
      assert.ok(Array.isArray(json.activeAnsitze), `Expected ${label}.activeAnsitze to be an array.`);
      assert.ok(Array.isArray(json.recentFallwild), `Expected ${label}.recentFallwild to be an array.`);
    }
  });

  await checkHtmlPage(baseUrl, "/app", {
    label: "/app",
    headers: browserHeaders,
    expectedText: ["Revierbetrieb, Protokolle und Fallwild auf einen Blick.", me.revier.name]
  });

  const reviereinrichtungen = await checkJsonEndpoint(baseUrl, "/api/v1/reviereinrichtungen", authHeaders, {
    label: "/api/v1/reviereinrichtungen",
    validateJson(json, label) {
      assert.ok(Array.isArray(json), `Expected ${label} to return an array.`);
      assert.ok(json.length > 0, `Expected ${label} to contain at least one entry.`);
      assertFields(json[0], ["id", "name", "status", "location", "kontrollen", "offeneWartungen"], `${label}[0]`);
    }
  });

  await checkHtmlPage(baseUrl, "/app/reviereinrichtungen", {
    label: "/app/reviereinrichtungen",
    headers: browserHeaders,
    expectedText: ["Standorte, Kontrollen und Wartungen im Blick.", reviereinrichtungen[0].name]
  });

  const protokolle = await checkJsonEndpoint(baseUrl, "/api/v1/protokolle", authHeaders, {
    label: "/api/v1/protokolle",
    validateJson(json, label) {
      assert.ok(Array.isArray(json), `Expected ${label} to return an array.`);
      assert.ok(json.length > 0, `Expected ${label} to contain at least one entry.`);
      assertFields(
        json[0],
        ["id", "title", "status", "scheduledAt", "locationLabel", "beschlussCount"],
        `${label}[0]`
      );
    }
  });
  const publishedProtokoll = protokolle.find((entry) => entry.publishedDocument?.downloadUrl);
  assert.ok(publishedProtokoll, "Expected /api/v1/protokolle to include a published document download.");

  await checkHtmlPage(baseUrl, "/app/protokolle", {
    label: "/app/protokolle",
    headers: browserHeaders,
    expectedText: ["Freigegebene Protokolle und Beschluesse", publishedProtokoll.title]
  });

  const protokollDetail = await checkJsonEndpoint(
    baseUrl,
    `/api/v1/protokolle/${encodeURIComponent(publishedProtokoll.id)}`,
    authHeaders,
    {
      label: `/api/v1/protokolle/${publishedProtokoll.id}`,
      expectedFields: ["id", "title", "participants", "versions", "publishedDocument"],
      validateJson(json, label) {
        assert.ok(Array.isArray(json.participants), `Expected ${label}.participants to be an array.`);
        assert.ok(Array.isArray(json.versions), `Expected ${label}.versions to be an array.`);
        assert.ok(json.versions.length > 0, `Expected ${label}.versions to contain at least one version.`);
      }
    }
  );

  await checkHtmlPage(baseUrl, `/app/protokolle/${encodeURIComponent(publishedProtokoll.id)}`, {
    label: `/app/protokolle/${publishedProtokoll.id}`,
    headers: browserHeaders,
    expectedText: [protokollDetail.title, publishedProtokoll.publishedDocument.fileName]
  });

  await checkDownload(baseUrl, publishedProtokoll.publishedDocument.downloadUrl, authHeaders, {
    label: publishedProtokoll.publishedDocument.downloadUrl,
    expectedContentType: "application/pdf",
    expectedFileName: publishedProtokoll.publishedDocument.fileName
  });

  const sitzungen = await checkJsonEndpoint(baseUrl, "/api/v1/sitzungen", authHeaders, {
    label: "/api/v1/sitzungen",
    validateJson(json, label) {
      assert.ok(Array.isArray(json), `Expected ${label} to return an array.`);
      assert.ok(json.length > 0, `Expected ${label} to contain at least one entry.`);
      assertFields(json[0], ["id", "title", "status", "participants", "versions"], `${label}[0]`);
    }
  });

  await checkHtmlPage(baseUrl, "/app/sitzungen", {
    label: "/app/sitzungen",
    headers: browserHeaders,
    expectedText: ["Entwuerfe, Protokollstaende und Freigaben", sitzungen[0].title]
  });

  console.log("Preview smoke passed.");
}

async function checkJsonEndpoint(baseUrl, path, headers = {}, options = {}) {
  const { label = path, expectedFields = [], validateJson } = options;
  const response = await fetchJson(baseUrl, path, headers);

  assert.equal(response.status, 200, `Expected ${label} to return 200, got ${response.status}.`);
  assert.ok(
    response.contentType.includes("application/json"),
    `Expected ${label} to return application/json, got ${response.contentType ?? "missing content-type"}.`
  );

  for (const field of expectedFields) {
    assert.ok(field in response.json, `Expected ${label} JSON to include "${field}".`);
  }

  if (validateJson) {
    validateJson(response.json, label);
  }

  return response.json;
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

async function checkDownload(baseUrl, path, headers = {}, options = {}) {
  const { label = path, expectedContentType, expectedFileName } = options;
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers,
    redirect: "manual"
  });

  assert.equal(response.status, 200, `Expected ${label} to return 200, got ${response.status}.`);

  const contentType = response.headers.get("content-type") ?? "";
  if (expectedContentType) {
    assert.ok(
      contentType.includes(expectedContentType),
      `Expected ${label} to return ${expectedContentType}, got ${contentType || "missing content-type"}.`
    );
  }

  if (expectedFileName) {
    const disposition = response.headers.get("content-disposition") ?? "";
    assert.ok(
      disposition.includes(`filename="${expectedFileName}"`),
      `Expected ${label} to download ${expectedFileName}, got ${disposition || "missing content-disposition"}.`
    );
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

async function checkRedirect(baseUrl, path, headers = {}, expectedLocations) {
  const response = await fetch(baseUrlFor(baseUrl, path), {
    headers,
    redirect: "manual"
  });

  assert.ok(
    response.status >= 300 && response.status < 400,
    `Expected ${path} to redirect, got ${response.status}.`
  );

  const location = response.headers.get("location") ?? "";
  const allowedLocations = Array.isArray(expectedLocations) ? expectedLocations : [expectedLocations];
  assert.ok(location.length > 0, `Expected ${path} to send a location header.`);
  assert.ok(
    allowedLocations.some((expectedLocation) => location.endsWith(expectedLocation)),
    `Expected ${path} to redirect to one of ${allowedLocations.join(", ")}, got ${location}.`
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

function assertFields(value, fields, label) {
  assert.ok(value && typeof value === "object", `Expected ${label} to be an object.`);

  for (const field of fields) {
    assert.ok(field in value, `Expected ${label} to include "${field}".`);
  }
}

function createSessionCookieHeader(tokens) {
  return [
    `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(tokens.accessToken)}`,
    `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(tokens.refreshToken)}`
  ].join("; ");
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
