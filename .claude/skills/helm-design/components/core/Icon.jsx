import React from "react";

const PATHS = {
  anchor: <><circle cx="12" cy="4.6" r="2.1" /><path d="M12 6.7V21" /><path d="M7.5 10h9" /><path d="M4 14.5a8 8 0 0 0 16 0" /></>,
  "helm-mark": <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.9" /><path d="M12 3.5V2M12 22v-1.5M3.5 12H2M22 12h-1.5M6 6 5 5M18 6l1-1M6 18l-1 1M18 18l1 1" /></>,
  "bearing-off": <><circle cx="12" cy="12" r="9" /><path d="M12 12 17.5 6.5" /><path d="M13.5 6.5h4v4" /><path d="M12 12 8 19" strokeDasharray="2 3" /></>,
  shackle: <><circle cx="8.5" cy="12" r="4" /><path d="M12.5 12H20" /><path d="m17 8.5 3.5 3.5L17 15.5" /></>,
  sounding: <><path d="M4 5h16" /><path d="M12 5v11" /><path d="m8 12.5 4 4 4-4" /><path d="M5 20h14" strokeDasharray="2 3" /></>,
  beacon: <><path d="m12 3 4.5 8h-9z" /><path d="M6.5 15h11" /><path d="M8.5 20h7" /></>,
  "half-mast": <><path d="M12 4v9" /><path d="M12 13 8 21" /><path d="M12 13l4 8" /><path d="M6 8h12" /></>,
  provenance: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></>,
  heading: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  logged: <path d="M20 6 9 17l-5-5" />,
  watch: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  close: <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  "more-vertical": <g fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" /></g>,
};

/** Instrument glyph. 1.5px stroke, round caps, 24px grid, never filled. */
export function Icon({ name, size = 20, style, ...rest }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flex: "none", display: "block", ...style }}
      {...rest}
    >
      {body}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);
