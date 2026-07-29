repo: erikdohnberg/helm
branch: main
path: public/design-system

## Where this copy lives

This directory is the Claude Design project `Helm · design system v2`, checked
into the repo at `.claude/skills/helm-design/` so the system travels with the
code and is readable without design-system authorization.

**It is now implemented, not just specified.** Before changing anything here,
read the "In this repository" table in `SKILL.md` — the shipped tokens and
components are the working copy, and this directory is the reference they were
built from. Change both together, or they drift.

## Last sync

date: 2026-07-27T01:46:42Z
commit: 6b4788a4b7b9

### Updated in this project

- Rebuilt the whole system against `public/design-system/index.html`, the v2 specification.
- Replaced the shadcn zinc tokens with the navy ink ramp, chart-paper surfaces and the three named hues.
- Ported the left-rule state vocabulary, the drift severities and the observed/authored attribution axis.
- Imported `helm-logo.svg` and extracted the 15-glyph instrument icon set into `assets/icons/`.
- Removed the personal editorial system that came from `public/scorecard.html`.

## Screen map

| Project screen | Repo files |
| --- | --- |
| `tokens/*.css` | `styles/design-system/tokens/*.css` (verbatim copies) |
| `styles.css` | `styles/design-system/index.css` — same manifest, reordered so dark-mode elevation wins |
| `components/core/*` | `components/ui/{button,card,chip,icon}.tsx` |
| `components/forms/*` | `components/ui/field.tsx` |
| `components/feedback/*` | `components/ui/{modal,toast}.tsx` |
| `components/navigation/*` | `components/ui/tabs.tsx`, `components/app-shell/top-nav.tsx` |
| `components/data/*` | `components/ui/table.tsx` |
| `components/outcomes/*` | `components/outcomes/{outcome-card,drift-flag}.tsx` |
| `guidelines/*.card.html` | `lib/design/README.md` (the working rules), `.eslintrc.json` (the mechanical half) |
| `ui_kits/app/**` | `app/(app)/**` and `app/demo/page.tsx` |
| the log layout (§12) | `components/log/log.tsx`, `app/(marketing)/**` |
| `assets/icons/*` | `components/ui/icon.tsx`, plus SVGs at `public/design-system/icons/` |
| `assets/helm-logo.svg` | `HelmMark` in `components/ui/icon.tsx`, `public/design-system/helm-logo.svg` |

The drift model scorecard was originally excluded — it was static HTML in
`public/` carrying a separate personal design system (Sanchez/Raleway/Caveat,
an orange accent, `ed-*` tokens). It is now `app/scorecard`, a route on this
system, redesigned upstream as **Helm Drift Eval Record** and rebuilt here
against the shipped components. It is the site's front door: `/` redirects to
it.

Two things about it are worth keeping:

- It composes `DriftFlag` for real. The flag on the page is a specimen of the
  product's own composition, not an illustration of one — so a change to the
  component shows up on the page that argues the model works.
- The left rule does double duty. Five of the six measures clear the crude
  baseline and carry the anchored rule; the sixth carries none. Status without
  colour, on a page of numbers.

## Divergences to carry back

Things the implementation had to decide that the project files do not cover:

- **Import order.** `:root` and `.dark` have equal specificity, so `colors.css`
  must be imported *after* `spacing.css` or the light `--e1`–`--e3` overwrite
  the dark ones. `styles.css` here has the opposite order.
- **Source Serif 4 is self-hosted.** The spec loads it from Google Fonts; the
  app ships latin and latin-ext, roman and italic, from `public/fonts/`.
- **`tailwind-merge` needs teaching.** The named type scale (`text-outcome`,
  `text-help`) reads as a text *colour* to tailwind-merge, which silently drops
  it. `lib/utils.ts` registers every custom `fontSize`, `boxShadow` and
  `borderRadius` key.
- **Helm has two axes, the system has one.** `entryMode` is the state and lives
  at the card edge; `status` is a fact about the charter and stays in the
  content column. The mapping is in `lib/design/outcome-state.ts`. No sixth
  state was invented.

## Sync history

- 2026-07-27T01:23:36Z — initial build from `main` before `public/design-system/` existed; superseded.
