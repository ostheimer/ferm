import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { loginAs } from "./support/auth";
import { resetE2eDatabase } from "./support/reset-db";
import { visualSnapshotOptions } from "./support/visual";

test.describe("Fallwild", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetE2eDatabase();
    await loginAs(page, "schriftfuehrer");
  });

  test("matches the visual baseline on desktop and mobile", async ({ page }, testInfo) => {
    await page.goto("/fallwild");

    await expect(page.locator("main")).toHaveScreenshot("fallwild-overview.png", visualSnapshotOptions);

    if (testInfo.project.name === "mobile-chromium") {
      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(hasHorizontalOverflow).toBe(false);
    }
  });

  test("creates a fallwild entry and exports csv", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "The mutation flow is covered once on desktop.");

    const suffix = Date.now();
    const gemeinde = `E2E Gemeinde ${suffix}`;

    await page.goto("/fallwild");
    await page.locator("#fallwild-gemeinde").fill(gemeinde);
    await page.locator("#fallwild-strasse").fill("E2E-Landesstrasse");
    await page.locator("#fallwild-location-label").fill("E2E Kurve");
    await page.locator("#fallwild-lat").fill("47.9105");
    await page.locator("#fallwild-lng").fill("13.5792");
    await page.locator("#fallwild-wildart").selectOption("Fuchs");
    await page.locator("#fallwild-note").fill("Automatischer E2E-Test fuer Fallwild.");
    await page.getByRole("button", { name: "Fallwild erfassen" }).click();

    await expect(page.getByText("Fallwild wurde erfasst.")).toBeVisible();
    await expect(page.locator(".form-footer")).toHaveScreenshot("fallwild-submit-success.png", visualSnapshotOptions);
    await expect(page.getByText(`${gemeinde} / E2E-Landesstrasse`)).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "CSV-Export" }).click();
    const download = await downloadPromise;
    const targetPath = testInfo.outputPath("fallwild.csv");

    await download.saveAs(targetPath);

    const csv = await readFile(targetPath, "utf8");

    expect(csv).toContain(gemeinde);
    expect(csv).toContain("E2E-Landesstrasse");
  });
});
