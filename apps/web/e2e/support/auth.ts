import { expect, type Page } from "@playwright/test";

type DemoUserRole = "revier-admin" | "schriftfuehrer" | "jaeger";

const DEMO_PASSWORD = "hege-demo-2026";

const credentialsByRole: Record<DemoUserRole, { email: string; name: string }> = {
  "revier-admin": {
    email: "anna.steyrer@hege.app",
    name: "Anna Steyrer"
  },
  schriftfuehrer: {
    email: "martin.mair@hege.app",
    name: "Martin Mair"
  },
  jaeger: {
    email: "lukas.huber@hege.app",
    name: "Lukas Huber"
  }
};

export async function loginAs(page: Page, role: DemoUserRole) {
  const credentials = credentialsByRole[role];

  await page.context().clearCookies();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/login$/);

  await page.locator("#login-email").fill(credentials.email);
  await page.locator("#login-password").fill(DEMO_PASSWORD);
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
