# Helm  
**Keep strategy on course.**

Helm is a lightweight alignment layer that helps organizations maintain clear quarterly direction.

Most companies don't struggle to create plans — they struggle to keep those plans coherent as the quarter unfolds. Priorities shift quietly, trade-offs remain implicit, and the reasoning behind decisions disappears.

Helm keeps strategy on course by turning signals, discussions, and leadership decisions into structured **Outcome Charters** that anchor what the organization is steering toward.

---

## The Idea

Helm centers quarterly planning around a single artifact: the **Outcome Charter**.

Each charter captures:

- the outcome being pursued  
- the metric that defines success  
- the reasoning behind the decision  
- the trade-offs required to pursue it  

Once aligned, outcomes become **Anchored** to the quarter and appear on the Quarter Overview — a shared briefing of the organization's strategic direction.

If an outcome is removed or loses momentum, Helm marks it **Adrift**, preserving visibility into how strategy evolves over time.

---

## What Helm Does

Helm acts as an orchestration layer across tools teams already use.

It connects signals from discussions, meetings, and leadership input to outcome charters and alignment conversations.

### Core capabilities (V1)

**Quarter Overview**  
A narrative briefing of the current quarter showing anchored outcomes and those that are no longer prioritized.

**Outcome Workspace**  
A working surface for drafting and aligning outcomes across upcoming quarters.

**Alignment Monitoring**  
Helm tracks whether outcomes are receiving cross-functional input and surfaces when alignment may be needed.

**Institutional Memory**  
Helm preserves how priorities evolve across quarters, including what replaced previous outcomes.

---

## Integrations

Helm works alongside existing productivity tools rather than replacing them.

**Google Docs**  
Outcome charters live as shared Google Docs. Helm creates and organizes them by quarter.

**Slack**  
Outcome activity and alignment discussions appear in a shared channel (for example `#helm-quarterly`) with threaded updates.

**Meeting transcripts**  
Recordings and transcripts can be linked to outcome charters to preserve the reasoning behind decisions.

---

## What Helm Is Not

Helm is not:

- a task manager  
- a sprint planning tool  
- a roadmap manager  
- an OKR platform  

Helm sits **one level above execution**, ensuring the organization remains aligned on **which outcomes matter this quarter and why**.

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

| Script       | Description              |
| ------------ | ------------------------ |
| `npm run dev`      | Start development server  |
| `npm run build`    | Build for production     |
| `npm run lint`     | Run ESLint               |
| `npm run format`   | Format with Prettier      |
| `npm run typecheck`| Run TypeScript check     |

---

## License

Helm is source-available.

The code is published publicly so others can explore the ideas behind the product and learn from the implementation.  
Commercial use of this codebase or derivative works is not permitted without explicit permission.

See the `LICENSE` file for details.
