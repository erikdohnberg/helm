/* @ds-bundle: {"format":4,"namespace":"HelmDesignSystem_ea1bb8","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Card.jsx"},{"name":"RecordTitle","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"Observed","sourcePath":"components/core/Chip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Avatar","sourcePath":"components/data/Table.jsx"},{"name":"AvatarStack","sourcePath":"components/data/Table.jsx"},{"name":"Kbd","sourcePath":"components/data/Table.jsx"},{"name":"Skeleton","sourcePath":"components/data/Table.jsx"},{"name":"EmptyState","sourcePath":"components/data/Table.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ToastViewport","sourcePath":"components/feedback/Toast.jsx"},{"name":"Alert","sourcePath":"components/feedback/Toast.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Label","sourcePath":"components/forms/Field.jsx"},{"name":"Help","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Field.jsx"},{"name":"Textarea","sourcePath":"components/forms/Field.jsx"},{"name":"Select","sourcePath":"components/forms/Field.jsx"},{"name":"RadioOption","sourcePath":"components/forms/Field.jsx"},{"name":"InlineEdit","sourcePath":"components/forms/Field.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopNav","sourcePath":"components/navigation/TopNav.jsx"},{"name":"DriftFlag","sourcePath":"components/outcomes/DriftFlag.jsx"},{"name":"OutcomeCard","sourcePath":"components/outcomes/OutcomeCard.jsx"},{"name":"OutcomeLink","sourcePath":"components/outcomes/OutcomeCard.jsx"}],"sourceHashes":{"components/core/Button.jsx":"19f7b508bd6b","components/core/Card.jsx":"7ffbadb8eb04","components/core/Chip.jsx":"54744035dac7","components/core/Icon.jsx":"d65340106dd1","components/data/Table.jsx":"e6647fbe2fe0","components/feedback/Modal.jsx":"d6abb8eee51d","components/feedback/Toast.jsx":"3ffd7ae5cf4b","components/forms/Field.jsx":"2e9a4c97edc3","components/navigation/Tabs.jsx":"611d4a7d252d","components/navigation/TopNav.jsx":"bdd0a04c89a0","components/outcomes/DriftFlag.jsx":"5f8a79c0943d","components/outcomes/OutcomeCard.jsx":"c4a741505edd","ui_kits/app/OutcomeScreen.jsx":"71be10df6116","ui_kits/app/QuarterScreen.jsx":"333b5ac4e9c6","ui_kits/app/SettingsScreen.jsx":"279a979164ee","ui_kits/app/data.js":"40327184825f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.HelmDesignSystem_ea1bb8 = window.HelmDesignSystem_ea1bb8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  transition: "background-color var(--dur-quick) var(--ease-out), color var(--dur-quick) var(--ease-out), border-color var(--dur-quick) var(--ease-out)"
};
const SIZES = {
  sm: {
    height: "34px",
    padding: "0 14px",
    fontSize: "13px",
    borderRadius: "6px"
  },
  md: {
    height: "var(--control-h)",
    padding: "0 18px",
    fontSize: "var(--text-sm)"
  },
  lg: {
    height: "46px",
    padding: "0 24px",
    fontSize: "var(--text-body)"
  }
};
function variantStyle(variant, hovered) {
  switch (variant) {
    case "outline":
      return {
        background: hovered ? "var(--sunken)" : "var(--card)",
        color: "var(--foreground)",
        borderColor: "var(--border-strong)"
      };
    case "ghost":
      return {
        background: hovered ? "var(--sunken)" : "transparent",
        color: hovered ? "var(--foreground)" : "var(--muted-foreground)",
        borderColor: "transparent"
      };
    case "link":
      return {
        background: "none",
        border: "none",
        padding: "0 4px",
        color: "var(--foreground)",
        textDecoration: "underline",
        textUnderlineOffset: "4px",
        textDecorationColor: hovered ? "var(--foreground)" : "var(--ink-300)"
      };
    case "destructive":
      return {
        background: hovered ? "var(--sunken)" : "transparent",
        color: "var(--destructive)",
        borderColor: "var(--destructive)"
      };
    default:
      return {
        background: hovered ? "var(--ink-800)" : "var(--primary)",
        color: "var(--primary-foreground)",
        borderColor: hovered ? "var(--ink-800)" : "var(--primary)"
      };
  }
}
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      ...BASE,
      ...SIZES[size],
      ...variantStyle(variant, hovered && !disabled),
      ...(disabled ? {
        background: "var(--sunken)",
        color: "var(--subtle-foreground)",
        borderColor: "var(--border)",
        cursor: "not-allowed"
      } : null),
      ...style
    }
  }, rest), children);
}

/** 44×44 hit area, glyph stays visually small. */
function IconButton({
  children,
  label,
  onClick,
  style,
  ...rest
}) {
  const [hovered, setHovered] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
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
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button, IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ELEVATION = {
  e0: "none",
  e1: "var(--e1)",
  e2: "var(--e2)",
  e3: "var(--e3)"
};

/**
 * Record surface. e0 (flat, border only) is the default because nothing in the
 * record floats. The `state` prop draws the left rule that names an outcome's
 * standing — see tokens/state.css.
 */
function Card({
  children,
  elevation = "e0",
  state,
  density = "editorial",
  surface = "log",
  style,
  ...rest
}) {
  const stateStyle = {
    anchored: {
      borderLeft: "3px solid var(--foreground)"
    },
    additive: {
      borderLeft: "3px solid transparent",
      backgroundImage: "linear-gradient(var(--ink-400) 0 38%, transparent 38%)",
      backgroundSize: "3px 100%",
      backgroundRepeat: "no-repeat"
    },
    replaced: {
      borderLeft: "3px dotted var(--ink-300)",
      opacity: 0.72
    },
    attached: {
      marginLeft: "2.125rem",
      borderLeft: 0
    },
    drift: {
      borderLeft: "3px solid var(--drift)",
      borderColor: "var(--drift)"
    }
  }[state];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
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
      ...style
    }
  }, rest), children);
}

