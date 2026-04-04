import { expect, test } from "@playwright/test";

import { resetE2eDatabase } from "./support/reset-db";
import { visualSnapshotOptions } from "./support/visual";

test.describe("Ansitze", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test("matches the visual baseline on desktop and mobile", async ({ page }, testInfo) => {
    await page.goto("/ansitze");

    await expect(page.locator("main")).toHaveScreenshot("ansitze-overview.png", visualSnapshotOptions);

    if (testInfo.project.name === "mobile-chromium") {
      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasHorizontalOverflow).toBe(false);
    }
  });

  test("starts and ends an ansitz", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "The mutation flow is covered once on desktop.");

    const suffix = Date.now();
    const standortName = `E2E Ansitz ${suffix}`;

    await page.goto("/ansitze");
    await page.locator("#ansitz-standort-name").fill(standortName);
    await page.locator("#ansitz-standort-id").fill(`e2e-${suffix}`);
    await page.locator("#ansitz-location-label").fill("E2E Schneise");
    await page.locator("#ansitz-note").fill("Automatischer E2E-Test fuer Ansitze.");
    await page.getByRole("button", { name: "Ansitz starten" }).click();

    await expect(page.getByText("Ansitz wurde gestartet.")).toBeVisible();
    await expect(page.locator(".form-footer")).toHaveScreenshot("ansitze-submit-success.png", visualSnapshotOptions);

    const ansitzRow = page.locator("tbody tr").filter({ hasText: standortName });

    await expect(ansitzRow).toHaveCount(1);
    await ansitzRow.getByRole("button", { name: "Beenden" }).click();

    await expect(page.getByText("Ansitz wurde beendet.")).toBeVisible();
    await expect(page.locator(".form-footer")).toHaveScreenshot("ansitze-end-success.png", visualSnapshotOptions);
    await expect(ansitzRow).toHaveCount(0);
  });
});
