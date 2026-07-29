"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Sections arrive as the reader reaches them: fade plus a 4px translate at the
 * `considered` duration — the same motion the system gives a disclosure.
 *
 * Anything already in view on load is shown immediately, so the first screen
 * never animates in. Reduced motion drops the translate. A reader without
 * JavaScript sees the whole record — the record is the point, and it must not
 * depend on script to be legible (see `RevealNoScript`).
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      data-shown={shown ? "" : undefined}
      className={
        "translate-y-1 opacity-0 transition-[opacity,transform] duration-considered ease-record " +
        "data-[shown]:translate-y-0 data-[shown]:opacity-100 motion-reduce:translate-y-0 " +
        // A printed board pack is a first-class output of a record, and the
        // observer never fires for sections below the fold when printing.
        "print:translate-y-0 print:opacity-100"
      }
    >
      {children}
    </div>
  );
}

/**
 * Render once per page that uses `Reveal`. Without script the sections would
 * stay at opacity 0 forever; this hands the reader the document instead.
 */
export function RevealNoScript() {
  return (
    <noscript>
      <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
    </noscript>
  );
}
