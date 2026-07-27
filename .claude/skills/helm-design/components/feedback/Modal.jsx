import React from "react";

/** e3 — requires a decision. If it can be ignored, it is not a Modal. */
export function Modal({ open = true, title, description, children, footer, width = "520px", onClose }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "oklch(0.20 0.04 245 / 0.55)", padding: "16px" }}
    >
      <div style={{ width: "100%", maxWidth: width, background: "var(--popover)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius)", boxShadow: "var(--e3)", padding: "var(--card-pad)", fontFamily: "var(--font-sans)", fontSize: "var(--text-body)", color: "var(--foreground)" }}>
        {title ? <div style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-outcome)", fontWeight: 500, lineHeight: "var(--leading-outcome)" }}>{title}</div> : null}
        {description ? <p style={{ margin: "8px 0 0", fontSize: "13.5px", color: "var(--muted-foreground)", maxWidth: "var(--measure-help)" }}>{description}</p> : null}
        <div style={{ marginTop: "20px" }}>{children}</div>
        {footer ? <div style={{ marginTop: "28px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>{footer}</div> : null}
      </div>
    </div>
  );
}
