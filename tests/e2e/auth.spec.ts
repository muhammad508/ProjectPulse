import { expect, test } from "@playwright/test";
import { accounts, signIn, signOut } from "./helpers";

test.describe("authentication", () => {
  test("unauthenticated visitors are redirected to the login page", async ({ page }) => {
    for (const path of ["/", "/projects", "/projects/new"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("wrong credentials show an error and do not sign in", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(accounts.admin);
    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Incorrect email or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("the form validates input before submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("a user can sign in and out", async ({ page }) => {
    await signIn(page, accounts.admin);
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    await signOut(page);
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/login/);
  });

  test("the callback URL cannot redirect off-site", async ({ page }) => {
    await page.goto("/login?callbackUrl=https://evil.example");
    await page.getByLabel("Email").fill(accounts.admin);
    await page.getByLabel("Password").fill(process.env.SEED_PASSWORD || "demo-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
    expect(new URL(page.url()).hostname).toBe("localhost");
  });
});
