import React from "react";

const ELEVATION = {
  e0: "none",
  e1: "var(--e1)",
  e2: "var(--e2)",
  e3: "var(--e3)",
};

/**
 * Record surface. e0 (flat, border only) is the default because nothing in the
 * record floats. The `state` prop draws the left rule that names an outcome's
 * standing — see tokens/state.css.
 */
export function Card({ children, elevation = "e0", state, density = "editorial", surface = "log", style, ...rest }) {
  const stateStyle = {
    anchored: { borderLeft: "3px solid var(--foreground)" },
    additive: {
      borderLeft: "3px solid transparent",
      backgroundImage: "linear-gradient(var(--ink-400) 0 38%, transparent 38%)",
      backgroundSize: "3px 100%",
      backgroundRepeat: "no-repeat",
    },
    replaced: { borderLeft: "3px dotted var(--ink-300)", opacity: 0.72 },
    attached: { marginLeft: "2.125rem", borderLeft: 0 },
    drift: { borderLeft: "3px solid var(--drift)", borderColor: "var(--drift)" },
  }[state];

  return (
    <div
      style={{
        background: "var(--card)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderRadius: surface === "app" ? "var(--radius)" : "var(--radius-log)",
        boxShadow: ELEVATION[elevation],
        padding: density === "compact" ? "var(--card-pad-compact)" : "var(--card-pad)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-body)",
        lineHeight: "var(--leading-body)",
        ...stateStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** 11px uppercase kicker. The only uppercase in the system. */
export function Eyebrow({ children, tone = "sea", style, ...rest }) {
  return (
    <div
      style={{
        fontFamily: tone === "sea" ? "var(--font-mono)" : "var(--font-sans)",
        fontSize: tone === "sea" ? "10.5px" : "var(--text-eyebrow)",
        letterSpacing: tone === "sea" ? "var(--tracking-rail)" : "var(--tracking-eyebrow)",
        textTransform: "uppercase",
        fontWeight: tone === "sea" ? 400 : "var(--weight-semibold)",
        color: tone === "sea" ? "var(--sea)" : tone === "muted" ? "var(--subtle-foreground)" : "var(--foreground)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Serif title. Outcome titles and page display read as statements of record. */
export function RecordTitle({ children, level = "outcome", style, ...rest }) {
  const sizes = {
    display: { fontSize: "var(--text-display)", lineHeight: "var(--leading-display)", fontWeight: 300, letterSpacing: "var(--tracking-display)" },
    heading: { fontSize: "var(--text-heading)", lineHeight: "var(--leading-heading)", fontWeight: 300, letterSpacing: "var(--tracking-heading)" },
    page: { fontSize: "var(--text-page-title)", lineHeight: "var(--leading-title)", fontWeight: 400, letterSpacing: "var(--tracking-title)" },
    lede: { fontSize: "var(--text-lede)", lineHeight: 1.42, fontWeight: 300 },
    outcome: { fontSize: "var(--text-outcome)", lineHeight: "var(--leading-outcome)", fontWeight: 500 },
  }[level];
  return (
    <div style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", textWrap: "pretty", ...sizes, ...style }} {...rest}>
      {children}
    </div>
  );
}
