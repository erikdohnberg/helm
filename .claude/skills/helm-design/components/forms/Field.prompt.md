Form controls. Placeholders are real examples; help text is a fact, not a reassurance; errors name the cause and the next move.

```jsx
<Input id="team" label="Team name" placeholder="e.g. Product" help="Shown on the outcome charter." />
<Input id="slack" label="Slack user ID" mono value="U9"
       error="No user found for U9. Slack IDs start with U and are 9 to 11 characters." />
<Textarea id="ctx" label="Context" rows={3} placeholder="Why this outcome, and what it trades off…" />
<RadioOption name="entry" value="Additive" hint="Nothing stops.">Add alongside</RadioOption>
<InlineEdit value="Two design partners live" editing={false} />
```

`InlineEdit` is how the record is amended: a dashed underline signals editability, and the field materialises in place with no layout shift. Charter text is edited inline; structural change goes through a dialog.
