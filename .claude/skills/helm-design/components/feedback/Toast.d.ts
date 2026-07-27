import * as React from "react";

/** Transient confirmation. States what is now true — never congratulates. */
export interface ToastProps {
  message: string;
  /** `error` adds a 3px destructive left rule. */
  tone?: "default" | "error";
  style?: React.CSSProperties;
}
export interface ToastViewportProps {
  children?: React.ReactNode;
}
/** A standing condition on the surface, not an event. */
export interface AlertProps {
  title?: string;
  children?: React.ReactNode;
  /** `destructive` for irreversible consequences only. */
  tone?: "default" | "destructive";
}

export declare function Toast(props: ToastProps): JSX.Element;
export declare function ToastViewport(props: ToastViewportProps): JSX.Element;
export declare function Alert(props: AlertProps): JSX.Element;
