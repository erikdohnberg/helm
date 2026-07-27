import React from "react";

/** e2 — transient, dismissible, leaves no trace. States what is now true. */
export function Toast({ message, tone = "default", style }) {
  return (
    <div
      style={{
        background: "var(--popover)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        borderLeft: tone === "error" ? "3px solid var(--destructive)" : "1px solid var(--border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--e2)",
        padding: "12px 16px",
        fontFamily: "var(--font-sans)",
        fontSize: "13.5px",
        pointerEvents: "auto",
        ...style,
      }}
    >
      {message}
    </div>
  );
}

export function ToastViewport({ children }) {
  return (
    <div aria-live="polite" style={{ position: "fixed", bottom: "16px", left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
      {children}
    </div>
  );
}

/** Standing condition on a surface. Flat, bordered, never elevated. */
export function Alert({ title, children, tone = "default" }) {
  const destructive = tone === "destructive";
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "var(--card)", border: "1px solid var(--border)", borderLeft: destructive ? "3px solid var(--destructive)" : "1px solid var(--border)", borderRadius: "var(--radius-log)", padding: "18px 20px", fontFamily: "var(--font-sans)" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden style={{ flex: "none", marginTop: "2px", color: destructive ? "var(--destructive)" : "var(--muted-foreground)" }}>
        <circle cx="12" cy="12" r="9" />
        {destructive ? <><path d="M12 8v5" strokeLinecap="round" /><path d="M12 17h.01" strokeLinecap="round" /></> : <><path d="M12 11v5" strokeLinecap="round" /><path d="M12 8h.01" strokeLinecap="round" /></>}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {title ? <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-sm)", color: "var(--foreground)" }}>{title}</div> : null}
        <div style={{ fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: "var(--measure-help)" }}>{children}</div>
      </div>
    </div>
  );
}
