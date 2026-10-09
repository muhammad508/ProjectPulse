import { expect, test } from "@playwright/test";
import { accounts, signIn } from "./helpers";

test.describe("dashboard", () => {
  test("an admin sees every client's active projects", async ({ page }) => {
    await signIn(page, accounts.admin);

    await expect(page.getByRole("heading", { name: "Active projects" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Website redesign" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Brand identity" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Upcoming deadlines" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recently completed" })).toBeVisible();
  });

  test("a client's dashboard only contains their own work", async ({ page }) => {
    await signIn(page, accounts.client);

    await expect(page.getByRole("heading", { name: "Website redesign" })).toBeVisible();
    await expect(page.getByText("Brand identity")).toHaveCount(0);
    await expect(page.getByText("Moodboards")).toHaveCount(0);
    // "Visual design approved" is one of Casey's own completed milestones in the seed data.
    await expect(page.getByText("Visual design approved")).toBeVisible();
  });

  test("the progress bar reflects completed milestones", async ({ page }) => {
    await signIn(page, accounts.client);

    // The seeded "Website redesign" has 3 of 5 milestones completed.
    await expect(page.getByRole("progressbar", { name: "Website redesign progress" })).toHaveAttribute(
      "aria-valuenow",
      "60",
    );
  });
});