/** 11px uppercase kicker. The only uppercase in the system. */
function Eyebrow({
  children,
  tone = "sea",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: tone === "sea" ? "var(--font-mono)" : "var(--font-sans)",
      fontSize: tone === "sea" ? "10.5px" : "var(--text-eyebrow)",
      letterSpacing: tone === "sea" ? "var(--tracking-rail)" : "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      fontWeight: tone === "sea" ? 400 : "var(--weight-semibold)",
      color: tone === "sea" ? "var(--sea)" : tone === "muted" ? "var(--subtle-foreground)" : "var(--foreground)",
      ...style
    }
  }, rest), children);
}

/** Serif title. Outcome titles and page display read as statements of record. */
function RecordTitle({
  children,
  level = "outcome",
  style,
  ...rest
}) {
  const sizes = {
    display: {
      fontSize: "var(--text-display)",
      lineHeight: "var(--leading-display)",
      fontWeight: 300,
      letterSpacing: "var(--tracking-display)"
    },
    heading: {
      fontSize: "var(--text-heading)",
      lineHeight: "var(--leading-heading)",
      fontWeight: 300,
      letterSpacing: "var(--tracking-heading)"
    },
    page: {
      fontSize: "var(--text-page-title)",
      lineHeight: "var(--leading-title)",
      fontWeight: 400,
      letterSpacing: "var(--tracking-title)"
    },
    lede: {
      fontSize: "var(--text-lede)",
      lineHeight: 1.42,
      fontWeight: 300
    },
    outcome: {
      fontSize: "var(--text-outcome)",
      lineHeight: "var(--leading-outcome)",
      fontWeight: 500
    }
  }[level];
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-serif)",
      color: "var(--foreground)",
      textWrap: "pretty",
      ...sizes,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card, Eyebrow, RecordTitle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Facts only — quarter, owner, role, source. Never state and never severity:
 * state lives in the card's left rule, drift lives in brass.
 */
function Chip({
  label,
  children,
  variant = "solid",
  onRemove,
  style,
  ...rest
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    borderRadius: "var(--radius-full)",
    padding: "4px 11px",
    fontSize: "12.5px",
    fontFamily: "var(--font-sans)",
    whiteSpace: "nowrap"
  };
  const variants = {
    solid: {
      background: "var(--sunken)",
      color: "var(--muted-foreground)",
      border: "1px solid transparent"
    },
    outline: {
      background: "transparent",
      color: "var(--muted-foreground)",
      border: "1px solid var(--border)"
    },
    observed: {
      background: "var(--sea-wash)",
      color: "var(--sea)",
      border: "1px solid transparent",
      fontWeight: "var(--weight-semibold)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      ...variants[variant],
      ...(onRemove ? {
        paddingRight: "6px"
      } : null),
      ...style
    }
  }, rest), variant === "observed" ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      border: "1.5px solid currentColor",
      borderRadius: "var(--radius-full)",
      flex: "none"
    }
  }) : null, children || label, onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remove",
    onClick: onRemove,
    style: {
      border: "none",
      background: "none",
      padding: 0,
      cursor: "pointer",
      color: "inherit",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  }))) : null);
}

/**
 * Attribution. Verdigris marks what Helm observed; navy ink marks what a
 * person said. Always prefixed with the 7px hollow ring.
 */
function Observed({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: "7px",
      color: "var(--sea)",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      border: "1.5px solid var(--sea)",
      borderRadius: "var(--radius-full)",
      flex: "none",
      transform: "translateY(-1px)"
    }
  }), children);
}
Object.assign(__ds_scope, { Chip, Observed });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PATHS = {
  anchor: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "4.6",
    r: "2.1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6.7V21"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7.5 10h9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 14.5a8 8 0 0 0 16 0"
  })),
  "helm-mark": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "8.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5V2M12 22v-1.5M3.5 12H2M22 12h-1.5M6 6 5 5M18 6l1-1M6 18l-1 1M18 18l1 1"
  })),
  "bearing-off": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 12 17.5 6.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M13.5 6.5h4v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 12 8 19",
    strokeDasharray: "2 3"
  })),
  shackle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "12",
    r: "4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12.5 12H20"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m17 8.5 3.5 3.5L17 15.5"
  })),
  sounding: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 5h16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 5v11"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m8 12.5 4 4 4-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 20h14",
    strokeDasharray: "2 3"
  })),
  beacon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "m12 3 4.5 8h-9z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 15h11"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 20h7"
  })),
  "half-mast": /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 4v9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 13 8 21"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 13l4 8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 8h12"
  })),
  provenance: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3h6v6"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10 14 21 3"
  })),
  heading: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m13 6 6 6-6 6"
  })),
  logged: /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }),
  watch: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 7v5l3 2"
  })),
  search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m20 20-3.5-3.5"
  })),
  close: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  })),
  chevron: /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  }),
  "more-vertical": /*#__PURE__*/React.createElement("g", {
    fill: "currentColor",
    stroke: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "5",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "19",
    r: "1.6"
  }))
};

