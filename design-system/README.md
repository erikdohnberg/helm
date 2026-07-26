# Design system handoff kit

A snapshot of Helm's existing UI, rendered as self-contained preview pages for
[Claude Design](https://claude.ai/design). This directory is an **input to a
design pass**, not a component library — nothing here is imported by the app.

## What this is

Helm has a complete design token layer and almost no components. `components/ui/`
contains three files (`card`, `chip`, `toast`); everything else — buttons,
inputs, dialogs, tables, navigation — exists only as inline Tailwind classes
scattered across pages.

So there was nothing to hand over "as is". These previews reconstruct each
component concept from the class strings actually in use, **including the
drift**: where the same concept is spelled six different ways, all six are
shown and labelled. Resolving them is the design decision, and this kit
deliberately doesn't pre-empt it.

Annotations are marked `NOTE`, `DRIFT`, `CONFLICT`, or `OPEN QUESTION` and are
styled as dashed-rule monospace blocks. **That chrome is commentary, not part of
the system** — it should not survive into the enhanced output.

## Cards

| Group | File | Covers |
| --- | --- | --- |
| Foundations | `previews/foundations/color.html` | Semantic tokens light + dark, marketing palette, untokenised greys, orphaned chart/sidebar tokens |
| Foundations | `previews/foundations/type.html` | Scale by real usage, recurring roles, marketing display type |
| Foundations | `previews/foundations/shape.html` | Radius tiers, elevation, spacing rhythm |
| Foundations | `previews/foundations/principles.html` | The UX tone rules from `lib/design/README.md`, and where they bite |
| Components | `previews/components/button.html` | All 21 button spellings across 5 roles, plus the missing focus state |
| Components | `previews/components/field.html` | Label/control/help/error stack, 5 input variants, checkbox, radio, select |
| Components | `previews/components/card.html` | `Card` as built, plus 4 hand-rolled surface treatments |
| Components | `previews/components/chip.html` | `Chip`, the inline Admin badge, and the unencoded status states |
| Components | `previews/components/dialog.html` | The 5 inline modals, panel widths, behaviour gaps |
| Components | `previews/components/toast.html` | `Toast` as built; success and failure are indistinguishable |
| Components | `previews/components/table.html` | The team roster table and its bare empty state |
| Navigation | `previews/components/navigation.html` | Top nav and settings tabs — two unrelated active treatments |
| Product surfaces | `previews/product/record-of-intent.html` | The `/demo` payoff screen and the drift flag |
| Marketing | `previews/marketing/landing.html` | Hero, brass CTAs, feature carousel, on-navy waitlist form |

Each file's first line is a `<!-- @dsCard group="…" -->` marker; the Design
System pane builds its card index from it. Groups are prefixed `Helm · ` so
these cards stay visually separate from any other design system's cards.

## Build

```
node design-system/build.mjs
```

Runs the app's own Tailwind theme (`tailwind.config.ts`, via
`tailwind.preview.config.ts`) over `previews/` with `app/globals.css` as input,
then inlines the compiled CSS into each page and writes the result to
`dist/helm-design-system/`. Previews therefore inherit the real token layer
rather than a copy of it — if a preview looks wrong, the markup is wrong, not
the theme.

`dist/` is generated and gitignored. Rebuild before syncing.

## Syncing to Claude Design

This bundle is meant to become **its own new design-system project**. It is not
an update to any existing one.

`DesignSync` cannot authorise from Claude Code on the web — `/design-login`
needs an interactive terminal. **Run this from Claude Code in a local terminal:**

```
git pull && node design-system/build.mjs
/design-login
/design-sync design-system/dist
```

When it asks which project to target, choose **create a new project** — do not
select an existing one. Name it something unambiguous, e.g. `Helm — app UI`.

### Two safeguards against touching another project

1. **Namespaced paths.** Every file is emitted under a single
   `helm-design-system/` directory. Uploads are written by path, so a bundle
   whose paths are all namespaced can only *add* a folder — it has no path in
   common with an existing project's files and therefore cannot overwrite one.
   `build.mjs` enforces this; don't flatten it away.

2. **The plan is shown before anything is written.** `DesignSync` locks the
   exact write list via `finalize_plan` and displays it independently of
   whatever the assistant says it is doing. **Check two things before
   approving:** the target project is the newly created one, and every path in
   the list begins with `helm-design-system/`. If either is not true, reject the
   plan.

## Known scope

Derived from the UI surface only: `app/(app)`, `app/(marketing)`, `app/demo`,
`components/`, `app/globals.css`, `tailwind.config.ts`. The `model/` directory
is a separate npm package (the drift detection pipeline) with no UI, and is
excluded.

Counts in the annotations were taken at the commit that added this directory.
They will drift as the app changes; they're there to show relative weight, not
as a live metric.

## After the design pass

The enhanced previews come back as HTML. The React extraction — building
`components/ui/button.tsx` and friends with `class-variance-authority` (already
a dependency, currently unused) and migrating the ~39 button and ~12 form-control
call sites — should happen **after** that, so it lands on the final values
rather than being redone. That step is also where `focus-visible` gets added;
there are currently zero occurrences in the codebase.
