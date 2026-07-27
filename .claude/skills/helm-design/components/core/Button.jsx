import React from "react";

const BASE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontFamily: "var(--font-sans)",
  fontWeight: "var(--weight-medium)",
  borderRadius: "var(--radius)",
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background-color var(--dur-quick) var(--ease-out), color var(--dur-quick) var(--ease-out), border-color var(--dur-quick) var(--ease-out)",
};

const SIZES = {
  sm: { height: "34px", padding: "0 14px", fontSize: "13px", borderRadius: "6px" },
  md: { height: "var(--control-h)", padding: "0 18px", fontSize: "var(--text-sm)" },
  lg: { height: "46px", padding: "0 24px", fontSize: "var(--text-body)" },
};

function variantStyle(variant, hovered) {
  switch (variant) {
    case "outline":
      return {
        background: hovered ? "var(--sunken)" : "var(--card)",
        color: "var(--foreground)",
        borderColor: "var(--border-strong)",
      };
    case "ghost":
      return {
        background: hovered ? "var(--sunken)" : "transparent",
        color: hovered ? "var(--foreground)" : "var(--muted-foreground)",
        borderColor: "transparent",
      };
    case "link":
      return {
        background: "none",
        border: "none",
        padding: "0 4px",
        color: "var(--foreground)",
        textDecoration: "underline",
        textUnderlineOffset: "4px",
        textDecorationColor: hovered ? "var(--foreground)" : "var(--ink-300)",
      };
    case "destructive":
      return {
        background: hovered ? "var(--sunken)" : "transparent",
        color: "var(--destructive)",
        borderColor: "var(--destructive)",
      };
    default:
      return {
        background: hovered ? "var(--ink-800)" : "var(--primary)",
        color: "var(--primary-foreground)",
        borderColor: hovered ? "var(--ink-800)" : "var(--primary)",
      };
  }
}

export function Button({ children, variant = "primary", size = "md", disabled = false, type = "button", onClick, style, ...rest }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...BASE,
        ...SIZES[size],
        ...variantStyle(variant, hovered && !disabled),
        ...(disabled ? { background: "var(--sunken)", color: "var(--subtle-foreground)", borderColor: "var(--border)", cursor: "not-allowed" } : null),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/** 44×44 hit area, glyph stays visually small. */
export function IconButton({ children, label, onClick, style, ...rest }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "44px",
        height: "44px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        borderRadius: "var(--radius)",
        border: "none",
        background: hovered ? "var(--sunken)" : "transparent",
        color: hovered ? "var(--foreground)" : "var(--muted-foreground)",
        cursor: "pointer",
        transition: "background-color var(--dur-quick) var(--ease-out)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
