# Helm

**Keep strategy on course.**

Helm is an AI team member that keeps quarterly outcomes aligned — listening to the conversations where strategy happens, turning signals into outcome charters, and nudging teams when strategic drift begins.

---

## The problem

Strategy rarely fails during planning. It drifts during execution.

- **Direction drifts quietly** — New priorities appear without deliberate comparison to the original plan.
- **Trade-offs disappear** — Teams rarely record what stopped in order to pursue something new.
- **Decisions lose context** — By the time direction reaches teams, the reasoning behind it is gone.

---

## What Helm is

Helm is a team member responsible for strategic coherence.

Helm listens where strategy actually happens — in meetings, Slack discussions, and planning conversations. It turns those signals into draft **Outcome Charters**, helps leadership align before the quarter begins, and keeps teams connected to those outcomes as the quarter unfolds. When alignment fades, Helm nudges the team to reconnect.

### How Helm works

1. **Helm listens where strategy happens** — Meeting transcripts, strategy discussions, and Slack conversations feed into Helm.
2. **Helm turns signals into draft outcomes** — Related signals cluster into draft Outcome Charters.
3. **Helm prepares alignment before the quarter** — Leadership reviews and anchors outcomes before the quarter begins.
4. **Helm creates shared alignment threads** — Each outcome has a shared Slack thread with full context.
5. **Helm notices when alignment fades** — Helm detects inactivity and nudges the team to reconnect.
6. **Helm preserves strategic memory** — When priorities shift, Helm records what replaced what.

---

## Outcome Charters

Helm centers quarterly planning around **Outcome Charters**. Each charter captures:

- the outcome being pursued  
- the metric that defines success  
- the reasoning behind the decision  
- the trade-offs required to pursue it  

Once aligned, outcomes become **Anchored** to the quarter. If an outcome is removed or loses momentum, Helm marks it **Adrift**, preserving visibility into how strategy evolves.

---

## What Helm is not

Helm is not a task manager, sprint planning tool, roadmap manager, or OKR platform. Helm sits **one level above execution**, ensuring the organization stays aligned on **which outcomes matter this quarter and why**.

---

## Status

Helm is currently in private prototype. The codebase is source-available so others can explore the ideas and learn from the implementation.

---

## Setup

### Prerequisites

- Node.js 18+ (or 20+)
- npm

### Install

```bash
git clone <repository-url> helm
cd helm
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in values as needed. Environment variables are optional for running the dev server.

```bash
cp .env.example .env.local
```

**Database (Prisma)** — After pulling schema changes, apply migrations to the **same** SQLite file as `DATABASE_URL` in `.env.local` (default `file:./dev.db`). The Prisma CLI loads `.env` by default, not `.env.local`, so either duplicate `DATABASE_URL` into `.env` or run:

```bash
DATABASE_URL="file:./dev.db" npx prisma migrate deploy
```

If the app throws **`The column … does not exist in the current database`**, that file is missing migrations (or you migrated a different path than Next.js uses).

**Google sign-in and Google Drive (Outcome Charters)**

- In [Google Cloud Console](https://console.cloud.google.com/), use the same OAuth client as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
- Enable **Google Drive API** and **Google Docs API** for the project.
- On the OAuth consent screen, add the scopes for Drive file access and Google Docs that Helm requests when an **organization owner** clicks **Connect Google Drive** in **Settings → Integrations** (incremental consent after sign-in).
- The first Helm sign-in uses only basic profile scopes; Drive/Docs access is granted in that second step.
- For **Choose charter folder**, enable the [**Google Picker API**](https://console.cloud.google.com/apis/library/picker.googleapis.com) in the **same** GCP project as `AUTH_GOOGLE_ID`, create an **API key** (type: **Browser key** / application restrictions **HTTP referrers**), restrict APIs to **Google Picker API** (or leave unrestricted only while testing), and set `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` in `.env.local`. Under **Website restrictions**, add every origin you actually use, e.g. `http://localhost:3000/*` **and** `http://127.0.0.1:3000/*` — opening the app via `127.0.0.1` while the key only allows `localhost` produces **“The API developer key is invalid.”** After changing `.env.local`, restart `npm run dev` so Next.js picks up `NEXT_PUBLIC_*` values. Helm passes **Picker `setAppId`** using your project number from `AUTH_GOOGLE_ID` (required by Google alongside the API key).
- If you set `AUTH_URL` / `NEXTAUTH_URL`, use the real site origin only (e.g. `http://localhost:3000` or `http://127.0.0.1:3000`). Do **not** append `/*` or other wildcards — that becomes a URL path `/%2A`, produces **`GET /%2A 404`** in the dev terminal, and breaks NextAuth session fetch (`ClientFetchError: Failed to fetch`).
- If the dev log shows a **cross-origin** warning for **`127.0.0.1`** and `/_next/*`, Helm’s `next.config` lists **`127.0.0.1`** in **`allowedDevOrigins`** so those requests are allowed; restart the dev server after pulling that change. If you use another hostname (e.g. a LAN IP), add that hostname to the same array or dev assets may return **403**.

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

New organizations complete **organization name**, **team you lead** (each member), **fiscal calendar** (first month of the next quarter and which fiscal quarter Q1–Q4 that is — Helm infers fiscal year start), then optional **team invites** on `/onboarding/org-setup` before using Quarter and Outcomes without Demo Mode.

`npm run dev` uses **Turbopack** (`next dev --turbo`) for faster incremental builds. If you hit tooling issues, use **`npm run dev:webpack`** (classic Webpack dev server).

**If Turbopack logs errors about `fonts.gstatic.com`, `@vercel/turbopack-next/internal/font/google/font`, or `POST … 500` on app routes**

- Helm uses a **system font stack** (no `next/font/google` download) so dev works offline and avoids that Turbopack path. If you still see font-related build errors, try `npm run dev:webpack` or `rm -rf .next && npm run dev`.

**If you see `ChunkLoadError` / “Loading chunk app/layout failed (timeout)” in dev**

- Stop the server, delete the build cache, and start again: `rm -rf .next && npm run dev`
- Hard-refresh the browser (or disable cache in DevTools) so the client is not requesting stale `/_next/static/chunks/…` files.
- Projects on **iCloud Drive / network-synced folders** can compile slowly; moving the repo to a local disk often fixes intermittent chunk timeouts.

If `npm install` fails (for example due to certificate or network issues), run it locally in the project directory and ensure Node.js 18+ and npm are available.

If you see **`Google token refresh`** / **`could not reach Google`** when using Drive from Settings, Node cannot reach `oauth2.googleapis.com` (VPN, firewall, or broken IPv6 DNS is common). Stop the server and run **`npm run dev:ipv4`** (or **`npm run dev:webpack:ipv4`**) instead of `npm run dev`, or fix network access to Google.

### Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Dev server (Turbopack)   |
| `npm run dev:webpack` | Dev server (Webpack) |
| `npm run build` | Build for production     |
| `npm run lint`  | Run ESLint               |
| `npm run format`| Format with Prettier      |
| `npm run typecheck` | Run TypeScript check  |

---

## License

Helm is source-available. The code is published publicly so others can explore the ideas behind the product and learn from the implementation. Commercial use of this codebase or derivative works is not permitted without explicit permission.

See the `LICENSE` file for details.
