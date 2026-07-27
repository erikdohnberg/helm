const SS = window.HelmDesignSystem_ea1bb8;

function SettingsScreen({ onToast }) {
  const { RecordTitle, Eyebrow, Tabs, Card, Table, Button, Input, Alert, Chip } = SS;
  const [tab, setTab] = React.useState("team");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Eyebrow>Acme Inc.</Eyebrow>
        <RecordTitle level="page">Settings</RecordTitle>
      </div>

      <Tabs active={tab} onSelect={setTab} tabs={[
        { id: "team", label: "Team" },
        { id: "integrations", label: "Integrations" },
        { id: "defaults", label: "Defaults" },
      ]} />

      {tab === "team" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ margin: 0, maxWidth: "var(--measure-prose)", color: "var(--muted-foreground)" }}>
            Members and the team each person leads. Compact density — the one place it is permitted.
          </p>
          <Table
            columns={[{ key: "member", label: "Member" }, { key: "team", label: "Team" }, { key: "id", label: "Slack user ID", mono: true }, { key: "a", label: "", align: "right" }]}
            rows={[
              { member: "Ada Lovelace", team: "Product", id: "U01ABC", a: <Button size="sm" variant="outline">Edit</Button> },
              { member: "Grace Hopper", team: "", id: "", a: <Button size="sm" variant="outline">Add details</Button> },
              { member: "Alan Turing", team: "Platform", id: "U04XYZ", a: <Button size="sm" variant="outline">Edit</Button> },
            ]}
          />
        </div>
      ) : null}

      {tab === "integrations" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "var(--measure-prose)" }}>
          <Card density="compact" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ fontWeight: 600 }}>Google Drive</div>
              <Chip variant="outline" label="Connected" />
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--muted-foreground)" }}>
              Charters are written to <strong style={{ fontWeight: 600, color: "var(--foreground)" }}>Helm Outcome Charters</strong>. Clearing storage removes Helm&apos;s reference to the folder; it does not delete the folder.
            </p>
            <div><Button size="sm" variant="outline" onClick={() => onToast("Charter storage cleared for Helm. The folder still exists in Drive.")}>Change charter folder</Button></div>
          </Card>
          <Card density="compact" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ fontWeight: 600 }}>Slack</div>
              <Chip label="Not connected" />
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--muted-foreground)" }}>
              Helm reads the channels you nominate and writes nothing back without a decision.
            </p>
            <div><Button size="sm" onClick={() => onToast("Slack connection tested")}>Connect Slack</Button></div>
          </Card>
        </div>
      ) : null}

      {tab === "defaults" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "var(--measure-prose)" }}>
          <Alert title="This quarter is locked">FY26 Q1 closed on 31 Mar. New outcomes will enter FY26 Q2.</Alert>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--field-gap)", maxWidth: 420 }}>
            <Input id="s-org" label="Organization" defaultValue="Acme Inc." help="Shown on every charter." />
            <Input id="s-fy" label="Fiscal year starts" defaultValue="January" />
          </div>
          <div><Button onClick={() => onToast("Recorded. New outcomes will enter FY26 Q2.")}>Record these defaults</Button></div>
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { SettingsScreen });
