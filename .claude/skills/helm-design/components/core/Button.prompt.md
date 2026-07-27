Action button. The label names what enters the record — if a label would work in any product, it is wrong in this one.

```jsx
<Button>Record this decision</Button>
<Button variant="outline">Attach work</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="destructive">Retire outcome</Button>
<IconButton label="Outcome actions"><Icon name="more-vertical" /></IconButton>
```

Primary is navy ink on chart paper, hovering to `--ink-800`. `destructive` is reserved for irreversible removal (Retire), never for errors or warnings. `IconButton` keeps a 44×44 hit area around an 18–20px glyph. Nothing here uses brass: brass means drift.
