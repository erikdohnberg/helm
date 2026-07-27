import React from "react";

/**
 * Facts only — quarter, owner, role, source. Never state and never severity:
 * state lives in the card's left rule, drift lives in brass.
 */
export function Chip({ label, children, variant = "solid", onRemove, style, ...rest }) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "var(--radius-full)",
    padding: "4px 11px",
    fontSize: "12.5px",
    fontFamily: "var(--font-sans)",
    whiteSpace: "nowrap",
  };
  const variants = {
    solid: { background: "var(--sunken)", color: "var(--muted-foreground)", border: "1px solid transparent" },
    outline: { background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)" },
    observed: { background: "var(--sea-wash)", color: "var(--sea)", border: "1px solid transparent", fontWeight: "var(--weight-semibold)" },
  };
  return (
    <span style={{ ...base, ...variants[variant], ...(onRemove ? { paddingRight: "6px" } : null), ...style }} {...rest}>
      {variant === "observed" ? <span style={{ width: 7, height: 7, border: "1.5px solid currentColor", borderRadius: "var(--radius-full)", flex: "none" }} /> : null}
      {children || label}
      {onRemove ? (
        <button type="button" aria-label="Remove" onClick={onRemove} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "inherit", display: "inline-flex" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      ) : null}
    </span>
  );
}

/**
 * Attribution. Verdigris marks what Helm observed; navy ink marks what a
 * person said. Always prefixed with the 7px hollow ring.
 */
export function Observed({ children, style, ...rest }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: "7px", color: "var(--sea)", fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <span style={{ width: 7, height: 7, border: "1.5px solid var(--sea)", borderRadius: "var(--radius-full)", flex: "none", transform: "translateY(-1px)" }} />
      {children}
    </span>
  );
}
