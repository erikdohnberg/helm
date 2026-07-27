# Design

Helm's design system, as it is actually implemented here. The full
specification lives in `.claude/skills/helm-design/` and is rendered at
[`/design-system`](../../public/design-system/index.html). This file is the
working version: what to reach for, and what not to add.

---

## Helm product rules

1. Helm is a strategic alignment layer, not a task manager, sprint planner,
   roadmap tool, or OKR platform.
2. The core artifact in Helm is the Outcome Charter.
3. Anchored outcomes represent the official direction of a quarter.
4. New priorities must not enter the system silently.
5. Every new outcome must declare how it enters the quarter:
   - Attach to an existing outcome
   - Replace an anchored outcome
   - Add as a new outcome with a focus warning
6. Helm should surface the question: "What stops?"
7. Replacement relationships must be visible.
8. Helm preserves institutional memory of outcome evolution.

---

## Step one — name the surface

Every screen is one of two. The surface decides most of the design before you
make a single choice. If you cannot say which one you are on, you are not ready
to draw.

|           | App surface                                              | Log surface                                          |
| --------- | -------------------------------------------------------- | ---------------------------------------------------- |
| Used for  | Settings, tables, dialogs, editing                       | Charter, record of intent, marketing, print          |
| Container | Bordered card, 8px radius, `e0`–`e1`                     | Ruled block — 2px rule opens it, hairlines divide it |
| Radius    | `rounded-lg` controls, `rounded-card` cards              | `rounded-log` — 2px, buttons included                |
| Headings  | `text-section`, serif `text-outcome` / `text-page-title` | Serif 300: `text-heading`, `text-display`            |
| Body      | `text-body` (15px sans)                                  | 16px sans, or `text-lede` serif                      |
| Rail      | None                                                     | 104px ruled rail with mono entry numbers             |
| Density   | Editorial; compact for settings tables only              | Editorial only                                       |

`app/(app)/**` and `/demo` are app surfaces. `app/(marketing)/**` is a log
surface — wrap it in `<LogPage>` from `components/log/log.tsx`.

`public/scorecard.html` is also a log surface, but a standalone one: it inlines
a subset of the tokens rather than importing them, so it never fights the app's
Tailwind layer. If you change a token, change its block too.

---

## Where things live

| You need                              | Reach for                                    |
| ------------------------------------- | -------------------------------------------- |
| Colour, type, space, motion, state    | `styles/design-system/tokens/*.css`          |
| Those tokens as class names           | `tailwind.config.ts`                         |
| Buttons, fields, cards, chips, tables | `components/ui/*`                            |
| Outcome charter, drift flag, timeline | `components/outcomes/*`                      |
| Rail, ruled rows, soundings, brass    | `components/log/log.tsx`                     |
| The 15 instrument glyphs              | `components/ui/icon.tsx` — no other icon set |
| Mapping Helm's data onto the 5 states | `lib/design/outcome-state.ts`                |

Never write a raw hex or a raw `px` colour. If a value is not in the token
layer, it does not exist in Helm.

---

## The eight rules that do not bend

1. **No new hues.** Navy, verdigris, brass, one red. A feature that feels like
   it needs a fifth colour needs a different structure — weight, rule, position
   or space. Adding a hue silently breaks brass.
2. **Brass is drift, only.** Never a highlight, never a brand flourish, never a
   hover. One full-bleed brass band per log page, maximum. The masthead keel
   line is the single structural exception, and it is already built.
3. **Verdigris is attribution, only.** Observed by Helm, never authored by a
   person, never a state or a severity. Always paired with the 7px hollow ring
   — use `<Observed>` rather than `text-sea` by hand.
4. **No new states.** Anchored, additive, replaced, attached, plus drift. If a
   feature seems to need a sixth, it is almost certainly one of these five seen
   from a new angle — say which, in the PR.
5. **State lives at the edge.** The left rule plus its glyph. Never a coloured
   chip, never a badge in the content column, never a dot in a table cell.
