"use client";

import * as React from "react";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Underline tabs. The active tab is marked by weight plus a 2px ink rule —
 * brass is drift and nothing else, so it never marks a selection.
 */
export type TabItem = {
  id: string;
  label: React.ReactNode;
  /** Observed counts sit in mono beside the label. */
  count?: number;
  disabled?: boolean;
  /** When present the tab renders as a link rather than a button. */
  href?: string;
};

const TAB_BASE =
  "inline-flex items-center gap-1.5 py-3 text-control transition-colors duration-quick ease-out";

function tabTone(active: boolean, disabled?: boolean) {
  return cn(
    active
      ? "font-semibold text-foreground shadow-[inset_0_-2px_0_var(--foreground)]"
      : "font-normal text-muted-foreground hover:text-foreground",
    disabled && "cursor-not-allowed text-subtle-foreground opacity-60"
  );
}

export function Tabs({
  tabs,
  active,
  onSelect,
  label,
  className,
}: {
  tabs: ReadonlyArray<TabItem>;
  active: string;
  onSelect?: (id: string) => void;
  /** Names the tab set for assistive tech. */
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("flex gap-7 border-b border-border", className)}
    >
      {tabs.map((tab) => {
        const on = tab.id === active;
        const content = (
          <>
            {tab.label}
            {tab.count != null && (
              <span className="font-mono text-[11.5px] text-subtle-foreground">
                {tab.count}
              </span>
            )}
          </>
        );

        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={on ? "page" : undefined}
              className={cn(TAB_BASE, tabTone(on, tab.disabled))}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={tab.disabled}
            onClick={() => onSelect?.(tab.id)}
            className={cn(TAB_BASE, tabTone(on, tab.disabled))}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

export function Breadcrumb({
  items,
  className,
}: {
  items: ReadonlyArray<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2.5 text-help text-muted-foreground",
        className
      )}
    >
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            {last || !item.href ? (
              <span
                aria-current={last ? "page" : undefined}
                className={cn(last && "font-medium text-foreground")}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            )}
            {!last && <Icon name="chevron" size={14} className="opacity-50" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
