import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockExportFallwildCsv } = vi.hoisted(() => ({
  mockExportFallwildCsv: vi.fn()
}));

vi.mock("../../../../../server/modules/fallwild/queries", () => ({
  exportFallwildCsv: mockExportFallwildCsv
}));

import { GET } from "./route";

describe("GET /api/v1/fallwild/export.csv", () => {
  beforeEach(() => {
    mockExportFallwildCsv.mockReset();
  });

  it("returns csv content with download headers", async () => {
    mockExportFallwildCsv.mockResolvedValue("id;gemeinde\nfallwild-1;Attersee");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("content-disposition")).toBe("attachment; filename=fallwild.csv");
    expect(await response.text()).toBe("id;gemeinde\nfallwild-1;Attersee");
  });
});
