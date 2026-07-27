Within-page navigation. Active state is weight plus a 2px ink underline — never a fill, never brass.

```jsx
<Breadcrumb items={["FY26 Q1", "Outcomes", "Co-sell motion"]} />
<Tabs active="charter" onSelect={setTab} tabs={[
  { id: "charter", label: "Charter" },
  { id: "timeline", label: "Timeline" },
  { id: "attachments", label: "Attachments", count: 4 },
  { id: "archive", label: "Archive", disabled: true },
]} />
<Pagination page={1} pages={9} onSelect={setPage} />
```

Counts sit in mono beside the label. A disabled tab stays visible at 60% — the record does not hide what exists.
