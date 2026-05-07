import { describe, expect, it } from "vitest";

import {
  filterE2eFallwildIds,
  filterE2eSitzungIds,
  isE2eFallwildRecord,
  isE2eSitzungTitle,
  looksLikeProductionDatabaseUrl
} from "./cleanup-e2e-helpers";

describe("isE2eSitzungTitle", () => {
  it("matches the canonical E2E prefix with trailing space", () => {
    expect(isE2eSitzungTitle("E2E Freigabe 1775426186688")).toBe(true);
  });

  it("does not match operator titles that merely contain the substring", () => {
    expect(isE2eSitzungTitle("Vorbereitung E2E Freigabe")).toBe(false);
  });

  it("does not match the prefix without trailing space", () => {
    expect(isE2eSitzungTitle("E2E-Sitzung")).toBe(false);
  });

  it("does not match unrelated titles", () => {
    expect(isE2eSitzungTitle("Quartalsbesprechung Q1")).toBe(false);
  });
});

describe("filterE2eSitzungIds", () => {
  it("returns only ids of E2E sitzungen and preserves input order", () => {
    const records = [
      { id: "sitzung-real-1", title: "Quartalsbesprechung Q1" },
      { id: "sitzung-e2e-1", title: "E2E Freigabe 1775426186688" },
      { id: "sitzung-real-2", title: "Vorbereitung E2E" },
      { id: "sitzung-e2e-2", title: "E2E Entwurf 1775426300000" }
    ];

    expect(filterE2eSitzungIds(records)).toEqual(["sitzung-e2e-1", "sitzung-e2e-2"]);
  });

  it("returns an empty array when no records match", () => {
    expect(
      filterE2eSitzungIds([
        { id: "s-1", title: "Quartalsbesprechung Q1" },
        { id: "s-2", title: "Hegeschau 2026" }
      ])
    ).toEqual([]);
  });

  it("returns an empty array for an empty input", () => {
    expect(filterE2eSitzungIds([])).toEqual([]);
  });
});

describe("isE2eFallwildRecord", () => {
  it("matches when the gemeinde uses the canonical E2E prefix", () => {
    expect(
      isE2eFallwildRecord({
        id: "fw-1",
        gemeinde: "E2E Gemeinde 1775426471423",
        strasse: null
      })
    ).toBe(true);
  });

  it("matches when only the strasse uses the canonical E2E- prefix", () => {
    expect(
      isE2eFallwildRecord({
        id: "fw-2",
        gemeinde: "Wolkersdorf",
        strasse: "E2E-Landesstrasse"
      })
    ).toBe(true);
  });

  it("does not match operator records that merely contain the substring", () => {
    expect(
      isE2eFallwildRecord({
        id: "fw-3",
        gemeinde: "Bad-E2E-Naming",
        strasse: "Hauptstraße"
      })
    ).toBe(false);
  });

  it("does not match when strasse is null and gemeinde is unrelated", () => {
    expect(
      isE2eFallwildRecord({
        id: "fw-4",
        gemeinde: "Wolkersdorf",
        strasse: null
      })
    ).toBe(false);
  });
});

describe("filterE2eFallwildIds", () => {
  it("returns ids that match either gemeinde or strasse criterion", () => {
    const records = [
      { id: "fw-real", gemeinde: "Wolkersdorf", strasse: "Hauptstraße" },
      { id: "fw-gemeinde", gemeinde: "E2E Gemeinde 1775426471423", strasse: null },
      { id: "fw-strasse", gemeinde: "Wolkersdorf", strasse: "E2E-Landesstrasse" },
      { id: "fw-both", gemeinde: "E2E Gemeinde 2", strasse: "E2E-Bundesstrasse" }
    ];

    expect(filterE2eFallwildIds(records)).toEqual(["fw-gemeinde", "fw-strasse", "fw-both"]);
  });
});

describe("looksLikeProductionDatabaseUrl", () => {
  it("treats a Neon pooler hostname without stage marker as production", () => {
    expect(
      looksLikeProductionDatabaseUrl(
        "postgresql://user:pass@ep-cool-cloud-12345.eu-central-1.aws.neon.tech/hege"
      )
    ).toBe(true);
  });

  it("treats a Neon pooler hostname for preview as non-production", () => {
    expect(
      looksLikeProductionDatabaseUrl(
        "postgresql://user:pass@ep-preview-12345.eu-central-1.aws.neon.tech/hege_preview"
      )
    ).toBe(false);
  });

  it("treats a Neon pooler hostname for development as non-production", () => {
    expect(
      looksLikeProductionDatabaseUrl(
        "postgresql://user:pass@ep-dev-pooler.eu-central-1.aws.neon.tech/hege_dev"
      )
    ).toBe(false);
  });

  it("does not treat a localhost connection as production", () => {
    expect(looksLikeProductionDatabaseUrl("postgresql://hege:hege@127.0.0.1:5432/hege")).toBe(false);
  });

  it("returns false for malformed URLs", () => {
    expect(looksLikeProductionDatabaseUrl("not-a-url")).toBe(false);
  });
});
