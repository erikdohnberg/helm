const OS = window.HelmDesignSystem_ea1bb8;

function OutcomeScreen({ outcome, onEdit }) {
  const { RecordTitle, Eyebrow, Breadcrumb, Tabs, Card, Observed, Chip, Button, OutcomeLink, Icon, InlineEdit, Table, AvatarStack } = OS;
  const [tab, setTab] = React.useState("charter");
  const [editing, setEditing] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Breadcrumb items={["FY26 Q1", "Outcomes", outcome.title]} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="anchor" size={15} />
          <span style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", fontWeight: 600 }}>Anchored</span>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <Eyebrow>FY26 Q1</Eyebrow>
        </div>
        <div onClick={() => setEditing(true)}>
          <InlineEdit value={outcome.title} editing={editing} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Chip label="FY26 Q1" />
          <Chip variant="outline" label="Product" />
          <AvatarStack people={["AL", "GH"]} overflow={2} />
        </div>
      </div>

      <Tabs
        active={tab}
        onSelect={setTab}
        tabs={[
          { id: "charter", label: "Charter" },
          { id: "timeline", label: "Timeline" },
          { id: "attachments", label: "Attachments", count: 7 },
          { id: "archive", label: "Archive", disabled: true },
        ]}
      />

      {tab === "charter" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "var(--measure-prose)" }}>
          <Card state="anchored">
            <Eyebrow tone="muted">The commitment</Eyebrow>
            <p style={{ margin: "10px 0 0" }}>{outcome.commitment}</p>
          </Card>
          <Card>
            <Eyebrow tone="muted">What it trades off</Eyebrow>
            <p style={{ margin: "10px 0 0", color: "var(--muted-foreground)" }}>{outcome.tradeoff}</p>
          </Card>
          <Card>
            <Eyebrow tone="muted">Observed since anchoring</Eyebrow>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <Observed>7 attachments since 02 Feb, up from 3</Observed>
              <Observed>Four engineers moved to unentered work</Observed>
            </div>
          </Card>
          <div style={{ display: "flex", gap: 12 }}>
            <OutcomeLink>Open decision note</OutcomeLink>
            <OutcomeLink>Planning review transcript</OutcomeLink>
          </div>
        </div>
      ) : null}

      {tab === "timeline" ? (
        <div style={{ maxWidth: "var(--measure-prose)" }}>
          {outcome.timeline.map((t, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "78px 26px 1fr", gap: 14, padding: "14px 0", borderTop: "1px solid var(--border)", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-mono)", color: "var(--subtle-foreground)" }}>{t.date}</span>
              <span style={{ color: t.observed ? "var(--sea)" : "var(--foreground)", display: "inline-flex", transform: "translateY(3px)" }}><Icon name={t.glyph} size={16} /></span>
              {t.observed ? <Observed style={{ fontSize: "var(--text-sm)" }}>{t.text}</Observed> : <span style={{ fontSize: "var(--text-sm)" }}>{t.text}</span>}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "attachments" ? (
        <Table
          columns={[{ key: "what", label: "Attached work" }, { key: "who", label: "By" }, { key: "when", label: "When", mono: true }, { key: "a", label: "", align: "right" }]}
          rows={outcome.attachments.map((a) => ({ ...a, a: <Button size="sm" variant="outline">Detach</Button> }))}
        />
      ) : null}
    </div>
  );
}

Object.assign(window, { OutcomeScreen });
