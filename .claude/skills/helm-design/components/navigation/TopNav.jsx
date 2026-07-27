import React from "react";

/**
 * The Helm masthead: navy-deep ground, a 2px brass keel line, the mark in the
 * 104px rail, wordmark in serif, sections, then a right-aligned slot.
 */
export function TopNav({
  logoSrc = "../../assets/helm-logo.svg",
  items = [{ id: "/quarter", label: "Quarter" }, { id: "/outcomes", label: "Outcomes" }, { id: "/settings", label: "Settings" }],
  active = "/quarter",
  onNavigate,
  trailing,
}) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "var(--navy-deep)", borderBottom: "2px solid var(--brass)" }}>
      <div style={{ maxWidth: "var(--measure-page)", margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "var(--rail) minmax(0, 1fr)" }}>
        <div style={{ borderRight: "1px solid oklch(1 0 0 / 0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={logoSrc} alt="" width="26" height="26" style={{ display: "block", filter: "brightness(0) invert(1)" }} />
        </div>
        <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "22px", paddingLeft: "var(--rail-indent)", height: "64px" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "21px", fontWeight: 500, letterSpacing: "0.01em", color: "oklch(0.97 0.01 85)", flex: "none" }}>Helm</span>
          <div style={{ display: "flex", gap: "18px", fontFamily: "var(--font-sans)", fontSize: "13px", flex: 1, minWidth: 0 }}>
            {items.map((item) => {
              const on = active === item.id || (item.id !== "/" && active.indexOf(item.id) === 0);
              return (
                <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate(item.id); }}
                  style={{ textDecoration: "none", whiteSpace: "nowrap", color: on ? "oklch(0.97 0.01 85)" : "oklch(0.86 0.015 85)", fontWeight: on ? "var(--weight-semibold)" : "var(--weight-regular)", borderBottom: on ? "1px solid var(--brass-soft)" : "1px solid transparent", paddingBottom: "2px" }}>
                  {item.label}
                </a>
              );
            })}
          </div>
          {trailing ? <div style={{ flex: "none", marginLeft: "auto" }}>{trailing}</div> : null}
        </div>
      </div>
    </div>
  );
}
