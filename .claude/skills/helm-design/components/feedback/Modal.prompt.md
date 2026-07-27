The dialog. Every structural change to the record passes through one, and the title asks the decision rather than seeking permission.

```jsx
<Modal
  title="What stops if this enters?"
  description="Self-serve billing would replace co-sell partners, which stays in the record."
  footer={<><Button variant="outline">Cancel</Button><Button>Replace and record</Button></>}
>
  <Textarea id="why" label="Reasoning" rows={3} />
</Modal>
```

Never "Are you sure?". The cost is stated in `description`, in the same breath as the action — never disclosed afterwards in a toast.
