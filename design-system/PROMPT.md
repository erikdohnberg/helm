# Claude Design brief

Paste the block below into Claude Design with `helm-base.html` attached.

---

I'm building the design system for **Helm**. Attached is `helm-base.html` — a single page showing every UI element the product has today. Use it as the factual starting point, not as a standard to preserve. Most of it is unconsidered.

## What Helm is

A strategic alignment layer for product and leadership teams. Explicitly **not** a task manager, sprint planner, roadmap tool, or OKR platform.

The core artifact is the **Outcome Charter** — a quarter's official direction, with the reasoning and trade-offs attached to it. The differentiator is **drift detection**: when new work contradicts what the team already said it was doing, Helm surfaces the contradiction and asks *"What stops?"*

Rules that shape the interface:

- Anchored outcomes represent the official direction of a quarter.
- New priorities must never enter silently. Every new outcome must declare how it enters: **attach** to an existing outcome, **replace** an anchored one, or **add** with a focus warning.
- Replacement relationships stay visible — you can always see what was traded away.
- Helm preserves institutional memory of how outcomes evolved over time.

The emotional register matters. This is a tool people open when they suspect they've lost the plot. It should feel like a considered record, not a dashboard.

## Tone rules — treat as constraints, not preferences

```
calm · editorial · minimal · generous spacing
no dashboard density · no bright status colors
no gamified scoring · muted chips only
external links show an external-link icon
```

## Honest state of what's attached

- The **token layer is complete** — semantic CSS custom properties (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring) in oklch, light and dark. Inherited from shadcn's zinc preset and never revisited.
- **Only three real components exist** (card, chip, toast). Everything else in the page — buttons, inputs, dialogs, tables, navigation — was inline markup that I consolidated into one canonical version each. Where a component had been written six different ways, I picked the most common spelling. Those choices were arbitrary and are all open.
- **System font stack**, no custom typeface loaded.
- The marketing site runs a **separate visual language**: navy `#1B2A38`, brass `#C2A878`, editorial typography, a compass-rose motif, generous vertical rhythm. The app shares none of it.

## What I want from you

A more complete and materially better design system. Specifically:

**1. Solve the hard problem first — status without color.**

Helm has real state semantics that currently render identically: *anchored*, *replaced*, *additive*, *attached*, plus drift severity. "No bright status colors" and "no gamified scoring" rule out red/amber/green, severity dots, and score meters. The product's own demo screen already broke this rule out of desperation — it uses amber for the drift flag and emerald for "anchored", because muted-only had no answer.

Give it an answer. Weight, border, typography, iconography, position, spacing, and restrained hue are all available. I'd rather have a distinctive, quiet vocabulary than a conventional loud one. If you conclude a narrow color exception is genuinely necessary, define it precisely and justify it — don't just reach for a status palette.

**2. Resolve the open questions.**

- **Density.** The app sits at `text-sm` with tight table rows; the tone rules ask for generous spacing and no dashboard density. Pick a target and make the type and spacing scales express it.
- **One visual language or two?** Should the app absorb the marketing navy/brass and its editorial rhythm, or stay neutral with marketing as a separate skin? Make the call and show it.
- **Focus.** The app currently has no focus styles at all. Design the real treatment.
- **The neutral ramp.** There are ad-hoc greys (`#333`–`#999`) with no tokens, and three tokens (muted, secondary, accent) that share an identical value. Rationalise it.
- **Dark mode.** It works mechanically but was never designed — borders drop to 10% white and nearly vanish in tables, and overlays barely read. Treat it as a first-class mode.

**3. Expand the component set.**

Beyond what's attached: alert/banner, tooltip, dropdown menu, popover, avatar, breadcrumb, tabs (standalone), pagination, skeleton and loading states, inline editing, keyboard shortcut hints, and a proper icon treatment.

**4. Design the Helm-specific compositions** — these matter more than the primitives:

- **Outcome charter card** — title, metric, target, trade-offs, owners, provenance links
- **Drift flag** — the product's signature moment; must convey seriousness while staying calm
- **Entry-mode decision** — the "attach / replace / add" choice, which is where "What stops?" gets asked
- **Replacement relationship** — showing that outcome A displaced outcome B
- **Outcome timeline** — institutional memory of how a quarter's direction evolved
- **Record of intent** — the quarterly summary page these all live on

**5. Specify what a system needs and this lacks:** an elevation scale with stated intent, motion and transition rules, and an accessibility baseline (focus, contrast, target sizes).

## Constraints

- Must express as **CSS custom properties consumed by Tailwind utilities** — the target is Tailwind 3 with shadcn-style React components, so anything you design has to survive that translation.
- **Light and dark**, both designed.
- Keep the system font stack unless you can make a real case for a typeface.
- Don't invent a new brand. Navy and brass are real and in production on the marketing site; you can extend, restrain, or reinterpret them, but justify anything that discards them.

## Deliverable

Preview pages per component showing variants and states, plus a token specification concrete enough to implement directly. Where you make a judgment call, say what you decided and why in one line — I'll be porting this into React and need to know which choices are load-bearing.
