# UI kit — Helm application

A click-through recreation of the signed-in product on the v2 system: navy ink
on chart paper, status carried by the left rule, brass only on drift.

| File | Screen |
| --- | --- |
| `index.html` | Masthead, 104px rail, the drift dialog, toasts |
| `QuarterScreen.jsx` | The quarter as recorded — drift flag, anchored charters, attached work, traded away |
| `OutcomeScreen.jsx` | A single charter — tabs for Charter / Timeline / Attachments |
| `SettingsScreen.jsx` | Team table (compact density), integrations, defaults |
| `data.js` | Sample charters, timeline and attachments |

**What works:** switching sections, opening the drift dialog and recording a
decision (which moves the co-sell outcome to *replaced* with its reasoning
intact), dismissing drift, tabs on the outcome screen, and toasts.

Source: `app/(app)/**` in [erikdohnberg/helm](https://github.com/erikdohnberg/helm),
restyled onto `public/design-system/index.html` (the v2 specification).
