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

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If `npm install` fails (for example due to certificate or network issues), run it locally in the project directory and ensure Node.js 18+ and npm are available.

### Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server  |
| `npm run build` | Build for production     |
| `npm run lint`  | Run ESLint               |
| `npm run format`| Format with Prettier      |
| `npm run typecheck` | Run TypeScript check  |

---

## License

Helm is source-available. The code is published publicly so others can explore the ideas behind the product and learn from the implementation. Commercial use of this codebase or derivative works is not permitted without explicit permission.

See the `LICENSE` file for details.
