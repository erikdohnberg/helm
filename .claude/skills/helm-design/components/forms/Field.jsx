import React from "react";

const FIELD = {
  width: "100%",
  boxSizing: "border-box",
  height: "var(--control-h)",
  padding: "0 14px",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border-strong)",
  background: "var(--card)",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  fontSize: "var(--text-sm)",
  outline: "none",
};

function ring(focused) {
  return focused ? { outline: "2px solid var(--ring)", outlineOffset: "2px" } : null;
}

export const Field = { Label, Help, Input, Textarea, Select, RadioOption, InlineEdit };

export function Label({ children, htmlFor, muted = false, style, ...rest }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: "var(--weight-semibold)",
        color: muted ? "var(--subtle-foreground)" : "var(--foreground)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </label>
  );
}

export function Help({ children, tone = "muted" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", maxWidth: "var(--measure-help)", color: tone === "error" ? "var(--destructive)" : "var(--subtle-foreground)" }}>
      {tone === "error" ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden style={{ flex: "none" }}><path d="M12 8v5" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
      ) : null}
      {children}
    </div>
  );
}

function Wrapper({ label, id, help, error, disabled, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      {label ? <Label htmlFor={id} muted={disabled}>{label}</Label> : null}
      {children}
      {error ? <Help tone="error">{error}</Help> : help ? <Help>{help}</Help> : null}
    </div>
  );
}

export function Input({ label, id, help, error, disabled, mono = false, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Wrapper label={label} id={id} help={help} error={error} disabled={disabled}>
      <input
        id={id}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...FIELD,
          ...(mono ? { fontFamily: "var(--font-mono)" } : null),
          ...(error ? { borderColor: "var(--destructive)" } : null),
          ...(disabled ? { background: "var(--sunken)", color: "var(--subtle-foreground)", borderColor: "var(--border)", cursor: "not-allowed" } : null),
          ...ring(focused),
          ...style,
        }}
        {...rest}
      />
    </Wrapper>
  );
}

export function Textarea({ label, id, help, error, rows = 3, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Wrapper label={label} id={id} help={help} error={error}>
      <textarea
        id={id}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...FIELD, height: "auto", padding: "11px 14px", lineHeight: "var(--leading-body)", resize: "vertical", ...ring(focused), ...style }}
        {...rest}
      />
    </Wrapper>
  );
}

export function Select({ label, id, help, error, options = [], placeholder, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Wrapper label={label} id={id} help={help} error={error}>
      <select
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...FIELD, padding: "0 12px", ...ring(focused), ...style }}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrapper>
  );
}

export function RadioOption({ name, value, checked, onChange, children, hint }) {
  return (
    <div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange}
          style={{ marginTop: "2px", width: "16px", height: "16px", accentColor: "var(--navy)" }} />
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sm)", color: "var(--foreground)" }}>{children}</span>
      </label>
      {hint ? <p style={{ margin: "6px 0 0 28px", fontSize: "13.5px", color: "var(--muted-foreground)" }}>{hint}</p> : null}
    </div>
  );
}

/** Dotted underline at rest; the field materialises in place with no layout shift. */
export function InlineEdit({ value, editing = false, level = "outcome", style }) {
  const size = level === "outcome" ? "20px" : "15px";
  if (!editing) {
    return (
      <span style={{ fontFamily: "var(--font-serif)", fontSize: size, borderBottom: "1px dashed var(--border-strong)", paddingBottom: "3px", cursor: "text", ...style }}>
        {value}
      </span>
    );
  }
  return (
    <span style={{ fontFamily: "var(--font-serif)", fontSize: size, border: "1px solid var(--foreground)", borderRadius: "6px", padding: "4px 8px", margin: "-5px -9px", outline: "2px solid var(--ring)", outlineOffset: "2px", ...style }}>
      {value}
    </span>
  );
}
