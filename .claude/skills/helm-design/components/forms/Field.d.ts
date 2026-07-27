import * as React from "react";

/**
 * Helm form primitives at editorial density: 40px control height, 8px radius,
 * a 1px `--border-strong` edge, and a 2px verdigris focus ring at 2px offset.
 */
export interface LabelProps {
  children?: React.ReactNode;
  htmlFor?: string;
  muted?: boolean;
  style?: React.CSSProperties;
}
export interface HelpProps {
  children?: React.ReactNode;
  /** `error` adds the destructive colour and a warning glyph. */
  tone?: "muted" | "error";
}
export interface InputProps {
  label?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  type?: string;
  /** A fact, not a reassurance. */
  help?: string;
  /** Names the cause and the next move; never blames the person. */
  error?: string;
  disabled?: boolean;
  /** Identifiers (Slack IDs, folder IDs) are set in mono. */
  mono?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}
export interface TextareaProps {
  label?: string;
  id?: string;
  value?: string;
  rows?: number;
  placeholder?: string;
  help?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
}
export interface SelectProps {
  label?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  help?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}
export interface RadioOptionProps {
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
  /** States the consequence of choosing this option. */
  hint?: string;
}
export interface InlineEditProps {
  value?: React.ReactNode;
  editing?: boolean;
  level?: "outcome" | "body";
  style?: React.CSSProperties;
}

export declare function Label(props: LabelProps): JSX.Element;
export declare function Help(props: HelpProps): JSX.Element;
export declare function Input(props: InputProps): JSX.Element;
export declare function Textarea(props: TextareaProps): JSX.Element;
export declare function Select(props: SelectProps): JSX.Element;
export declare function RadioOption(props: RadioOptionProps): JSX.Element;
export declare function InlineEdit(props: InlineEditProps): JSX.Element;