/** Instrument glyph. 1.5px stroke, round caps, 24px grid, never filled. */
function Icon({
  name,
  size = 20,
  style,
  ...rest
}) {
  const body = PATHS[name];
  if (!body) return null;
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      flex: "none",
      display: "block",
      ...style
    }
  }, rest), body);
}
const ICON_NAMES = Object.keys(PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
/** Compact-density record table. Header in sunken, 1px row rules, mono ids. */
function Table({
  columns = [],
  rows = [],
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-log)",
      overflow: "hidden",
      background: "var(--card)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--sunken)"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      padding: "12px 20px",
      fontSize: "var(--text-eyebrow)",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontWeight: "var(--weight-semibold)",
      color: "var(--subtle-foreground)",
      borderBottom: "1px solid var(--border)",
      textAlign: c.align || "left"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: "14px 20px",
      fontSize: "var(--text-sm)",
      borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--border)",
      textAlign: c.align || "left",
      fontFamily: c.mono ? "var(--font-mono)" : "inherit",
      color: c.mono ? "var(--muted-foreground)" : "inherit"
    }
  }, r[c.key] == null || r[c.key] === "" ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--subtle-foreground)"
    }
  }, "\u2014") : r[c.key])))))));
}
function Avatar({
  initials,
  size = 32
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: "var(--radius-full)",
      background: "var(--ink-200)",
      color: "var(--ink-700)",
      fontFamily: "var(--font-sans)",
      fontSize: size <= 24 ? "10px" : "12px",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none"
    }
  }, initials);
}
function AvatarStack({
  people = [],
  overflow
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, people.map((p, i) => /*#__PURE__*/React.createElement("span", {
    key: p,
    style: {
      marginLeft: i === 0 ? 0 : "-9px",
      boxShadow: "0 0 0 2px var(--background)",
      borderRadius: "var(--radius-full)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: p
  }))), overflow ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "-9px",
      width: 32,
      height: 32,
      borderRadius: "var(--radius-full)",
      background: "var(--sunken)",
      border: "1px solid var(--border)",
      color: "var(--subtle-foreground)",
      fontSize: "11px",
      fontWeight: 600,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 0 2px var(--background)"
    }
  }, "+", overflow) : null);
}
function Kbd({
  children
}) {
  return /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      border: "1px solid var(--border-strong)",
      borderBottomWidth: "2px",
      borderRadius: "5px",
      padding: "2px 6px",
      background: "var(--card)",
      color: "var(--foreground)"
    }
  }, children);
}
function Skeleton({
  width = "100%",
  height = 10,
  shimmer = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: height > 14 ? "4px" : "3px",
      background: shimmer ? "linear-gradient(90deg, var(--sunken) 0, var(--ink-100) 50%, var(--sunken) 100%)" : "var(--sunken)",
      backgroundSize: shimmer ? "440px 100%" : undefined,
      animation: shimmer ? "helm-shimmer 1.4s linear infinite" : undefined
    }
  });
}

/** States why the emptiness is meaningful, then offers the one action. */
function EmptyState({
  title,
  children,
  observed,
  action
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px dashed var(--border-strong)",
      borderRadius: "var(--radius-log)",
      padding: "36px 24px",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "center",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "19px",
      color: "var(--foreground)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13.5px",
      color: "var(--muted-foreground)",
      maxWidth: "34ch"
    }
  }, children), observed ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: "7px",
      color: "var(--sea)",
      fontSize: "12.5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      border: "1.5px solid var(--sea)",
      borderRadius: "var(--radius-full)",
      flex: "none",
      transform: "translateY(-1px)"
    }
  }), observed) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "8px"
    }
  }, action) : null);
}
Object.assign(__ds_scope, { Table, Avatar, AvatarStack, Kbd, Skeleton, EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/** e3 — requires a decision. If it can be ignored, it is not a Modal. */
function Modal({
  open = true,
  title,
  description,
  children,
  footer,
  width = "520px",
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "oklch(0.20 0.04 245 / 0.55)",
      padding: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: width,
      background: "var(--popover)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius)",
      boxShadow: "var(--e3)",
      padding: "var(--card-pad)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-body)",
      color: "var(--foreground)"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "var(--text-outcome)",
      fontWeight: 500,
      lineHeight: "var(--leading-outcome)"
    }
  }, title) : null, description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontSize: "13.5px",
      color: "var(--muted-foreground)",
      maxWidth: "var(--measure-help)"
    }
  }, description) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "20px"
    }
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "28px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px"
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/** e2 — transient, dismissible, leaves no trace. States what is now true. */
function Toast({
  message,
  tone = "default",
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
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
      ...style
    }
  }, message);
}
function ToastViewport({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite",
    style: {
      position: "fixed",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      pointerEvents: "none"
    }
  }, children);
}

