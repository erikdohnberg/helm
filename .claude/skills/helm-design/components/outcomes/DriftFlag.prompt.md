Drift — the reserved exception, and the only component allowed to use brass.

```jsx
<DriftFlag
  level="halt"
  statement="Work started 21 Feb contradicts what this quarter anchored on 14 Jan."
  observed="Four engineers have been on unentered work for three days."
  question="What stops?"
  actions={<><Button>Record this decision</Button><Button variant="outline">Attach to an outcome</Button></>}
/>
```

Severity is rule weight plus the verb: `notice` (hairline — something moved), `contradiction` (3px rule — new work collides with the record), `halt` (3px rule, wash band, and the "What stops?" question). Never a second hue, never a dot, never a score.

The flag must stay fully legible in greyscale: the brass rule, the diamond, the bearing-off glyph and the sentence each carry the meaning independently. Keep `observed` separate from `statement` — Helm's evidence never merges into an authored sentence.
