import React from "react";

/** Compact-density record table. Header in sunken, 1px row rules, mono ids. */
export function Table({ columns = [], rows = [], style }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-log)", overflow: "hidden", background: "var(--card)", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr style={{ background: "var(--sunken)" }}>
            {columns.map((c) => (
              <th key={c.key} style={{ padding: "12px 20px", fontSize: "var(--text-eyebrow)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: "var(--weight-semibold)", color: "var(--subtle-foreground)", borderBottom: "1px solid var(--border)", textAlign: c.align || "left" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "14px 20px", fontSize: "var(--text-sm)", borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--border)", textAlign: c.align || "left", fontFamily: c.mono ? "var(--font-mono)" : "inherit", color: c.mono ? "var(--muted-foreground)" : "inherit" }}>
                  {r[c.key] == null || r[c.key] === "" ? <span style={{ color: "var(--subtle-foreground)" }}>—</span> : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Avatar({ initials, size = 32 }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "var(--radius-full)", background: "var(--ink-200)", color: "var(--ink-700)", fontFamily: "var(--font-sans)", fontSize: size <= 24 ? "10px" : "12px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
      {initials}
    </span>
  );
}

export function AvatarStack({ people = [], overflow }) {
  return (
    <div style={{ display: "flex" }}>
      {people.map((p, i) => (
        <span key={p} style={{ marginLeft: i === 0 ? 0 : "-9px", boxShadow: "0 0 0 2px var(--background)", borderRadius: "var(--radius-full)", display: "inline-flex" }}>
          <Avatar initials={p} />
        </span>
      ))}
      {overflow ? (
        <span style={{ marginLeft: "-9px", width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--sunken)", border: "1px solid var(--border)", color: "var(--subtle-foreground)", fontSize: "11px", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px var(--background)" }}>
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function Kbd({ children }) {
  return (
    <kbd style={{ fontFamily: "var(--font-mono)", fontSize: "11px", border: "1px solid var(--border-strong)", borderBottomWidth: "2px", borderRadius: "5px", padding: "2px 6px", background: "var(--card)", color: "var(--foreground)" }}>
      {children}
    </kbd>
  );
}

export function Skeleton({ width = "100%", height = 10, shimmer = false }) {
  return (
    <div style={{
      width, height,
      borderRadius: height > 14 ? "4px" : "3px",
      background: shimmer
        ? "linear-gradient(90deg, var(--sunken) 0, var(--ink-100) 50%, var(--sunken) 100%)"
        : "var(--sunken)",
      backgroundSize: shimmer ? "440px 100%" : undefined,
      animation: shimmer ? "helm-shimmer 1.4s linear infinite" : undefined,
    }} />
  );
}

/** States why the emptiness is meaningful, then offers the one action. */
export function EmptyState({ title, children, observed, action }) {
  return (
    <div style={{ border: "1px dashed var(--border-strong)", borderRadius: "var(--radius-log)", padding: "36px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", fontFamily: "var(--font-sans)" }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "19px", color: "var(--foreground)" }}>{title}</div>
      <div style={{ fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: "34ch" }}>{children}</div>
      {observed ? (
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: "7px", color: "var(--sea)", fontSize: "12.5px" }}>
          <span style={{ width: 7, height: 7, border: "1.5px solid var(--sea)", borderRadius: "var(--radius-full)", flex: "none", transform: "translateY(-1px)" }} />
          {observed}
        </span>
      ) : null}
      {action ? <div style={{ marginTop: "8px" }}>{action}</div> : null}
    </div>
  );
}
