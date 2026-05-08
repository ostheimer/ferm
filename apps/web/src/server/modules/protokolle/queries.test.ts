import { describe, expect, it } from "vitest";

import { getProtokollDetail, listProtokolle } from "./queries";

describe("protokolle queries", () => {
  it("lists only published protokolle", async () => {
    const result = await listProtokolle();

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((entry) => entry.status === "freigegeben")).toBe(true);
    const sitzung2 = result.find((entry) => entry.id === "sitzung-2");
    expect(sitzung2).toBeDefined();
    expect(sitzung2?.publishedDocument?.downloadUrl).toBe("/api/v1/documents/document-sitzung-2/download");
  });

  it("returns published protocol detail with versions and participants", async () => {
    const result = await getProtokollDetail("sitzung-2");

    expect(result).toBeDefined();
    expect(result?.versions).toHaveLength(1);
    expect(result?.participants).toHaveLength(3);
    expect(result?.participants.map((entry) => entry.membershipId)).toContain("member-ausgeher");
    expect(result?.publishedDocument?.downloadUrl).toBe("/api/v1/documents/document-sitzung-2/download");
  });

  it("does not expose draft protocols", async () => {
    const result = await getProtokollDetail("sitzung-1");

    expect(result).toBeUndefined();
  });
});
