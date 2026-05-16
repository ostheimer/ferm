import { expect, test } from "@playwright/test";

import { loginAs } from "./support/auth";
import { resetE2eDatabase } from "./support/reset-db";

const mapPages = [
  { path: "/app", heading: "Revier im Tagesbetrieb" },
  { path: "/app/reviereinrichtungen", heading: "Einrichtungen im Revier" },
  { path: "/app/fallwild", heading: "Fallwild-Lage im Revier" },
  { path: "/app/reviermeldungen", heading: "Reviermeldungen mit Standort" }
];

test.describe("Kartenflächen", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetE2eDatabase();
    await loginAs(page, "schriftfuehrer");
  });

  for (const { path, heading } of mapPages) {
    test(`${heading} zeigt Karte oder Fallback`, async ({ page }, testInfo) => {
      await page.goto(path);

      const mapPanel = page.locator(".map-panel").filter({ hasText: heading }).first();

      await expect(mapPanel).toBeVisible();
      await expect(mapPanel.getByRole("heading", { name: heading })).toBeVisible();
      await expect(mapPanel.getByLabel(/Revierkarte/)).toBeVisible();
      await expect(mapPanel.getByText("Karte deaktiviert")).toBeVisible();
      await expect(mapPanel.getByText(/Marker im Datensatz/)).toBeVisible();

      if (testInfo.project.name === "mobile-chromium") {
        const hasHorizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        );

        expect(hasHorizontalOverflow).toBe(false);
      }
    });
  }
});
