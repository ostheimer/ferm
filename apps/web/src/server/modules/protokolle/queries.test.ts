import { describe, expect, it } from "vitest";

import { getProtokollDetail, listProtokolle } from "./queries";

describe("protokolle queries", () => {
  it("lists only published protokolle", async () => {
    const result = await listProtokolle();

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("sitzung-2");
    expect(result[0]?.status).toBe("freigegeben");
    expect(result[0]?.publishedDocument?.downloadUrl).toBe("/api/v1/documents/document-sitzung-2/download");
  });

  it("returns published protocol detail with versions and participants", async () => {
    const result = await getProtokollDetail("sitzung-2");

    expect(result).toBeDefined();
    expect(result?.versions).toHaveLength(1);
    expect(result?.participants).toHaveLength(2);
    expect(result?.publishedDocument?.downloadUrl).toBe("/api/v1/documents/document-sitzung-2/download");
  });

  it("does not expose draft protocols", async () => {
    const result = await getProtokollDetail("sitzung-1");

    expect(result).toBeUndefined();
  });
});
