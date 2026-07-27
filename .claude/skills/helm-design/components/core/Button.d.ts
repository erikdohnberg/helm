import * as React from "react";

/**
 * Helm action button. Labels name the decision, never the click —
 * "Record this decision", not "Save".
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** `destructive` is for irreversible removal only, not for errors. */
  variant?: "primary" | "outline" | "ghost" | "link" | "destructive";
  /** sm 34px · md 40px (editorial default) · lg 46px */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export interface IconButtonProps {
  children?: React.ReactNode;
  /** Required — becomes aria-label. */
  label: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export declare function Button(props: ButtonProps): JSX.Element;
export declare function IconButton(props: IconButtonProps): JSX.Element;
