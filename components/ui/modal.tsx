"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * e3 — requires a decision. Dialogs only, always with a scrim. If it can be
 * ignored, it is not a Modal; use an Alert on the surface instead.
 *
 * Focus is trapped while open and returned to the trigger on close, per the
 * accessibility baseline.
 */
export type ModalProps = {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width of the panel. */
  width?: string;
  onClose?: () => void;
};

export function Modal({
  open = true,
  title,
  description,
  children,
  footer,
  width = "520px",
  onClose,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* The scrim is a real control, so dismissing by clicking away is
       * reachable from the keyboard too. It sits behind the panel and is
       * skipped in the tab order, since Escape is the keyboard route out. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Dismiss without recording anything"
        onClick={() => onClose?.()}
        className="absolute inset-0 cursor-default bg-[oklch(0.20_0.04_245_/_0.55)]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className={cn(
          "relative w-full rounded-lg border border-border-strong bg-popover p-card text-body text-foreground shadow-e3",
          "animate-considered-in outline-none"
        )}
      >
        {title && (
          <h2 id={titleId} className="font-serif text-outcome text-foreground">
            {title}
          </h2>
        )}
        {description && (
          <p
            id={descriptionId}
            className="mt-2 max-w-help text-help text-muted-foreground"
          >
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
        {footer && (
          <div className="mt-7 flex flex-wrap justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
