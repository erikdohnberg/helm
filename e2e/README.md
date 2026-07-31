# End-to-end tests (Playwright)

## One-time setup

Install Chromium for the default project:

```bash
npx playwright install chromium
```

On Linux CI, use `npx playwright install --with-deps chromium` (see `.github/workflows/playwright.yml`).

## Running tests locally

The app is started with **`npm run build && npm run start`** via Playwright’s `webServer` (production mode), unless a server is already listening on the same URL (see below).

**Environment:** There is no `dotenv` in this setup. Run tests from a shell where the same variables you use for production are available (for example load [`.env.local`](../.env.local) in your terminal, or export manually). At minimum you need:

- `AUTH_SECRET` (required for `next start`; no dev fallback in production)
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` (required by the Google provider in `auth.ts`)
- `DATABASE_URL` (SQLite for Prisma)

If `next build` fails on a fresh clone, run `npx prisma generate` and ensure migrations are applied (`npx prisma migrate deploy`).

```bash
npm run test:e2e
```

Optional: `npm run test:e2e:ui` for the Playwright UI.

## Server reuse

`reuseExistingServer` is **false** only when `GITHUB_ACTIONS=true` (CI). Locally, if something is already listening on `PLAYWRIGHT_BASE_URL` (default `http://127.0.0.1:3000`), Playwright reuses it (e.g. while `npm run dev` is running).

## GitHub Actions

No repository secrets are required. The workflow supplies its own `AUTH_SECRET` placeholder alongside dummy `AUTH_GOOGLE_*` values and `DATABASE_URL=file:./prisma/ci.db` for a clean SQLite file on the runner.

`AUTH_SECRET` has to be *present*, not real: the e2e server runs as production, where `auth.ts` deliberately withholds its development fallback, and NextAuth throws `MissingSecret` without one — `/api/auth/session` then answers 500. No test signs in, so the placeholder never needs to be a working key. Setting a real `AUTH_SECRET` repository secret still takes precedence if you want CI to match production.
