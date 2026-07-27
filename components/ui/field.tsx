import * as React from "react";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Form controls at editorial density.
 *
 * Helper text is a fact, not a reassurance. Errors name the cause and the next
 * move — never "Something went wrong", never "You entered an invalid ID".
 *
 * The focus ring is applied globally in `styles/design-system/base.css`, so
 * nothing here opts into it.
 */
const CONTROL = cn(
  "w-full rounded-lg border border-border-strong bg-card text-control text-foreground",
  "placeholder:text-subtle-foreground",
  "disabled:cursor-not-allowed disabled:border-border disabled:bg-sunken disabled:text-subtle-foreground"
);

export type LabelProps = {
  muted?: boolean;
} & React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, muted = false, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-[13px] font-semibold",
        muted ? "text-subtle-foreground" : "text-foreground",
        className
      )}
      {...props}
    />
  );
}

export type HelpProps = {
  tone?: "muted" | "error";
} & React.HTMLAttributes<HTMLParagraphElement>;

export function Help({
  className,
  tone = "muted",
  children,
  ...props
}: HelpProps) {
  return (
    <p
      className={cn(
        "flex max-w-help items-start gap-1.5 text-[12.5px]",
        tone === "error" ? "text-destructive" : "text-subtle-foreground",
        className
      )}
      {...props}
    >
      {tone === "error" && (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
          className="mt-[3px] flex-none"
        >
          <path d="M12 8v5" />
          <path d="M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      <span>{children}</span>
    </p>
  );
}

type WrapperProps = {
  label?: React.ReactNode;
  id?: string;
  help?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  children: React.ReactNode;
};

function Wrapper({ label, id, help, error, disabled, children }: WrapperProps) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <Label htmlFor={id} muted={disabled}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <Help tone="error">{error}</Help>
      ) : help ? (
        <Help>{help}</Help>
      ) : null}
    </div>
  );
}

export type InputProps = {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  /** Identifiers are tabular — Slack user IDs, outcome IDs. */
  mono?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, help, error, mono, disabled, className, ...props }, ref) => (
    <Wrapper label={label} id={id} help={help} error={error} disabled={disabled}>
      <input
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          "h-control px-3.5",
          mono && "font-mono",
          error && "border-destructive",
          className
        )}
        {...props}
      />
    </Wrapper>
  )
);
Input.displayName = "Input";

export type TextareaProps = {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, id, help, error, rows = 3, disabled, className, ...props },
    ref
  ) => (
    <Wrapper label={label} id={id} help={help} error={error} disabled={disabled}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          "resize-y px-3.5 py-[11px] leading-[1.6]",
          error && "border-destructive",
          className
        )}
        {...props}
      />
    </Wrapper>
  )
);
Textarea.displayName = "Textarea";

export type SelectProps = {
  label?: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
  placeholder?: string;
  options?: ReadonlyArray<{ value: string; label: string }>;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      help,
      error,
      placeholder,
      options,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => (
    <Wrapper label={label} id={id} help={help} error={error} disabled={disabled}>
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={cn(
          CONTROL,
          "h-control px-3",
          error && "border-destructive",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
    </Wrapper>
  )
);
Select.displayName = "Select";

/**
 * An option in a decision. The consequence is written under the label, because
 * any action that displaces something says what it displaces in the same
 * breath — never in a follow-up toast.
 */
export type RadioOptionProps = {
  hint?: React.ReactNode;
  children: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "children">;

export function RadioOption({
  hint,
  children,
  className,
  id,
  ...props
}: RadioOptionProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 py-1.5"
      >
        <input
          id={id}
          type="radio"
          className="mt-[3px] h-4 w-4 flex-none accent-navy"
          {...props}
        />
        <span className="text-control text-foreground">{children}</span>
      </label>
      {hint && (
        <p className="ml-7 mt-1.5 max-w-prose text-help text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * Dotted underline at rest signals editability; the field materialises in
 * place with no layout shift.
 */
export type InlineEditProps = {
  value: React.ReactNode;
  editing?: boolean;
  level?: "outcome" | "body";
  className?: string;
};

export function InlineEdit({
  value,
  editing = false,
  level = "outcome",
  className,
}: InlineEditProps) {
  return (
    <span
      className={cn(
        "font-serif",
        level === "outcome" ? "text-[20px]" : "text-body",
        editing
          ? "-mx-[9px] -my-[5px] rounded-md border border-foreground px-2 py-1 outline outline-2 outline-offset-2 outline-ring"
          : "cursor-text border-b border-dashed border-border-strong pb-[3px]",
        className
      )}
    >
      {value}
    </span>
  );
}

/**
 * The provenance glyph is mandatory on anything leaving Helm — a reader must
 * be able to tell that a link ends the record.
 */
export type ExternalLinkProps = {
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink({
  children,
  className,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-control text-foreground underline decoration-ink-300 underline-offset-4 hover:decoration-current",
        className
      )}
      {...props}
    >
      {children}
      <Icon name="provenance" size={13} className="opacity-65" />
    </a>
  );
}