6. **Elevation states intent.** `e0` record, `e1` actionable, `e2` transient,
   `e3` requires a decision. Never borrow a level for emphasis. If it can be
   ignored it is an `Alert`, not a `Modal`.
7. **Copy passes the voice rules.** Name the decision not the click; state the
   cost in the same breath; no congratulation; no manufactured urgency.
8. **Focus and targets are not optional.** The two-part ring is applied
   globally in `styles/design-system/base.css`, and `IconButton` is already
   44×44. Do not undo either.

---

## Voice

Helm speaks like a good chief of staff reading back the minutes: factual,
unhurried, unimpressed by urgency, and unwilling to let a decision go unnamed.

**Six load-bearing verbs**, never swapped for synonyms: **Anchor** (make
official for a quarter), **Attach** (join work to an outcome, adding nothing),
**Replace** (trade one anchored outcome for another), **Add** (enter alongside
— nothing stops), **Retire** (end without a successor), **Record** (write a
decision and its reasoning down).

**Banned outright** — each contradicts something the product claims to
believe: `Oops`, `Great!`, `Action required`, `On track`, `At risk`, `Health`,
`Score`, `Sync`, `Just` / `simply`, `Let's`, emoji, exclamation marks.

| Not this                               | This                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| Are you sure you want to replace this? | What stops if this enters?                                                   |
| Save changes                           | Record this decision                                                         |
| Success! Your outcome was added 🎉     | Anchored 21 Feb. Self-serve billing now stands where co-sell partners stood. |
| Oops! Something went wrong.            | No user found for U9. Slack IDs start with U and are 9 to 11 characters.     |
| 3 items need your attention            | One contradiction is unresolved since 18 Feb.                                |
| This action cannot be undone.          | Retiring removes this outcome from the record. Replacing keeps it.           |

Sentence case everywhere except the 11px eyebrow labels, which are the only
uppercase in the system. Dates are `21 Feb` — day, short month, no year within
the current fiscal year.

The full message library is in `.claude/skills/helm-design/readme.md`. Check it
before writing anything new.

---

## UX tone

- calm
- editorial
- minimal
- generous spacing
- no dashboard density
- no bright status colours
- no gamified scoring
- muted chips only
- external links show the provenance glyph (`<ExternalLink>` does this)

---

## When the system genuinely lacks something

- **One feature needs it** — build it locally from tokens. Do not add it to the
  system. Most one-off patterns die with their feature.
- **Two features need it** — it is a component. Add it to
  `.claude/skills/helm-design/`, with a specimen and one line saying what it is
  for, and delete the two local copies.
- **It contradicts a rule above** — then the rule changes, in writing, with the
  reason. Silent exceptions are how the previous system ended up with three
  identical greys and amber status text.
- **You are unsure** — ship the ugly version that obeys the rules over the
  pretty version that quietly breaks one.

---

## Before it ships

- [ ] The surface is named, and every choice follows it
- [ ] No colour appears that is not navy, verdigris, brass or the one red
- [ ] Every state reads correctly in greyscale
- [ ] Every observed value carries the hollow ring
- [ ] Every string passes the voice rules and the banned list
- [ ] Focus rings and 44px targets exist on every control
- [ ] Dark mode is designed, not inverted — borders are opaque
- [ ] Longest realistic content does not break the layout
- [ ] Empty, loading and error states are drawn, not assumed
- [ ] Reduced motion collapses everything to opacity

`npm run lint` enforces the mechanical half of this — raw hex, non-instrument
icon sets, and the banned vocabulary. The rest is a reading.

---

## A note on `cn()`

`lib/utils.ts` extends `tailwind-merge` with the system's named type scale.
Without that, `cn("text-heading text-foreground")` silently drops the size,
because tailwind-merge reads any unknown `text-*` as a colour. **Add a
`fontSize`, `boxShadow` or `borderRadius` key to `tailwind.config.ts` and you
must add it there too.**
