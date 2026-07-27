---
name: helm-design
description: Use this skill when designing or building any Helm interface, screen, component or asset — production code, prototypes, mocks, slides or marketing pages. Contains the Helm design system v2: tokens, the left-rule state vocabulary, the observed/authored attribution axis, brass-is-drift hue discipline, type, icons, voice rules and UI kit components. Trigger on any front-end work in this repo, and on requests to design a Helm screen.
user-invocable: true
---

# Helm design system

Read `readme.md` in this skill first — it is the full specification. Then read
the guideline card that covers what you are about to build.

## In this repository

The system is already implemented. Do not re-derive it from the files here;
use what is shipped:

| You need | Use |
| --- | --- |
| Tokens | `styles/design-system/tokens/*.css`, imported by `app/globals.css` |
| Tailwind names for them | `tailwind.config.ts` — `text-outcome`, `shadow-e2`, `p-card`, `text-sea` |
| Primitives | `components/ui/*` — Button, Card, Chip, Field, Icon, Modal, Table, Tabs, Toast |
| Outcome charter & drift | `components/outcomes/*` |
| Marketing / long-form | `components/log/log.tsx` |
| The working rules | `lib/design/README.md` — read this before writing a screen |

`tokens/`, `guidelines/` and `components/` in this skill are the upstream
source of truth. If you change the implementation, change them too and note it
in `github.md`.

## The four rules you will get wrong first

1. **Brass is drift and nothing else.** Not a highlight, not a hover, not a
   brand flourish. One full-bleed brass band per log page, maximum. If brass
   appears, something already decided is being contradicted.
2. **Verdigris is attribution, only.** It marks what Helm *observed* rather
   than what a person *authored*, always with the 7px hollow ring. Never a
   state, never a severity.
3. **State lives at the card's left edge**, as a stroke plus an instrument
   glyph — never a coloured chip, never a badge in the content column, never a
   dot in a table cell. Chips carry facts.
4. **Copy names the decision, not the click.** `Record this decision`, not
   `Save`. Check the message library in `readme.md` before writing new copy,
   and check the banned list — `Oops`, `Great!`, `Action required`, `On track`,
   `At risk`, `Health`, `Score`, `Sync`, `Just`, `Let's`, emoji, exclamation
   marks.

## Before you draw

Name the surface. Every Helm screen is one of two, and the surface decides most
of the design before you make a single choice:

- **App surface** — working screens: settings, tables, dialogs, editing.
  Bordered cards, 8px radius, sans body at 15px, serif for outcome titles.
- **Log surface** — reading screens: charter, record of intent, marketing,
  print. A 104px ruled rail, 2px radius including buttons, serif 300 headings,
  hairline rows instead of cards.

If you cannot say which one you are on, you are not ready to draw.

## Prototypes and artifacts

For throwaway mocks, slides or static HTML: copy `assets/` out, inline
`tokens/*.css`, and build against those tokens directly. `ui_kits/app/` is a
click-through recreation of the signed-in product you can crib from.
