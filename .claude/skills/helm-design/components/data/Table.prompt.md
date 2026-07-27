Record data display: tables, people, keyboard hints, loading and emptiness.

```jsx
<Table
  columns={[{key:'member',label:'Member'},{key:'team',label:'Team'},{key:'id',label:'Slack user ID',mono:true},{key:'action',label:'',align:'right'}]}
  rows={[{ member: 'Ada Lovelace', team: 'Product', id: 'U01ABC', action: <Button size="sm" variant="outline">Edit</Button> }]}
/>
<AvatarStack people={["AL","GH"]} overflow={3} />
<Kbd>⌘</Kbd><Kbd>K</Kbd>
<Skeleton width="78%" height={20} shimmer />
<EmptyState title="Nothing anchored yet" observed="Nothing observed to contradict"
  action={<Button>Anchor an outcome</Button>}>
  A quarter with no anchored outcome has no direction to drift from.
</EmptyState>
```

Missing values render as an em dash, never as "N/A" or a blank. Empty states say why the emptiness matters rather than apologising for it. The shimmer needs a `@keyframes helm-shimmer` in the page: `0% { background-position: -220px 0 } 100% { background-position: 220px 0 }`.
