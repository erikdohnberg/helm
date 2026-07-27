import * as React from "react";

/**
 * The application masthead. Navy-deep ground with a 2px brass keel line — the
 * one place brass appears without meaning drift, because it is structural
 * rather than a signal.
 */
export interface TopNavProps {
  /** Path to helm-logo.svg, relative to the consuming page. */
  logoSrc?: string;
  items?: Array<{ id: string; label: string }>;
  active?: string;
  onNavigate?: (id: string) => void;
  /** Right-aligned slot — account menu, sign out. */
  trailing?: React.ReactNode;
}

export declare function TopNav(props: TopNavProps): JSX.Element;