/** Standing condition on a surface. Flat, bordered, never elevated. */
function Alert({
  title,
  children,
  tone = "default"
}) {
  const destructive = tone === "destructive";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "14px",
      alignItems: "flex-start",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderLeft: destructive ? "3px solid var(--destructive)" : "1px solid var(--border)",
      borderRadius: "var(--radius-log)",
      padding: "18px 20px",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    "aria-hidden": true,
    style: {
      flex: "none",
      marginTop: "2px",
      color: destructive ? "var(--destructive)" : "var(--muted-foreground)"
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), destructive ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 8v5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01",
    strokeLinecap: "round"
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M12 11v5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8h.01",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: "var(--weight-semibold)",
      fontSize: "var(--text-sm)",
      color: "var(--foreground)"
    }
  }, title) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13.5px",
      color: "var(--muted-foreground)",
      maxWidth: "var(--measure-help)"
    }
  }, children)));
}
Object.assign(__ds_scope, { Toast, ToastViewport, Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  outline: "none"
};
function ring(focused) {
  return focused ? {
    outline: "2px solid var(--ring)",
    outlineOffset: "2px"
  } : null;
}
const Field = {
  Label,
  Help,
  Input,
  Textarea,
  Select,
  RadioOption,
  InlineEdit
};
function Label({
  children,
  htmlFor,
  muted = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    htmlFor: htmlFor,
    style: {
      display: "block",
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      fontWeight: "var(--weight-semibold)",
      color: muted ? "var(--subtle-foreground)" : "var(--foreground)",
      ...style
    }
  }, rest), children);
}
function Help({
  children,
  tone = "muted"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12.5px",
      maxWidth: "var(--measure-help)",
      color: tone === "error" ? "var(--destructive)" : "var(--subtle-foreground)"
    }
  }, tone === "error" ? /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    "aria-hidden": true,
    style: {
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 8v5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  })) : null, children);
}
function Wrapper({
  label,
  id,
  help,
  error,
  disabled,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "7px"
    }
  }, label ? /*#__PURE__*/React.createElement(Label, {
    htmlFor: id,
    muted: disabled
  }, label) : null, children, error ? /*#__PURE__*/React.createElement(Help, {
    tone: "error"
  }, error) : help ? /*#__PURE__*/React.createElement(Help, null, help) : null);
}
function Input({
  label,
  id,
  help,
  error,
  disabled,
  mono = false,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement(Wrapper, {
    label: label,
    id: id,
    help: help,
    error: error,
    disabled: disabled
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      ...FIELD,
      ...(mono ? {
        fontFamily: "var(--font-mono)"
      } : null),
      ...(error ? {
        borderColor: "var(--destructive)"
      } : null),
      ...(disabled ? {
        background: "var(--sunken)",
        color: "var(--subtle-foreground)",
        borderColor: "var(--border)",
        cursor: "not-allowed"
      } : null),
      ...ring(focused),
      ...style
    }
  }, rest)));
}
function Textarea({
  label,
  id,
  help,
  error,
  rows = 3,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement(Wrapper, {
    label: label,
    id: id,
    help: help,
    error: error
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    id: id,
    rows: rows,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      ...FIELD,
      height: "auto",
      padding: "11px 14px",
      lineHeight: "var(--leading-body)",
      resize: "vertical",
      ...ring(focused),
      ...style
    }
  }, rest)));
}
function Select({
  label,
  id,
  help,
  error,
  options = [],
  placeholder,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement(Wrapper, {
    label: label,
    id: id,
    help: help,
    error: error
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      ...FIELD,
      padding: "0 12px",
      ...ring(focused),
      ...style
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))));
}
function RadioOption({
  name,
  value,
  checked,
  onChange,
  children,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    style: {
      marginTop: "2px",
      width: "16px",
      height: "16px",
      accentColor: "var(--navy)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      color: "var(--foreground)"
    }
  }, children)), hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "6px 0 0 28px",
      fontSize: "13.5px",
      color: "var(--muted-foreground)"
    }
  }, hint) : null);
}

