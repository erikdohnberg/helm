import React from "react";

/** Underline tabs. The active tab is marked by weight plus a 2px brass-free rule. */
export function Tabs({ tabs = [], active, onSelect, style }) {
  return (
    <nav style={{ borderBottom: "1px solid var(--border)", display: "flex", gap: "28px", fontFamily: "var(--font-sans)", ...style }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <a
            key={t.id}
            href="#"
            onClick={(e) => { e.preventDefault(); if (!t.disabled && onSelect) onSelect(t.id); }}
            aria-disabled={t.disabled || undefined}
            style={{
              padding: "12px 0",
              fontSize: "var(--text-sm)",
              textDecoration: "none",
              fontWeight: on ? "var(--weight-semibold)" : "var(--weight-regular)",
              color: t.disabled ? "var(--subtle-foreground)" : on ? "var(--foreground)" : "var(--muted-foreground)",
              boxShadow: on ? "inset 0 -2px 0 var(--foreground)" : "none",
              opacity: t.disabled ? 0.6 : 1,
              cursor: t.disabled ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {t.label}
            {t.count != null ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--subtle-foreground)" }}>{t.count}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}

export function Breadcrumb({ items = [], style }) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: "9px", fontFamily: "var(--font-sans)", fontSize: "13.5px", color: "var(--muted-foreground)", ...style }}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={item}>
            {last ? <span style={{ color: "var(--foreground)", fontWeight: "var(--weight-medium)" }}>{item}</span>
              : <a href="#" onClick={(e) => e.preventDefault()} style={{ textDecoration: "none", color: "inherit" }}>{item}</a>}
            {last ? null : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden style={{ opacity: 0.5 }}><path d="m9 18 6-6-6-6" /></svg>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function Pagination({ page = 1, pages = 9, onSelect, style }) {
  const btn = (extra) => ({
    fontFamily: "var(--font-sans)",
    fontSize: "13.5px",
    height: "var(--control-h-compact)",
    borderRadius: "6px",
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    ...extra,
  });
  const shown = [1, 2, 3].filter((n) => n <= pages);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", ...style }}>
      <button type="button" onClick={() => onSelect && onSelect(Math.max(1, page - 1))} style={btn({ padding: "0 12px", border: "1px solid var(--border)", background: "var(--card)" })}>Previous</button>
      {shown.map((n) => (
        <button key={n} type="button" onClick={() => onSelect && onSelect(n)}
          style={btn(n === page ? { minWidth: "34px", background: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid var(--primary)" } : { minWidth: "34px" })}>
          {n}
        </button>
      ))}
      {pages > 4 ? <span style={{ color: "var(--subtle-foreground)", padding: "0 4px" }}>…</span> : null}
      {pages > 3 ? <button type="button" onClick={() => onSelect && onSelect(pages)} style={btn({ minWidth: "34px" })}>{pages}</button> : null}
      <button type="button" onClick={() => onSelect && onSelect(Math.min(pages, page + 1))} style={btn({ padding: "0 12px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)" })}>Next</button>
    </div>
  );
}
