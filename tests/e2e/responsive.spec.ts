import { expect, test, type Page } from "@playwright/test";
import { accounts, signIn } from "./helpers";

// A phone-sized viewport: pages must fit without horizontal scrolling.
test.use({ viewport: { width: 375, height: 812 } });

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `page ${page.url()} scrolls horizontally`).toBeLessThanOrEqual(0);
}

test.describe("responsive layout", () => {
  test("the login page fits a phone screen", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("admin pages fit a phone screen", async ({ page }) => {
    await signIn(page, accounts.admin);
    await expectNoHorizontalScroll(page);

    await page.goto("/projects");
    await expectNoHorizontalScroll(page);

    await page.goto("/projects/new");
    await expectNoHorizontalScroll(page);

    await page.goto("/projects");
    await page.getByRole("link", { name: /Website redesign/ }).click();
    await expect(page.getByRole("heading", { name: "Website redesign" })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page.getByRole("heading", { name: "Edit project" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("client pages fit a phone screen", async ({ page }) => {
    await signIn(page, accounts.client);
    await expectNoHorizontalScroll(page);

    await page.goto("/projects");
    await page.getByRole("link", { name: /Website redesign/ }).click();
    await expect(page.getByRole("heading", { name: "Website redesign" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
