import { describe, expect, it } from "vitest";

import { checkSitzungMutationStatus } from "./service";

describe("checkSitzungMutationStatus", () => {
  it("erlaubt Stammdaten-Mutation in einer Entwurf-Sitzung", () => {
    expect(checkSitzungMutationStatus("entwurf", "stammdaten")).toEqual({ ok: true });
  });

  it("blockiert Stammdaten-Mutation in einer freigegebenen Sitzung", () => {
    expect(checkSitzungMutationStatus("freigegeben", "stammdaten")).toEqual({
      ok: false,
      reason: "stammdaten-locked"
    });
  });

  it("erlaubt eine neue Protokollversion auch fuer freigegebene Sitzungen", () => {
    expect(checkSitzungMutationStatus("freigegeben", "version")).toEqual({ ok: true });
    expect(checkSitzungMutationStatus("entwurf", "version")).toEqual({ ok: true });
  });

  it("erlaubt eine erneute Freigabe-Aktion (idempotent)", () => {
    expect(checkSitzungMutationStatus("freigegeben", "freigabe")).toEqual({ ok: true });
    expect(checkSitzungMutationStatus("entwurf", "freigabe")).toEqual({ ok: true });
  });
});