/** Dotted underline at rest; the field materialises in place with no layout shift. */
function InlineEdit({
  value,
  editing = false,
  level = "outcome",
  style
}) {
  const size = level === "outcome" ? "20px" : "15px";
  if (!editing) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-serif)",
        fontSize: size,
        borderBottom: "1px dashed var(--border-strong)",
        paddingBottom: "3px",
        cursor: "text",
        ...style
      }
    }, value);
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: size,
      border: "1px solid var(--foreground)",
      borderRadius: "6px",
      padding: "4px 8px",
      margin: "-5px -9px",
      outline: "2px solid var(--ring)",
      outlineOffset: "2px",
      ...style
    }
  }, value);
}
Object.assign(__ds_scope, { Field, Label, Help, Input, Textarea, Select, RadioOption, InlineEdit });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Underline tabs. The active tab is marked by weight plus a 2px brass-free rule. */
function Tabs({
  tabs = [],
  active,
  onSelect,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      borderBottom: "1px solid var(--border)",
      display: "flex",
      gap: "28px",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("a", {
      key: t.id,
      href: "#",
      onClick: e => {
        e.preventDefault();
        if (!t.disabled && onSelect) onSelect(t.id);
      },
      "aria-disabled": t.disabled || undefined,
      style: {
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
        gap: "6px"
      }
    }, t.label, t.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "11.5px",
        color: "var(--subtle-foreground)"
      }
    }, t.count) : null);
  }));
}
function Breadcrumb({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "9px",
      fontFamily: "var(--font-sans)",
      fontSize: "13.5px",
      color: "var(--muted-foreground)",
      ...style
    }
  }, items.map((item, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: item
    }, last ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--foreground)",
        fontWeight: "var(--weight-medium)"
      }
    }, item) : /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        textDecoration: "none",
        color: "inherit"
      }
    }, item), last ? null : /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5",
      strokeLinecap: "round",
      "aria-hidden": true,
      style: {
        opacity: 0.5
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "m9 18 6-6-6-6"
    })));
  }));
}
function Pagination({
  page = 1,
  pages = 9,
  onSelect,
  style
}) {
  const btn = extra => ({
    fontFamily: "var(--font-sans)",
    fontSize: "13.5px",
    height: "var(--control-h-compact)",
    borderRadius: "6px",
    background: "transparent",
    border: "1px solid transparent",
    color: "var(--muted-foreground)",
    cursor: "pointer",
    ...extra
  });
  const shown = [1, 2, 3].filter(n => n <= pages);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      ...style
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(Math.max(1, page - 1)),
    style: btn({
      padding: "0 12px",
      border: "1px solid var(--border)",
      background: "var(--card)"
    })
  }, "Previous"), shown.map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    type: "button",
    onClick: () => onSelect && onSelect(n),
    style: btn(n === page ? {
      minWidth: "34px",
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      border: "1px solid var(--primary)"
    } : {
      minWidth: "34px"
    })
  }, n)), pages > 4 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--subtle-foreground)",
      padding: "0 4px"
    }
  }, "\u2026") : null, pages > 3 ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(pages),
    style: btn({
      minWidth: "34px"
    })
  }, pages) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSelect && onSelect(Math.min(pages, page + 1)),
    style: btn({
      padding: "0 12px",
      border: "1px solid var(--border)",
      background: "var(--card)",
      color: "var(--foreground)"
    })
  }, "Next"));
}
Object.assign(__ds_scope, { Tabs, Breadcrumb, Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopNav.jsx
try { (() => {
/**
 * The Helm masthead: navy-deep ground, a 2px brass keel line, the mark in the
 * 104px rail, wordmark in serif, sections, then a right-aligned slot.
 */
function TopNav({
  logoSrc = "../../assets/helm-logo.svg",
  items = [{
    id: "/quarter",
    label: "Quarter"
  }, {
    id: "/outcomes",
    label: "Outcomes"
  }, {
    id: "/settings",
    label: "Settings"
  }],
  active = "/quarter",
  onNavigate,
  trailing
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 40,
      background: "var(--navy-deep)",
      borderBottom: "2px solid var(--brass)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--measure-page)",
      margin: "0 auto",
      padding: "0 40px",
      display: "grid",
      gridTemplateColumns: "var(--rail) minmax(0, 1fr)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: "1px solid oklch(1 0 0 / 0.14)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "",
    width: "26",
    height: "26",
    style: {
      display: "block",
      filter: "brightness(0) invert(1)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: "22px",
      paddingLeft: "var(--rail-indent)",
      height: "64px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-serif)",
      fontSize: "21px",
      fontWeight: 500,
      letterSpacing: "0.01em",
      color: "oklch(0.97 0.01 85)",
      flex: "none"
    }
  }, "Helm"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "18px",
      fontFamily: "var(--font-sans)",
      fontSize: "13px",
      flex: 1,
      minWidth: 0
    }
  }, items.map(item => {
    const on = active === item.id || item.id !== "/" && active.indexOf(item.id) === 0;
    return /*#__PURE__*/React.createElement("a", {
      key: item.id,
      href: "#",
      onClick: e => {
        e.preventDefault();
        if (onNavigate) onNavigate(item.id);
      },
      style: {
        textDecoration: "none",
        whiteSpace: "nowrap",
        color: on ? "oklch(0.97 0.01 85)" : "oklch(0.86 0.015 85)",
        fontWeight: on ? "var(--weight-semibold)" : "var(--weight-regular)",
        borderBottom: on ? "1px solid var(--brass-soft)" : "1px solid transparent",
        paddingBottom: "2px"
      }
    }, item.label);
  })), trailing ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      marginLeft: "auto"
    }
  }, trailing) : null)));
}
Object.assign(__ds_scope, { TopNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopNav.jsx", error: String((e && e.message) || e) }); }

// components/outcomes/DriftFlag.jsx
try { (() => {
const LEVELS = {
  notice: {
    rule: "1px",
    label: "Notice",
    weight: "var(--weight-semibold)"
  },
  contradiction: {
    rule: "3px",
    label: "Contradiction",
    weight: 700
  },
  halt: {
    rule: "3px",
    label: "Halt",
    weight: 700
  }
};

/**
 * The reserved exception. Brass appears in exactly one context: a contradiction
 * between new work and an anchored outcome. Severity is carried by rule weight
 * and the verb in the sentence, never by a second hue.
 */
function DriftFlag({
  level = "contradiction",
  statement,
  observed,
  question,
  actions
}) {
  const l = LEVELS[level] || LEVELS.contradiction;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    "aria-live": "polite",
    style: {
      display: "flex",
      overflow: "hidden",
      background: "var(--card)",
      border: "1px solid var(--drift)",
      borderRadius: "var(--radius-log)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: l.rule,
      background: "var(--drift)",
      opacity: level === "notice" ? 0.5 : 1,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, level === "halt" ? /*#__PURE__*/React.createElement("div", {
    style: {
      height: "6px",
      background: "var(--drift-wash)"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--card-pad)",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      transform: "rotate(45deg)",
      background: "var(--drift)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      fontWeight: l.weight,
      color: "var(--drift)"
    }
  }, l.label), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      color: "var(--drift)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "bearing-off",
    size: 18
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontSize: "19px",
      lineHeight: 1.4,
      maxWidth: "var(--measure-prose)"
    }
  }, statement), observed ? /*#__PURE__*/React.createElement(__ds_scope.Observed, {
    style: {
      fontSize: "13.5px"
    }
  }, observed) : null, question ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-body)",
      fontWeight: "var(--weight-semibold)"
    }
  }, question) : null, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap"
    }
  }, actions) : null)));
}
Object.assign(__ds_scope, { DriftFlag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/outcomes/DriftFlag.jsx", error: String((e && e.message) || e) }); }

// components/outcomes/OutcomeCard.jsx
try { (() => {
const STATE = {
  anchored: {
    rule: {
      width: "3px",
      background: "var(--foreground)"
    },
    glyph: "anchor",
    label: "Anchored"
  },
  additive: {
    rule: {
      width: "3px",
      background: "linear-gradient(to bottom, var(--ink-400) 0 38%, transparent 38% 100%)"
    },
    glyph: "half-mast",
    label: "Additive"
  },
  replaced: {
    rule: {
      width: "3px",
      background: "repeating-linear-gradient(to bottom, var(--ink-300) 0 3px, transparent 3px 7px)"
    },
    glyph: null,
    label: "Replaced"
  },
  drift: {
    rule: {
      width: "3px",
      background: "var(--drift)"
    },
    glyph: "bearing-off",
    label: "Bearing off"
  }
};
function StateLine({
  state,
  quarter
}) {
  const s = STATE[state] || STATE.anchored;
  const drift = state === "drift";
  const replaced = state === "replaced";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px"
    }
  }, s.glyph ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: drift ? "var(--drift)" : replaced ? "var(--muted-foreground)" : "var(--foreground)",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.glyph,
    size: 15
  })) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 1.5,
      background: "var(--ink-500)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      fontWeight: drift ? 700 : "var(--weight-semibold)",
      color: drift ? "var(--drift)" : replaced ? "var(--muted-foreground)" : "var(--foreground)"
    }
  }, s.label), quarter ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--border-strong)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "10.5px",
      letterSpacing: "var(--tracking-rail)",
      textTransform: "uppercase",
      color: "var(--sea)"
    }
  }, quarter)) : null);
}

