import { expect, test } from "@playwright/test";

import { loginAs, logout } from "./support/auth";
import { resetE2eDatabase } from "./support/reset-db";

test.describe("Auth und geschuetzte Routen", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/sitzungen");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
  });

  test("logs in and out with the visible sidebar action", async ({ page }) => {
    await loginAs(page, "schriftfuehrer");
    await expect(page.getByRole("button", { name: "Abmelden" })).toBeVisible();

    await logout(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("keeps jaeger away from sitzungen routes", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-chromium", "Role redirect is covered once on desktop.");

    await loginAs(page, "jaeger");
    await page.goto("/sitzungen");

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Revierbetrieb, Protokolle und Fallwild auf einen Blick." })).toBeVisible();
  });
});
