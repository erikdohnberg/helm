import * as React from "react";

/**
 * Dialog at e3 with a scrim — the only elevation that demands a decision.
 * Traps focus and returns it to the trigger on close.
 */
export interface ModalProps {
  open?: boolean;
  /** Serif, phrased as the decision: "What stops if this enters?" */
  title?: string;
  /** One muted line stating the cost, before it happens. */
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  onClose?: () => void;
}

export declare function Modal(props: ModalProps): JSX.Element | null;
