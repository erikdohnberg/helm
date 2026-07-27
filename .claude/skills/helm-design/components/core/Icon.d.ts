import * as React from "react";

/**
 * The instrument icon set — drawn from chart and instrument marking rather
 * than generic UI. The first six carry product meaning and may not be used
 * decoratively; the rest are utility glyphs drawn to the same hand.
 */
export interface IconProps {
  name:
    | "anchor"        /* anchored outcome — the official direction */
    | "helm-mark"     /* the product mark; mastheads, never inline in text */
    | "bearing-off"   /* drift — the only glyph permitted to carry brass */
    | "shackle"       /* attached work — adds no commitment */
    | "sounding"      /* progress against a target. Depth, not a score */
    | "beacon"        /* replacement — what now stands where something stood */
    | "half-mast"     /* additive entry */
    | "provenance"    /* leaves Helm. Mandatory on every external link */
    | "heading"
    | "logged"
    | "watch"
    | "search"
    | "close"
    | "chevron"
    | "more-vertical";
  /** px. 20 in UI, 15 inline beside a label, 24 on the specimen grid. */
  size?: number;
  style?: React.CSSProperties;
}

export declare function Icon(props: IconProps): JSX.Element | null;
export declare const ICON_NAMES: string[];