/**
 * The Outcome Charter. State is the left rule and the glyph; the quarter, the
 * owners and the observed counts sit around a serif title.
 */
function OutcomeCard({
  state = "anchored",
  title,
  quarter,
  replaces,
  observed,
  facts = [],
  reasons = [],
  actions,
  links,
  attached = false,
  children
}) {
  const s = STATE[state] || STATE.anchored;
  const dim = state === "replaced";
  return /*#__PURE__*/React.createElement("li", {
    style: {
      listStyle: "none",
      display: "flex",
      overflow: "hidden",
      background: "var(--card)",
      border: "1px solid " + (state === "drift" ? "var(--drift)" : "var(--border)"),
      borderRadius: "var(--radius-log)",
      marginLeft: attached ? "2.125rem" : 0,
      fontFamily: "var(--font-sans)"
    }
  }, attached ? null : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      ...s.rule
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: "var(--card-pad)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      opacity: dim ? 0.72 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement(StateLine, {
    state: state,
    quarter: quarter
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-serif)",
      fontSize: "var(--text-outcome)",
      fontWeight: 500,
      lineHeight: "var(--leading-outcome)",
      maxWidth: "32ch",
      textDecoration: dim ? "line-through" : "none",
      textDecorationThickness: "1px",
      textDecorationColor: "var(--ink-400)"
    }
  }, title), replaces ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13.5px",
      color: "var(--muted-foreground)"
    }
  }, "Replaces ", replaces) : null), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      display: "flex",
      gap: "8px",
      alignItems: "center"
    }
  }, actions) : null), facts.length ? /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1px",
      background: "var(--border)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-inner)",
      overflow: "hidden"
    }
  }, facts.map(f => /*#__PURE__*/React.createElement("div", {
    key: f.label,
    style: {
      background: "var(--card)",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    }
  }, /*#__PURE__*/React.createElement("dt", {
    style: {
      fontSize: "10.5px",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--subtle-foreground)",
      fontWeight: "var(--weight-semibold)"
    }
  }, f.label), /*#__PURE__*/React.createElement("dd", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)"
    }
  }, f.observed ? /*#__PURE__*/React.createElement(__ds_scope.Observed, null, f.value) : f.value)))) : null, reasons.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      fontSize: "13.5px",
      color: "var(--muted-foreground)",
      maxWidth: "var(--measure-prose)"
    }
  }, reasons.map((r, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, r))) : null, observed ? /*#__PURE__*/React.createElement(__ds_scope.Observed, {
    style: {
      fontSize: "13.5px"
    }
  }, observed) : null, children, links ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px"
    }
  }, links) : null));
}

