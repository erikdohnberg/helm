import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Observed } from "../core/Chip.jsx";

const STATE = {
  anchored: { rule: { width: "3px", background: "var(--foreground)" }, glyph: "anchor", label: "Anchored" },
  additive: { rule: { width: "3px", background: "linear-gradient(to bottom, var(--ink-400) 0 38%, transparent 38% 100%)" }, glyph: "half-mast", label: "Additive" },
  replaced: { rule: { width: "3px", background: "repeating-linear-gradient(to bottom, var(--ink-300) 0 3px, transparent 3px 7px)" }, glyph: null, label: "Replaced" },
  drift: { rule: { width: "3px", background: "var(--drift)" }, glyph: "bearing-off", label: "Bearing off" },
};

function StateLine({ state, quarter }) {
  const s = STATE[state] || STATE.anchored;
  const drift = state === "drift";
  const replaced = state === "replaced";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {s.glyph ? <span style={{ color: drift ? "var(--drift)" : replaced ? "var(--muted-foreground)" : "var(--foreground)", display: "inline-flex" }}><Icon name={s.glyph} size={15} /></span> : <span style={{ width: 7, height: 1.5, background: "var(--ink-500)", flex: "none" }} />}
      <span style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", fontWeight: drift ? 700 : "var(--weight-semibold)", color: drift ? "var(--drift)" : replaced ? "var(--muted-foreground)" : "var(--foreground)" }}>{s.label}</span>
      {quarter ? (
        <>
          <span style={{ color: "var(--border-strong)" }}>·</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10.5px", letterSpacing: "var(--tracking-rail)", textTransform: "uppercase", color: "var(--sea)" }}>{quarter}</span>
        </>
      ) : null}
    </div>
  );
}

/**
 * The Outcome Charter. State is the left rule and the glyph; the quarter, the
 * owners and the observed counts sit around a serif title.
 */
export function OutcomeCard({ state = "anchored", title, quarter, replaces, observed, facts = [], reasons = [], actions, links, attached = false, children }) {
  const s = STATE[state] || STATE.anchored;
  const dim = state === "replaced";
  return (
    <li style={{ listStyle: "none", display: "flex", overflow: "hidden", background: "var(--card)", border: "1px solid " + (state === "drift" ? "var(--drift)" : "var(--border)"), borderRadius: "var(--radius-log)", marginLeft: attached ? "2.125rem" : 0, fontFamily: "var(--font-sans)" }}>
      {attached ? null : <div style={{ flex: "none", ...s.rule }} />}
      <div style={{ flex: 1, padding: "var(--card-pad)", display: "flex", flexDirection: "column", gap: "16px", opacity: dim ? 0.72 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <StateLine state={state} quarter={quarter} />
            <h3 style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "var(--text-outcome)", fontWeight: 500, lineHeight: "var(--leading-outcome)", maxWidth: "32ch", textDecoration: dim ? "line-through" : "none", textDecorationThickness: "1px", textDecorationColor: "var(--ink-400)" }}>
              {title}
            </h3>
            {replaces ? <div style={{ fontSize: "13.5px", color: "var(--muted-foreground)" }}>Replaces {replaces}</div> : null}
          </div>
          {actions ? <div style={{ flex: "none", display: "flex", gap: "8px", alignItems: "center" }}>{actions}</div> : null}
        </div>

        {facts.length ? (
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1px", background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius-inner)", overflow: "hidden" }}>
            {facts.map((f) => (
              <div key={f.label} style={{ background: "var(--card)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <dt style={{ fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--subtle-foreground)", fontWeight: "var(--weight-semibold)" }}>{f.label}</dt>
                <dd style={{ margin: 0, fontSize: "var(--text-sm)" }}>
                  {f.observed ? <Observed>{f.value}</Observed> : f.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {reasons.length ? (
          <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: "var(--measure-prose)" }}>
            {reasons.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        ) : null}

        {observed ? <Observed style={{ fontSize: "13.5px" }}>{observed}</Observed> : null}
        {children}
        {links ? <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>{links}</div> : null}
      </div>
    </li>
  );
}

/** External link. The provenance glyph is mandatory on anything leaving Helm. */
export function OutcomeLink({ children, href = "#" }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--foreground)", textDecoration: "underline", textDecorationColor: "var(--ink-300)", textUnderlineOffset: "4px" }}>
      {children}
      <span style={{ opacity: 0.65, display: "inline-flex" }}><Icon name="provenance" size={13} /></span>
    </a>
  );
}
