import { expect, test } from "@playwright/test";
import { accounts, signIn } from "./helpers";

test.describe("security", () => {
  test("responses carry security headers and do not advertise the framework", async ({ request }) => {
    const response = await request.get("/login");
    const headers = response.headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-powered-by"]).toBeUndefined();
  });

  test("the session cookie is HTTP-only and not readable from scripts", async ({ page, context }) => {
    await signIn(page, accounts.admin);

    const sessionCookie = (await context.cookies()).find((cookie) => cookie.name.includes("session-token"));
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.sameSite).toBe("Lax");
    expect(await page.evaluate(() => document.cookie)).not.toContain("session-token");
  });
});
