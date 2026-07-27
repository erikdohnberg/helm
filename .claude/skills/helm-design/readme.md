# Helm Design System

**A considered record, not a dashboard.**

Helm is an AI team member responsible for strategic coherence. It listens where
strategy actually happens — meeting transcripts, Slack discussions, planning
conversations — turns those signals into **Outcome Charters**, helps leadership
anchor them before a quarter begins, and flags when the work stops matching the
plan. Helm sits one level above execution: not a task manager, sprint board,
roadmap tool or OKR platform.

Helm is opened by people who suspect they have lost the plot. The system gives
that moment a voice: navy ink on chart paper, instrument-drawn icons, and brass
reserved entirely for drift.

## Sources

- **GitHub — [github.com/erikdohnberg/helm](https://github.com/erikdohnberg/helm)** (branch `main`).
  - `public/design-system/index.html` — **the v2 specification.** This system is
    a direct port of it; when the two disagree, that file wins.
  - `app/(app)/**`, `app/(marketing)/**` — the shipping v1 product the spec replaces.
  - `app/globals.css`, `tailwind.config.ts` — the shadcn zinc block v2 supersedes.

> `public/scorecard.html` in that repo carries a **separate personal design
> system** (cream, orange, Sanchez/Raleway/Caveat). It is deliberately excluded
> here and will be restyled onto this system later.

---

## Load-bearing decisions

Ported verbatim from the specification. Everything else follows from these.

**What this must not look like.** The category has one look: dark gradient hero,
glassy translucent cards, one bright accent on near-black, geometric sans,
RAG-coloured metric tiles. Helm is deliberately the inverse — warm paper rather
than dark glass, printed serif rather than geometric sans, opaque bordered
surfaces rather than glow, and no traffic-light tile anywhere. If a screen could
be dropped into a competitor's demo reel unchanged, it is wrong.

**Status without colour.** A stroke vocabulary at the left edge — *solid /
partial / dotted / absent* — plus an instrument glyph: anchor, half-mast,
strike, shackle. **Brass is reserved entirely for drift.** Verdigris carries a
second, orthogonal axis: **observed by Helm** versus authored by a person. It
never carries state or severity, so it never competes with brass.

**Density is editorial.** 15px base, 1.6 line height, 48px rows, 28px card
padding, 72px between sections. A single *compact* variant exists for settings
tables and nothing else.

**One language, and the app takes the marketing side of it.** Navy is the ink,
chart-paper warm white is the ground, the compass rose is the product mark, the
icon set is drawn from instruments. Brass crosses over but is demoted from
decoration to signal; verdigris is added as the app's own voice.

**Neutral ramp.** Twelve steps, hue 245, chroma rising with darkness
(0.005 → 0.044) so every grey is navy-tinted. Surfaces sit warm (hue 85), which
is what stops the page reading sterile. Ad-hoc `#333`–`#999` are deleted;
`muted`/`secondary`/`accent` all collapse into `sunken`.

**Typeface.** System stack for UI. **Source Serif 4 does one job:** outcome
titles and page display, so a charter reads as a statement of record.

**Dark mode is designed, not inverted.** Borders are opaque ramp values (never
`white/10`), surfaces separate by lightness step, and elevation adds a 1px top
highlight because shadows do not read on dark ground.

---

## Content fundamentals

The register, in one line: **Helm speaks like a good chief of staff reading back
the minutes** — factual, unhurried, unimpressed by urgency, and unwilling to let
a decision go unnamed. Not a coach, not a colleague, not a robot, and never
relieved on your behalf.

1. **Name the decision, not the click.** *Record this decision*, *Anchor an
   outcome*, *Replace and record* — never *Save*, *Submit*, *OK*. If a label
   works in any product, it is wrong in this one.
2. **State the cost in the same breath.** Any action that displaces something
   says what it displaces, before it happens — never in a follow-up toast.
3. **Past tense for the record, present for the question.** *Replaced 21 Feb*;
   *What stops?* Never both moods in one sentence.
4. **No congratulation, no reassurance.** Nothing is *Great!*, *All set!* or
   *Don't worry*. The record does not have feelings about your quarter.
5. **No urgency the product does not feel.** No *Action required*, no *Urgent*,
   no countdowns, no exclamation marks. Drift is serious because of what it
   says, not how loudly.
6. **Never blame the person, never blame nobody.** Errors name the cause and the
   next move — not *Something went wrong*, not *You entered an invalid ID*.
7. **Say who noticed.** Anything Helm inferred is written in the observing voice
   and set in verdigris — *Observed 3 days ago across 2 sources*. Helm never
   says *we*, and never claims a person's conclusion as its own.
8. **One sentence, then stop.** A second sentence earns its place by adding a
   fact.

**The six verbs** are the product model and are never swapped for synonyms:
**Anchor** (make official for a quarter) · **Attach** (join work to an outcome,
adding nothing) · **Replace** (trade one anchored outcome for another) ·
**Add** (enter alongside — nothing stops) · **Retire** (end without a successor)
· **Record** (write a decision and its reasoning down).

**Banned outright:** Oops · Great! · Action required · On track · At risk ·
Health · Score · Sync · Just/simply · Let's · emoji · exclamation marks.
*On track / at risk / health / score* are banned for the same reason bright
status colours are: they convert a judgement into a label nobody made.

**Mechanics.** Sentence case everywhere except the 11px eyebrow, the only
uppercase in the system. Dates are `21 Feb` — day, short month, no year within
the current fiscal year. Numerals from one upward in data; words up to nine in
prose.

**Message library** (copy verbatim): *Anchored 21 Feb. Three outcomes now stand
in FY26 Q1.* · *Attached to Co-sell motion. Nothing entered the quarter.* ·
*Work started 21 Feb contradicts what this quarter anchored on 14 Jan.* · *Four
engineers have been on unentered work for three days. What stops?* · *A quarter
with no anchored outcome has no direction to drift from.* · *Nothing
contradicts this quarter. Last checked four minutes ago.* · *No user found for
U9. Slack IDs start with U and are 9 to 11 characters.* · *Not recorded — the
connection dropped. Your text is still here; try again.* · *Retiring removes
this outcome from the record. Replacing keeps it.* · *Reading the record…*

---

## Visual foundations

**Colour.** A twelve-step navy ink ramp at hue 245 on warm chart-paper surfaces
at hue 85, plus three named hues on two unrelated axes. Nothing else exists.
Adding a fifth hue silently breaks brass — a feature that feels like it needs
one needs a different structure: weight, rule, position or space.

| Hue | Job |
| --- | --- |
| Navy `oklch(0.235 0.044 245)` | Ink, structure, primary action, dark ground |
| Verdigris `oklch(0.505 0.070 195)` | Attribution — observed by Helm, never authored. Always with the 7px hollow ring |
| Brass `oklch(0.615 0.100 68)` | Drift, and nothing else |
| Red `oklch(0.520 0.140 25)` | Irreversible destruction only. Not "error", not "bad" |

Brass sits at chroma 0.07–0.10, below the "bright status colour" threshold, and
its meaning comes from scarcity: if you see brass in Helm, something you already
decided is being contradicted. One brass band per page — a second one spends the
scarcity.

**Type.** Source Serif 4 for the record (display 300/0.98/−0.033em, heading
300/1.04, page title 400/1.2, outcome title 500/1.3); the system sans stack for
the machinery (15px body at 1.6, 14px controls, 13.5px help, 11px eyebrow at
0.14em uppercase); mono for identifiers and dates in the rail. The two families
never mix inside one sentence.

**Space.** 4px base. Editorial density is the default and the only one used on
charter, drift and record surfaces: 48px rows, 28px card padding, 20px field
gaps, 72px between sections, 40px controls. Compact (40 / 18 / 14 / 40 / 34) is
permitted for settings tables alone. Prose wraps at 68ch, help text at 60ch, the
page caps at 1080px, and record surfaces carry a 104px margin rail with a 2rem
content indent.

**Corners.** 2px on the log/record surface, 4px on nested surfaces, 8px
(`--radius`) in the app, full for pills. The log surface is squarer than the app
on purpose — it is printed matter, not chrome.

**Cards.** Bordered, opaque, flat by default. Nothing in the record floats.
Elevation has four levels with one meaning each, and a surface may not borrow
another level's shadow for emphasis: **e0** part of the record (border only) ·
**e1** actionable object · **e2** transient and dismissible · **e3** requires a
decision (dialogs only, always with a scrim).

**Borders & rules.** Hairlines at `--border`; `--rule-open` (2px navy) opens a
block, `--rule-row` (1px) separates its rows. The active nav item is a 2px ink
underline, never a fill. The masthead carries a 2px brass keel line — the one
structural use of brass in the system.

**Imagery & background.** No photography, no illustration, no gradient as
decoration. The only mark is the logo: a ship's wheel that is also a target —
who is steering, and what they said they were steering toward. The icon set is
drawn on the same concentric grid.

**Motion.** Four durations, two curves, no bounce and no scale beyond 1.01:
instant (focus ring — never animated), quick 120ms `ease-out` (hover, press,
tint — colour only, never geometry), considered 220ms `cubic-bezier(.2,0,0,1)`
(popovers, dialogs — fade plus 4px), deliberate 400ms (drift arrival and
replacement collapse, slow enough that the change is witnessed). Reduced motion
collapses all four to 1ms, including the drift flag.

**Hover / press.** Colour shifts only. Primary darkens to `--ink-800`, outline
and ghost take the sunken fill, links darken their underline. Nothing lifts,
scales or glows.

**Transparency & blur.** None. No glass, no backdrop filters. Transparency
appears only in the modal scrim and in the masthead's single `white/14` rail
divider. Dark mode borders are opaque ramp values precisely to avoid it.

**Focus.** A 2px verdigris ring at 2px offset, so it reads on white, on sunken
and on navy alike. Never removed. 44×44px minimum hit area, achieved with
padding — glyphs stay 20px. Body contrast ≥ 7:1, secondary ≥ 4.6:1, non-text
≥ 3:1 in both modes. Colour never carries meaning alone: the drift flag stays
legible in greyscale through its rule weight, its diamond and its sentence.

---

## Iconography

**The instrument set** — drawn from chart and instrument marking rather than
generic UI: 1.5px stroke, round caps, 24px grid, `currentColor`, never filled.
There is no icon font, no sprite sheet, no PNG icons, no Lucide, no emoji, and
no unicode glyphs used as icons. (An em dash for a missing value is text, not an
icon.)

Six glyphs carry product meaning and may not be used decoratively:

| Glyph | Meaning |
| --- | --- |
| `anchor` | Anchored outcome — the official direction of the quarter |
| `helm-mark` | The product mark. Mastheads, quarter headers, empty grounds. Never inline in text |
| `bearing-off` | Drift. The only glyph permitted to carry brass |
| `shackle` | Attached work — joined to an outcome, adds no commitment |
| `sounding` | Progress against a target. Depth, not a score |
| `beacon` | Replacement — what now stands where something else stood |

The rest are utility glyphs drawn to the same hand: `half-mast`, `provenance`
(mandatory on every link that leaves Helm), `heading`, `logged`, `watch`,
`search`, `close`, `chevron`, `more-vertical`. All ship both as the `Icon`
component and as standalone files in `assets/icons/`.

**Logo.** `assets/helm-logo.svg` — single path group, `currentColor`, 96px grid,
no fills. Black on paper, reversed on navy, mark at cap height with a 0.4em gap
in the lockup. Minimum 20px: below that the target ring closes, so use the
wordmark alone. Verdigris is permitted; brass only on a drift surface.
`assets/helm-logo-black.png` / `-white.png` are the shipping v1 marketing marks,
kept for reference. Never redraw or recolour either.

---

## Index

| Path | What |
| --- | --- |
| `styles.css` | Entry point — imports every token file |
| `tokens/colors.css` | Ink ramp, named hues, semantic aliases, dark mode |
| `tokens/typography.css` | Serif / sans / mono, the scale, tracking |
| `tokens/spacing.css` | Density, radii, measure, rail, elevation |
| `tokens/motion.css` | Durations, curves, reduced-motion collapse |
| `tokens/state.css` | `.state-*` left-rule utilities and `.observed` |
| `assets/` | `helm-logo.svg`, the v1 marketing PNGs, `icons/` |
| `guidelines/*.card.html` | Foundation specimens (Brand, Colors, State, Type, Space, Motion) |
| `components/` | Reusable UI primitives, grouped by concern |
| `ui_kits/app/` | The Helm application, click-through |
| `SKILL.md` | Agent-skill entry point |
| `github.md` | Source repository and sync record |

### Components

- **core** — `Button`, `IconButton`, `Card`, `Eyebrow`, `RecordTitle`, `Chip`, `Observed`, `Icon`
- **forms** — `Field`: `Label`, `Help`, `Input`, `Textarea`, `Select`, `RadioOption`, `InlineEdit`
- **feedback** — `Modal`, `Toast`, `ToastViewport`, `Alert`
- **navigation** — `TopNav`, `Tabs`, `Breadcrumb`, `Pagination`
- **outcomes** — `OutcomeCard`, `OutcomeLink`, `DriftFlag`
- **data** — `Table`, `Avatar`, `AvatarStack`, `Kbd`, `Skeleton`, `EmptyState`

Each directory holds `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md` and one
`@dsCard` HTML showing its states.

### Extending the system

- **No new hues.** Navy, verdigris, brass, one red.
- **Verdigris is attribution only** — never a state, never a severity, always
  with the hollow ring.
- **Brass means drift.** Any other use spends the scarcity that makes it work.
- Showing how something changed → the outcome timeline: mono date column,
  glyph column, prose column, observed entries in verdigris.
- Status of a new kind → extend the stroke vocabulary and add a glyph, not a
  colour.

### Known gaps

- **Source Serif 4 loads from Google Fonts.** No variable font file ships with
  this system; drop `source-serif-4.woff2` into `assets/fonts/` and add the
  `@font-face` if you need it self-hosted.
- **No marketing UI kit.** The shipping marketing site is still on the v1
  navy/brass language, which contradicts brass-means-drift. It should be
  restyled onto this system rather than recreated as-is.
- The specification's log/board-pack layout (§12) and the full compositions
  gallery (§11) are represented by the app kit and the specimen cards, not
  reproduced page for page.
