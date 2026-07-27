const QS = window.HelmDesignSystem_ea1bb8;

function QuarterScreen({ outcomes, drift, onResolveDrift, onOpenReplace }) {
  const { RecordTitle, Eyebrow, OutcomeCard, OutcomeLink, DriftFlag, Button, IconButton, Icon, Observed, EmptyState } = QS;
  const anchored = outcomes.filter((o) => o.state === "anchored" || o.state === "additive");
  const attached = outcomes.filter((o) => o.state === "attached");
  const replaced = outcomes.filter((o) => o.state === "replaced");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--section-gap)" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Eyebrow>FY26 Q1 · 14 Jan – 31 Mar</Eyebrow>
        <RecordTitle level="page">The quarter as recorded</RecordTitle>
        <p style={{ margin: 0, maxWidth: "var(--measure-prose)", color: "var(--muted-foreground)" }}>
          Three outcomes stand. One was traded away and stays in the record.
        </p>
        <Observed style={{ fontSize: "13.5px" }}>Last checked four minutes ago across 2 sources</Observed>
      </header>

      {drift ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Eyebrow>Unresolved</Eyebrow>
          <DriftFlag
            level="halt"
            statement="Work started 21 Feb contradicts what this quarter anchored on 14 Jan."
            observed="Four engineers have been on unentered work for three days."
            question="What stops?"
            actions={<>
              <Button size="sm" onClick={onOpenReplace}>Record this decision</Button>
              <Button size="sm" variant="outline" onClick={onResolveDrift}>Nothing stops — dismiss</Button>
            </>}
          />
        </section>
      ) : null}

      <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Eyebrow>Anchored</Eyebrow>
        {anchored.length === 0 ? (
          <EmptyState title="Nothing anchored yet" observed="Nothing observed to contradict" action={<Button>Anchor an outcome</Button>}>
            A quarter with no anchored outcome has no direction to drift from.
          </EmptyState>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0, padding: 0 }}>
            {anchored.map((o) => (
              <React.Fragment key={o.id}>
                <OutcomeCard
                  state={o.state}
                  quarter="FY26 Q1"
                  title={o.title}
                  facts={o.facts}
                  links={o.doc ? <OutcomeLink>Open decision note</OutcomeLink> : null}
                  actions={<IconButton label={"Actions for " + o.title}><Icon name="more-vertical" size={18} /></IconButton>}
                />
                {attached.filter((a) => a.parent === o.id).map((a) => (
                  <OutcomeCard key={a.id} attached title={a.title} quarter="FY26 Q1" observed={a.observed} />
                ))}
              </React.Fragment>
            ))}
          </ul>
        )}
      </section>

      {replaced.length ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Eyebrow>Traded away</Eyebrow>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12, margin: 0, padding: 0 }}>
            {replaced.map((o) => (
              <OutcomeCard key={o.id} state="replaced" quarter="FY26 Q1" title={o.title} reasons={o.reasons} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

Object.assign(window, { QuarterScreen });
