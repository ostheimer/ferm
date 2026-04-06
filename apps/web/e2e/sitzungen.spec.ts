import { expect, test } from "@playwright/test";

import { loginAs, logout } from "./support/auth";
import { resetE2eDatabase } from "./support/reset-db";

test.describe("Sitzungen", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async () => {
    await resetE2eDatabase();
  });

  test("schriftfuehrer can create a draft and save a protocol version", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "The mutation flow is covered once on desktop.");

    const suffix = Date.now();
    const initialTitle = `E2E Sitzung ${suffix}`;
    const updatedTitle = `${initialTitle} aktualisiert`;

    await loginAs(page, "schriftfuehrer");
    await page.goto("/sitzungen");

    await page.locator("#sitzung-title").fill(initialTitle);
    await page.locator("#sitzung-scheduled-at").fill("2026-04-15T19:30");
    await page.locator("#sitzung-location").fill("E2E Jagdhaus");
    await page.getByRole("button", { name: "Sitzung anlegen" }).click();

    await expect(page).toHaveURL(/\/sitzungen\/sitzung-/);
    const sitzungId = page.url().split("/").at(-1);

    if (!sitzungId) {
      throw new Error("Expected created sitzung id in URL.");
    }

    await page.locator("#detail-title").fill(updatedTitle);
    await page.locator("#detail-location").fill("E2E Jagdhaus West");
    await page.getByRole("button", { name: "Stammdaten speichern" }).click();

    await expect(page.locator(".feedback-success").filter({ hasText: "Sitzung gespeichert." }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();

    await page.locator("#version-summary").fill("E2E Zusammenfassung fuer die neue Sitzung.");
    await page.locator("#version-agenda").fill("Begruessung\nRevierlage\nWartung");
    await page.locator("article.detail-card").first().locator("input").first().fill("E2E Beschluss");
    await page.locator("article.detail-card").first().locator("textarea").nth(0).fill("Wartung bis Monatsende abschliessen.");
    await page.locator("article.detail-card").first().locator("input").nth(1).fill("Andreas Ostheimer");
    await page.locator("article.detail-card").first().locator("input").nth(2).fill("2026-04-20T18:00");
    await page.getByRole("button", { name: "Neue Version speichern" }).click();

    await expect(
      page.locator(".feedback-success").filter({ hasText: "Neue Protokollversion gespeichert." }).first()
    ).toBeVisible();
    await expect(page.getByText("E2E Beschluss")).toBeVisible();

    const detailResponse = await page.evaluate(async (id) => {
      const response = await fetch(`/api/v1/sitzungen/${id}`, {
        credentials: "include"
      });

      return {
        status: response.status,
        body: (await response.json()) as {
          title: string;
          versions: Array<unknown>;
        }
      };
    }, sitzungId);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.title).toBe(updatedTitle);
    expect(detailResponse.body.versions).toHaveLength(1);
  });

  test("revier admin can approve, open published view and download pdfs", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "The approval flow is covered once on desktop.");

    const suffix = Date.now();
    const title = `E2E Freigabe ${suffix}`;

    await loginAs(page, "schriftfuehrer");
    await page.goto("/sitzungen");

    await page.locator("#sitzung-title").fill(title);
    await page.locator("#sitzung-scheduled-at").fill("2026-04-18T18:45");
    await page.locator("#sitzung-location").fill("E2E Freigabe-Ort");
    await page.getByRole("button", { name: "Sitzung anlegen" }).click();

    await expect(page).toHaveURL(/\/sitzungen\/sitzung-/);
    const sitzungId = page.url().split("/").at(-1);

    if (!sitzungId) {
      throw new Error("Expected created sitzung id in URL.");
    }

    await page.locator("#version-summary").fill("Freigabe-E2E-Zusammenfassung.");
    await page.locator("#version-agenda").fill("Rueckblick\nBeschluesse");
    await page.locator("article.detail-card").first().locator("input").first().fill("E2E Freigabebeschluss");
    await page.locator("article.detail-card").first().locator("textarea").nth(0).fill("Freigabe fuer den PDF-Test vorbereiten.");
    await page.getByRole("button", { name: "Neue Version speichern" }).click();
    await expect(
      page.locator(".feedback-success").filter({ hasText: "Neue Protokollversion gespeichert." }).first()
    ).toBeVisible();

    await logout(page);
    await loginAs(page, "revier-admin");
    await page.goto(`/sitzungen/${sitzungId}`);

    await page.getByRole("button", { name: "Freigeben" }).click();
    await expect(page.locator(".feedback-success").filter({ hasText: "Sitzung wurde freigegeben." }).first()).toBeVisible();
    await expect(page.locator(".panel-card strong").filter({ hasText: "freigegeben" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "PDF laden" })).toBeVisible();

    const pdfResponse = await page.evaluate(async (id) => {
      const response = await fetch(`/api/v1/sitzungen/${id}/pdf`, {
        credentials: "include"
      });

      return {
        status: response.status,
        contentType: response.headers.get("content-type")
      };
    }, sitzungId);

    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.contentType).toContain("application/pdf");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "PDF laden" }).click();
    const download = await downloadPromise;
    const targetPath = testInfo.outputPath(`${sitzungId}.pdf`);
    await download.saveAs(targetPath);
    expect(download.suggestedFilename()).toContain(".pdf");

    await page.goto("/protokolle");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.locator(`a[href="/protokolle/${sitzungId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/protokolle/${sitzungId}$`));
    await expect(page.getByText("Freigabe-E2E-Zusammenfassung.").first()).toBeVisible();
  });
});