/** External link. The provenance glyph is mandatory on anything leaving Helm. */
function OutcomeLink({
  children,
  href = "#"
}) {
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--text-sm)",
      color: "var(--foreground)",
      textDecoration: "underline",
      textDecorationColor: "var(--ink-300)",
      textUnderlineOffset: "4px"
    }
  }, children, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.65,
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "provenance",
    size: 13
  })));
}
Object.assign(__ds_scope, { OutcomeCard, OutcomeLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/outcomes/OutcomeCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/OutcomeScreen.jsx
try { (() => {
const OS = window.HelmDesignSystem_ea1bb8;
function OutcomeScreen({
  outcome,
  onEdit
}) {
  const {
    RecordTitle,
    Eyebrow,
    Breadcrumb,
    Tabs,
    Card,
    Observed,
    Chip,
    Button,
    OutcomeLink,
    Icon,
    InlineEdit,
    Table,
    AvatarStack
  } = OS;
  const [tab, setTab] = React.useState("charter");
  const [editing, setEditing] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement(Breadcrumb, {
    items: ["FY26 Q1", "Outcomes", outcome.title]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "anchor",
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "Anchored"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--border-strong)"
    }
  }, "\xB7"), /*#__PURE__*/React.createElement(Eyebrow, null, "FY26 Q1")), /*#__PURE__*/React.createElement("div", {
    onClick: () => setEditing(true)
  }, /*#__PURE__*/React.createElement(InlineEdit, {
    value: outcome.title,
    editing: editing
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    label: "FY26 Q1"
  }), /*#__PURE__*/React.createElement(Chip, {
    variant: "outline",
    label: "Product"
  }), /*#__PURE__*/React.createElement(AvatarStack, {
    people: ["AL", "GH"],
    overflow: 2
  }))), /*#__PURE__*/React.createElement(Tabs, {
    active: tab,
    onSelect: setTab,
    tabs: [{
      id: "charter",
      label: "Charter"
    }, {
      id: "timeline",
      label: "Timeline"
    }, {
      id: "attachments",
      label: "Attachments",
      count: 7
    }, {
      id: "archive",
      label: "Archive",
      disabled: true
    }]
  }), tab === "charter" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: "var(--measure-prose)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    state: "anchored"
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "muted"
  }, "The commitment"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 0"
    }
  }, outcome.commitment)), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "muted"
  }, "What it trades off"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "10px 0 0",
      color: "var(--muted-foreground)"
    }
  }, outcome.tradeoff)), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "muted"
  }, "Observed since anchoring"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Observed, null, "7 attachments since 02 Feb, up from 3"), /*#__PURE__*/React.createElement(Observed, null, "Four engineers moved to unentered work"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(OutcomeLink, null, "Open decision note"), /*#__PURE__*/React.createElement(OutcomeLink, null, "Planning review transcript"))) : null, tab === "timeline" ? /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--measure-prose)"
    }
  }, outcome.timeline.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "78px 26px 1fr",
      gap: 14,
      padding: "14px 0",
      borderTop: "1px solid var(--border)",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--text-mono)",
      color: "var(--subtle-foreground)"
    }
  }, t.date), /*#__PURE__*/React.createElement("span", {
    style: {
      color: t.observed ? "var(--sea)" : "var(--foreground)",
      display: "inline-flex",
      transform: "translateY(3px)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: t.glyph,
    size: 16
  })), t.observed ? /*#__PURE__*/React.createElement(Observed, {
    style: {
      fontSize: "var(--text-sm)"
    }
  }, t.text) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)"
    }
  }, t.text)))) : null, tab === "attachments" ? /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: "what",
      label: "Attached work"
    }, {
      key: "who",
      label: "By"
    }, {
      key: "when",
      label: "When",
      mono: true
    }, {
      key: "a",
      label: "",
      align: "right"
    }],
    rows: outcome.attachments.map(a => ({
      ...a,
      a: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline"
      }, "Detach")
    }))
  }) : null);
}
Object.assign(window, {
  OutcomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/OutcomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/QuarterScreen.jsx
try { (() => {
const QS = window.HelmDesignSystem_ea1bb8;
function QuarterScreen({
  outcomes,
  drift,
  onResolveDrift,
  onOpenReplace
}) {
  const {
    RecordTitle,
    Eyebrow,
    OutcomeCard,
    OutcomeLink,
    DriftFlag,
    Button,
    IconButton,
    Icon,
    Observed,
    EmptyState
  } = QS;
  const anchored = outcomes.filter(o => o.state === "anchored" || o.state === "additive");
  const attached = outcomes.filter(o => o.state === "attached");
  const replaced = outcomes.filter(o => o.state === "replaced");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--section-gap)"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "FY26 Q1 \xB7 14 Jan \u2013 31 Mar"), /*#__PURE__*/React.createElement(RecordTitle, {
    level: "page"
  }, "The quarter as recorded"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: "var(--measure-prose)",
      color: "var(--muted-foreground)"
    }
  }, "Three outcomes stand. One was traded away and stays in the record."), /*#__PURE__*/React.createElement(Observed, {
    style: {
      fontSize: "13.5px"
    }
  }, "Last checked four minutes ago across 2 sources")), drift ? /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Unresolved"), /*#__PURE__*/React.createElement(DriftFlag, {
    level: "halt",
    statement: "Work started 21 Feb contradicts what this quarter anchored on 14 Jan.",
    observed: "Four engineers have been on unentered work for three days.",
    question: "What stops?",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: onOpenReplace
    }, "Record this decision"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "outline",
      onClick: onResolveDrift
    }, "Nothing stops \u2014 dismiss"))
  })) : null, /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Anchored"), anchored.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    title: "Nothing anchored yet",
    observed: "Nothing observed to contradict",
    action: /*#__PURE__*/React.createElement(Button, null, "Anchor an outcome")
  }, "A quarter with no anchored outcome has no direction to drift from.") : /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      margin: 0,
      padding: 0
    }
  }, anchored.map(o => /*#__PURE__*/React.createElement(React.Fragment, {
    key: o.id
  }, /*#__PURE__*/React.createElement(OutcomeCard, {
    state: o.state,
    quarter: "FY26 Q1",
    title: o.title,
    facts: o.facts,
    links: o.doc ? /*#__PURE__*/React.createElement(OutcomeLink, null, "Open decision note") : null,
    actions: /*#__PURE__*/React.createElement(IconButton, {
      label: "Actions for " + o.title
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "more-vertical",
      size: 18
    }))
  }), attached.filter(a => a.parent === o.id).map(a => /*#__PURE__*/React.createElement(OutcomeCard, {
    key: a.id,
    attached: true,
    title: a.title,
    quarter: "FY26 Q1",
    observed: a.observed
  })))))), replaced.length ? /*#__PURE__*/React.createElement("section", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Traded away"), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      margin: 0,
      padding: 0
    }
  }, replaced.map(o => /*#__PURE__*/React.createElement(OutcomeCard, {
    key: o.id,
    state: "replaced",
    quarter: "FY26 Q1",
    title: o.title,
    reasons: o.reasons
  })))) : null);
}
Object.assign(window, {
  QuarterScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/QuarterScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/SettingsScreen.jsx
try { (() => {
const SS = window.HelmDesignSystem_ea1bb8;
function SettingsScreen({
  onToast
}) {
  const {
    RecordTitle,
    Eyebrow,
    Tabs,
    Card,
    Table,
    Button,
    Input,
    Alert,
    Chip
  } = SS;
  const [tab, setTab] = React.useState("team");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Acme Inc."), /*#__PURE__*/React.createElement(RecordTitle, {
    level: "page"
  }, "Settings")), /*#__PURE__*/React.createElement(Tabs, {
    active: tab,
    onSelect: setTab,
    tabs: [{
      id: "team",
      label: "Team"
    }, {
      id: "integrations",
      label: "Integrations"
    }, {
      id: "defaults",
      label: "Defaults"
    }]
  }), tab === "team" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: "var(--measure-prose)",
      color: "var(--muted-foreground)"
    }
  }, "Members and the team each person leads. Compact density \u2014 the one place it is permitted."), /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: "member",
      label: "Member"
    }, {
      key: "team",
      label: "Team"
    }, {
      key: "id",
      label: "Slack user ID",
      mono: true
    }, {
      key: "a",
      label: "",
      align: "right"
    }],
    rows: [{
      member: "Ada Lovelace",
      team: "Product",
      id: "U01ABC",
      a: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline"
      }, "Edit")
    }, {
      member: "Grace Hopper",
      team: "",
      id: "",
      a: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline"
      }, "Add details")
    }, {
      member: "Alan Turing",
      team: "Platform",
      id: "U04XYZ",
      a: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "outline"
      }, "Edit")
    }]
  })) : null, tab === "integrations" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: "var(--measure-prose)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    density: "compact",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "Google Drive"), /*#__PURE__*/React.createElement(Chip, {
    variant: "outline",
    label: "Connected"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "13.5px",
      color: "var(--muted-foreground)"
    }
  }, "Charters are written to ", /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 600,
      color: "var(--foreground)"
    }
  }, "Helm Outcome Charters"), ". Clearing storage removes Helm's reference to the folder; it does not delete the folder."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "outline",
    onClick: () => onToast("Charter storage cleared for Helm. The folder still exists in Drive.")
  }, "Change charter folder"))), /*#__PURE__*/React.createElement(Card, {
    density: "compact",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "Slack"), /*#__PURE__*/React.createElement(Chip, {
    label: "Not connected"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "13.5px",
      color: "var(--muted-foreground)"
    }
  }, "Helm reads the channels you nominate and writes nothing back without a decision."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    onClick: () => onToast("Slack connection tested")
  }, "Connect Slack")))) : null, tab === "defaults" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      maxWidth: "var(--measure-prose)"
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    title: "This quarter is locked"
  }, "FY26 Q1 closed on 31 Mar. New outcomes will enter FY26 Q2."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--field-gap)",
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement(Input, {
    id: "s-org",
    label: "Organization",
    defaultValue: "Acme Inc.",
    help: "Shown on every charter."
  }), /*#__PURE__*/React.createElement(Input, {
    id: "s-fy",
    label: "Fiscal year starts",
    defaultValue: "January"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    onClick: () => onToast("Recorded. New outcomes will enter FY26 Q2.")
  }, "Record these defaults"))) : null);
}
Object.assign(window, {
  SettingsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.HELM_OUTCOMES = [{
  id: "o1",
  state: "anchored",
  doc: true,
  title: "Two named design partners live on the co-sell motion",
  commitment: "Two design partners are running the co-sell motion in production by the end of FY26 Q1, with their onboarding recorded end to end.",
  tradeoff: "Self-serve billing was deferred to FY26 Q2 to free the two engineers this needs.",
  facts: [{
    label: "Metric",
    value: "Partners live in production"
  }, {
    label: "Anchored",
    value: "14 Jan by Ada Lovelace"
  }, {
    label: "Attachments",
    value: "7 since 02 Feb, up from 3",
    observed: true
  }],
  timeline: [{
    date: "14 Jan",
    glyph: "anchor",
    text: "Anchored in the FY26 planning review. Two alternatives were declined."
  }, {
    date: "02 Feb",
    glyph: "shackle",
    text: "Partner onboarding runbook attached by Grace Hopper."
  }, {
    date: "11 Feb",
    glyph: "sounding",
    text: "3 attachments in nine days, up from 1",
    observed: true
  }, {
    date: "21 Feb",
    glyph: "bearing-off",
    text: "Work started on unentered scope contradicts this charter",
    observed: true
  }],
  attachments: [{
    what: "Partner onboarding runbook",
    who: "Grace Hopper",
    when: "02 Feb"
  }, {
    what: "Co-sell pricing sheet",
    who: "Ada Lovelace",
    when: "09 Feb"
  }, {
    what: "Partner API scoping doc",
    who: "Alan Turing",
    when: "18 Feb"
  }]
}, {
  id: "o2",
  state: "anchored",
  doc: true,
  title: "Support response falls below four hours",
  facts: [{
    label: "Metric",
    value: "Median first response"
  }, {
    label: "Anchored",
    value: "14 Jan by Alan Turing"
  }, {
    label: "Now",
    value: "5h 20m, down from 9h",
    observed: true
  }]
}, {
  id: "o3",
  state: "additive",
  title: "Ship the compliance audit trail",
  facts: [{
    label: "Entered",
    value: "02 Feb, nothing displaced"
  }, {
    label: "Asked by",
    value: "Board readiness review"
  }]
}, {
  id: "a1",
  state: "attached",
  parent: "o1",
  title: "Partner onboarding runbook",
  observed: "Last touched 11 Feb"
}, {
  id: "r1",
  state: "replaced",
  title: "Self-serve billing, phase one",
  reasons: ["Traded for the co-sell motion on 14 Jan.", "Kept in the record; the reasoning stays legible."]
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.RecordTitle = __ds_scope.RecordTitle;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Observed = __ds_scope.Observed;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarStack = __ds_scope.AvatarStack;

__ds_ns.Kbd = __ds_scope.Kbd;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ToastViewport = __ds_scope.ToastViewport;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.Help = __ds_scope.Help;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.RadioOption = __ds_scope.RadioOption;

__ds_ns.InlineEdit = __ds_scope.InlineEdit;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.TopNav = __ds_scope.TopNav;

__ds_ns.DriftFlag = __ds_scope.DriftFlag;

__ds_ns.OutcomeCard = __ds_scope.OutcomeCard;

__ds_ns.OutcomeLink = __ds_scope.OutcomeLink;

})();
