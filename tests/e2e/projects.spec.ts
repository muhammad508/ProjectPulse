import { expect, test } from "@playwright/test";
import { accounts, signIn, signOut, uniqueName } from "./helpers";

test.describe("projects and milestones", () => {
  test("an admin creates a project, assigns it to a client and tracks milestone progress", async ({
    page,
  }) => {
    const projectName = uniqueName("E2E project");

    await signIn(page, accounts.admin);

    // Create the project and assign it to the client.
    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(projectName);
    await page.getByLabel("Client").selectOption({ label: "Casey Client (client@example.com)" });
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/projects\/[^/]+\/edit$/);

    // Add two milestones.
    for (const title of ["Kick-off", "Delivery"]) {
      await page.getByLabel("New milestone").fill(title);
      await page.getByRole("button", { name: "Add milestone" }).click();
      await expect(page.locator(`input[name="title"][value="${title}"]`)).toBeVisible();
    }

    // Complete one: progress becomes 50% and the activity feed records it.
    await page.getByRole("link", { name: "← Back to project" }).click();
    await expect(page.getByRole("progressbar", { name: "Project progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );

    await page.getByRole("button", { name: 'Mark "Kick-off" as completed' }).click();
    await expect(page.getByRole("progressbar", { name: "Project progress" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
    await expect(page.getByText('Milestone "Kick-off" completed')).toBeVisible();

    // Reopen it: progress drops back and the reopening is recorded too.
    await page.getByRole("button", { name: 'Reopen "Kick-off"' }).click();
    await expect(page.getByRole("progressbar", { name: "Project progress" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    await expect(page.getByText('Milestone "Kick-off" reopened')).toBeVisible();
  });

  test("an admin can rename, reorder and delete milestones", async ({ page }) => {
    await signIn(page, accounts.admin);
    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(uniqueName("Milestone project"));
    await page.getByLabel("Client").selectOption({ label: "Casey Client (client@example.com)" });
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/edit$/);

    const titles = page.locator('input[id^="title-"]');
    const currentTitles = () =>
      titles.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));

    for (const title of ["Alpha", "Bravo", "Charlie"]) {
      await page.getByLabel("New milestone").fill(title);
      await page.getByRole("button", { name: "Add milestone" }).click();
      await expect(titles).toHaveCount(["Alpha", "Bravo", "Charlie"].indexOf(title) + 1);
    }
    expect(await currentTitles()).toEqual(["Alpha", "Bravo", "Charlie"]);

    // Reorder: Charlie moves above Bravo.
    await page.getByRole("button", { name: 'Move "Charlie" up' }).click();
    await expect.poll(currentTitles).toEqual(["Alpha", "Charlie", "Bravo"]);

    // Rename.
    await titles.nth(0).fill("Alpha (renamed)");
    await page.getByRole("button", { name: "Save", exact: true }).first().click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await page.reload();
    expect(await currentTitles()).toEqual(["Alpha (renamed)", "Charlie", "Bravo"]);

    // Delete.
    await page.getByRole("button", { name: 'Delete "Charlie"' }).click();
    await expect.poll(currentTitles).toEqual(["Alpha (renamed)", "Bravo"]);
  });

  test("an admin can post a note and change a project's status", async ({ page }) => {
    const projectName = uniqueName("Status project");
    await signIn(page, accounts.admin);

    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(projectName);
    await page.getByLabel("Client").selectOption({ label: "Casey Client (client@example.com)" });
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/edit$/);

    await page.getByLabel("Status").selectOption("ACTIVE");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Project saved")).toBeVisible();

    await page.getByRole("link", { name: "← Back to project" }).click();
    await expect(page.getByText("Status changed from Planning to Active")).toBeVisible();

    await page.getByLabel("Add a note").fill("Client approved the moodboards.");
    await page.getByRole("button", { name: "Post note" }).click();
    await expect(page.getByText("Client approved the moodboards.")).toBeVisible();
  });

  test("the project form rejects invalid input", async ({ page }) => {
    await signIn(page, accounts.admin);
    await page.goto("/projects/new");
    await page.getByLabel("Start date").fill("2026-06-01");
    await page.getByLabel("Due date").fill("2026-01-01");
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Select a client", { exact: true })).toBeVisible();
    await expect(page.getByText("Due date must not be before the start date")).toBeVisible();
    await expect(page).toHaveURL(/\/projects\/new$/);
  });

  test("a client sees only their own projects", async ({ page }) => {
    await signIn(page, accounts.client);
    await page.goto("/projects");

    await expect(page.getByRole("link", { name: /Website redesign/ })).toBeVisible();
    await expect(page.getByText("Brand identity")).toHaveCount(0);
    // Archived projects are hidden from clients.
    await expect(page.getByText("Legacy intranet migration")).toHaveCount(0);
    // Clients have no management controls.
    await expect(page.getByRole("link", { name: "New project" })).toHaveCount(0);
  });

  test("a client cannot open another client's project, even by its URL", async ({ page, browser }) => {
    // Find the other client's project id as that client.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await signIn(otherPage, accounts.otherClient);
    await otherPage.goto("/projects");
    await otherPage.getByRole("link", { name: /Brand identity/ }).click();
    await expect(otherPage).toHaveURL(/\/projects\/[^/]+$/);
    const foreignProjectUrl = otherPage.url();
    await otherContext.close();

    await signIn(page, accounts.client);
    const response = await page.goto(foreignProjectUrl);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("a client is kept out of admin pages and sees a read-only project", async ({ page }) => {
    await signIn(page, accounts.client);

    await page.goto("/projects/new");
    await expect(page).toHaveURL(/localhost:3000\/$/);

    await page.goto("/projects");
    await page.getByRole("link", { name: /Website redesign/ }).click();
    await expect(page.getByRole("heading", { name: "Website redesign" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Archive" })).toHaveCount(0);
    await expect(page.getByLabel("Add a note")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Mark ".*" as completed/ })).toHaveCount(0);

    await signOut(page);
  });

  test("an admin can archive and restore a project", async ({ page }) => {
    const projectName = uniqueName("Archive me");
    await signIn(page, accounts.admin);

    await page.goto("/projects/new");
    await page.getByLabel("Name").fill(projectName);
    await page.getByLabel("Client").selectOption({ label: "Jordan Client (client2@example.com)" });
    await page.getByRole("button", { name: "Create project" }).click();
    await expect(page).toHaveURL(/\/edit$/);

    await page.getByRole("link", { name: "← Back to project" }).click();
    await page.getByRole("button", { name: "Archive" }).click();
    await expect(page.getByText("Archived", { exact: true })).toBeVisible();

    // Hidden from the default list, visible with the archive filter.
    await page.goto("/projects");
    await expect(page.getByText(projectName)).toHaveCount(0);
    await page.goto("/projects?archived=1");
    await expect(page.getByText(projectName)).toBeVisible();

    await page.getByRole("link", { name: new RegExp(projectName) }).click();
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(page.getByText("Archived", { exact: true })).toHaveCount(0);
  });
});
