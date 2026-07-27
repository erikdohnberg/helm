"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/**
 * e2 — transient, dismissible, leaves no trace when closed.
 *
 * A confirmation states what is now true: "Anchored 21 Feb. Three outcomes now
 * stand in FY26 Q1." It never congratulates, and it never discloses a cost the
 * action should have stated in the same breath.
 */
export type ToastTone = "default" | "error";

export function Toast({
  message,
  tone = "default",
  className,
}: {
  message: ReactNode;
  tone?: ToastTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto max-w-prose rounded-lg border border-border bg-popover px-4 py-3 text-help text-foreground shadow-e2",
        "animate-considered-in",
        tone === "error" && "border-l-[3px] border-l-destructive",
        className
      )}
    >
      {message}
    </div>
  );
}

export function ToastViewport({ children }: { children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2"
    >
      {children}
    </div>
  );
}

/**
 * A standing condition on a surface — flat, bordered, never elevated. If it
 * can be ignored it is an Alert; if it requires a decision it is a Modal.
 *
 * `destructive` is for irreversible destruction only, and the copy offers the
 * better alternative rather than a warning label: "Retiring removes this
 * outcome from the record. Replacing keeps it."
 */
export function Alert({
  title,
  children,
  tone = "default",
  className,
}: {
  title?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "destructive";
  className?: string;
}) {
  const destructive = tone === "destructive";
  return (
    <div
      className={cn(
        "flex items-start gap-3.5 rounded-log border border-border bg-card px-5 py-card-compact",
        destructive && "border-l-[3px] border-l-destructive",
        className
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
        className={cn(
          "mt-0.5 flex-none",
          destructive ? "text-destructive" : "text-muted-foreground"
        )}
      >
        <circle cx="12" cy="12" r="9" />
        {destructive ? (
          <>
            <path d="M12 8v5" strokeLinecap="round" />
            <path d="M12 17h.01" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M12 11v5" strokeLinecap="round" />
            <path d="M12 8h.01" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div className="flex flex-col gap-1">
        {title && (
          <div className="text-control font-semibold text-foreground">
            {title}
          </div>
        )}
        {children && (
          <div className="max-w-help text-help text-muted-foreground">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

type ToastMessage = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ShowToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used within ToastProvider");
  return show;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((message, tone = "default") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => showToast, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport>
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} tone={t.tone} />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}
