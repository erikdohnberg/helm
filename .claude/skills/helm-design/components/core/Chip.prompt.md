`Chip` labels a fact; `Observed` marks attribution. Neither carries state.

```jsx
<Chip label="FY26 Q1" />
<Chip variant="outline" label="Admin" />
<Chip variant="observed" label="Observed" />
<Chip label="Growth" onRemove={() => {}} />

<Observed>7 attachments since 02 Feb, up from 3</Observed>
```

`Observed` is the attribution axis: verdigris plus a 7px hollow ring means Helm noticed it; plain navy means a person wrote it. An observation never appears inside an authored sentence, and a person editing an observed value promotes it to navy permanently. Verdigris carries no severity — brass alone does that, which is why the two never share a line.
