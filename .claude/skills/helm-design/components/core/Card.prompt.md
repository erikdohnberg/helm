The surface everything in Helm sits on, plus the two type components that give it the voice of a record.

```jsx
<Card state="anchored" elevation="e0">
  <Eyebrow>FY26 Q1</Eyebrow>
  <RecordTitle>Two named design partners live on the co-sell motion</RecordTitle>
</Card>
```

`Card` is flat (`e0`) by default: charters, tables and timeline entries are part of the record and do not float. Raise to `e1` only when the card is an object you can pick up. The `state` prop is the whole status vocabulary — `anchored` (solid rule), `additive` (38% partial rule, which *is* the focus warning), `replaced` (dotted rule, 72% opacity), `attached` (no rule, indented), `drift` (brass rule).

`RecordTitle` is Source Serif 4; use `outcome` for charter titles, `page`/`heading`/`display` for headers. `Eyebrow` is the only uppercase in the system.
