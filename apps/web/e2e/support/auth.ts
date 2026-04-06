import { expect, type Page } from "@playwright/test";

type DemoUserRole = "revier-admin" | "schriftfuehrer" | "jaeger";

const DEMO_PIN = "9526";

const credentialsByRole: Record<DemoUserRole, { identifier: string; name: string }> = {
  "revier-admin": {
    identifier: "ostheimer",
    name: "Andreas Ostheimer"
  },
  schriftfuehrer: {
    identifier: "martin.mair@hege.app",
    name: "Martin Mair"
  },
  jaeger: {
    identifier: "lukas.huber@hege.app",
    name: "Lukas Huber"
  }
};

export async function loginAs(page: Page, role: DemoUserRole) {
  const credentials = credentialsByRole[role];

  await page.context().clearCookies();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#login-identifier").fill(credentials.identifier);
  await page.locator("#login-pin").fill(DEMO_PIN);
  await page.getByRole("button", { name: "Anmelden" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(new RegExp(`${escapeRegExp(credentials.name)} \\|`))).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Abmelden" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
