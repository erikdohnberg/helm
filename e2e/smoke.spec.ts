import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/landing");
    await expect(page).toHaveTitle(/Helm/i);
    await expect(
      page.getByRole("heading", { level: 1, name: /keep strategy/i }),
    ).toBeVisible();
  });

  test("home redirects to the scorecard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/scorecard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /evaluating the drift model/i }),
    ).toBeVisible();
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

  test("scorecard is publicly reachable at /scorecard", async ({ page }) => {
    await page.goto("/scorecard");
    // A route now, not a rewrite to static HTML — and public, so a guest is
    // not bounced to /landing.
    await expect(page).toHaveURL(/\/scorecard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /evaluating the drift model/i }),
    ).toBeVisible();
    // The record states its own limits; that section must survive edits.
    await expect(
      page.getByText(/what this record cannot claim yet/i),
    ).toBeVisible();
    await expect(page.getByText(/side project/i)).toHaveCount(0);
  });

  test("brand fonts are served", async ({ request }) => {
    // Source Serif 4 does one job in the design system — outcome titles and
    // page display — and is self-hosted so the record never depends on a CDN.
    for (const font of [
      "/fonts/source-serif-4-latin.woff2",
      "/fonts/source-serif-4-latin-ext.woff2",
      "/fonts/source-serif-4-latin-italic.woff2",
      "/fonts/source-serif-4-latin-ext-italic.woff2",
    ]) {
      const response = await request.get(font);
      expect(response.status(), font).toBe(200);
    }
  });
});
