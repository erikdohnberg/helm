import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Observed } from "../core/Chip.jsx";

const LEVELS = {
  notice: { rule: "1px", label: "Notice", weight: "var(--weight-semibold)" },
  contradiction: { rule: "3px", label: "Contradiction", weight: 700 },
  halt: { rule: "3px", label: "Halt", weight: 700 },
};

/**
 * The reserved exception. Brass appears in exactly one context: a contradiction
 * between new work and an anchored outcome. Severity is carried by rule weight
 * and the verb in the sentence, never by a second hue.
 */
export function DriftFlag({ level = "contradiction", statement, observed, question, actions }) {
  const l = LEVELS[level] || LEVELS.contradiction;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        overflow: "hidden",
        background: "var(--card)",
        border: "1px solid var(--drift)",
        borderRadius: "var(--radius-log)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ width: l.rule, background: "var(--drift)", opacity: level === "notice" ? 0.5 : 1, flex: "none" }} />
      <div style={{ flex: 1 }}>
        {level === "halt" ? <div style={{ height: "6px", background: "var(--drift-wash)" }} /> : null}
        <div style={{ padding: "var(--card-pad)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ width: 8, height: 8, transform: "rotate(45deg)", background: "var(--drift)", flex: "none" }} />
            <span style={{ fontSize: "var(--text-eyebrow)", letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase", fontWeight: l.weight, color: "var(--drift)" }}>{l.label}</span>
            <span style={{ marginLeft: "auto", color: "var(--drift)", display: "inline-flex" }}><Icon name="bearing-off" size={18} /></span>
          </div>
          <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: "19px", lineHeight: 1.4, maxWidth: "var(--measure-prose)" }}>{statement}</p>
          {observed ? <Observed style={{ fontSize: "13.5px" }}>{observed}</Observed> : null}
          {question ? <p style={{ margin: 0, fontSize: "var(--text-body)", fontWeight: "var(--weight-semibold)" }}>{question}</p> : null}
          {actions ? <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
