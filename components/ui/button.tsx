import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Buttons say what enters the record — `Record this decision`, `Anchor an
 * outcome`, `Replace and record` — never `Save`, `Submit` or `OK`. If a label
 * works in any product, it is wrong in this one.
 *
 * `destructive` is for irreversible destruction only. Not "error", not "bad".
 */
export type ButtonVariant =
  | "primary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:border-ink-800 hover:bg-ink-800",
  outline: "border-border-strong bg-card text-foreground hover:bg-sunken",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-sunken hover:text-foreground",
  link: "border-none bg-transparent px-1 text-foreground underline decoration-ink-300 underline-offset-4 hover:decoration-current",
  destructive:
    "border-destructive bg-transparent text-destructive hover:bg-sunken",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-control-compact rounded-md px-3.5 text-[13px]",
  md: "h-control px-[18px] text-control",
  lg: "h-[46px] px-6 text-body",
};

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium",
        "transition-colors duration-quick ease-out",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-subtle-foreground",
        SIZES[size],
        VARIANTS[variant],
        variant === "link" && "h-auto",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

/**
 * 44×44 hit area, glyph stays visually small. Targets are not optional and not
 * a polish-pass concern.
 */
export type IconButtonProps = {
  /** Required — an icon button with no accessible name is not a control. */
  label: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">;

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, label, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex h-target w-target flex-none items-center justify-center rounded-lg",
        "text-muted-foreground transition-colors duration-quick ease-out",
        "hover:bg-sunken hover:text-foreground",
        "disabled:cursor-not-allowed disabled:text-subtle-foreground disabled:hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
);
IconButton.displayName = "IconButton";
