import { expect, type Page } from "@playwright/test";

/** Demo accounts created by `npx prisma db seed`. */
export const accounts = {
  admin: "admin@example.com",
  client: "client@example.com",
  otherClient: "client2@example.com",
} as const;

const password = process.env.SEED_PASSWORD || "demo-password";

export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);
}

/** A project name that is unique per run, so tests can be repeated against the same database. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
