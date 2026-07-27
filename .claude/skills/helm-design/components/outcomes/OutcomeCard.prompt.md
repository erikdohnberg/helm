The Outcome Charter — the thing Helm exists to keep honest.

```jsx
<ul style={{display:'flex',flexDirection:'column',gap:16,padding:0,margin:0}}>
  <OutcomeCard
    state="anchored" quarter="FY26 Q1"
    title="Two named design partners live on the co-sell motion"
    facts={[
      { label: "Metric", value: "Partners live in production" },
      { label: "Anchored", value: "14 Jan by Ada Lovelace" },
      { label: "Attachments", value: "7 since 02 Feb", observed: true },
    ]}
    links={<OutcomeLink>Open decision note</OutcomeLink>}
  />
  <OutcomeCard state="attached" attached title="Partner onboarding runbook" />
  <OutcomeCard state="replaced" title="Co-sell partners" reasons={["Traded for self-serve billing, 21 Feb."]} />
</ul>
```

Four states, each with its own rule and glyph: `anchored` (solid, anchor), `additive` (38% partial rule — the incomplete stroke *is* the focus warning, half-mast), `replaced` (dotted, dimmed to 72%, title struck but reasoning fully legible), `drift` (brass rule, bearing-off). Attachment gets `attached` — no rule at all, only indentation, because it adds no commitment.

Mark every derived number with `observed: true` so it renders in verdigris with the ring. Never show a replaced outcome without its reasons.
