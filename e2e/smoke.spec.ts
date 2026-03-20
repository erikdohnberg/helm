import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveTitle(/Helm/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /keep strategy/i }),
    ).toBeVisible();
  });

  test("home redirects to landing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/landing$/);
  });

  test("auth session endpoint returns JSON", async ({ request }) => {
    const response = await request.get("/api/auth/session");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"] ?? "").toMatch(/application\/json/);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test("guest visiting quarter is redirected to landing", async ({ page }) => {
    await page.goto("/quarter");
    await expect(page).toHaveURL(/\/landing/);
  });
});
