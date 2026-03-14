"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  MessageSquare,
  Pin,
  Video,
} from "lucide-react";

const iconClass = "h-6 w-6 shrink-0 text-brass";
const iconLabelClass = "text-xs text-text-secondary";

function SlackLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <title>Slack</title>
      <rect x="3" y="2" width="6" height="4" rx="1.5" />
      <rect x="15" y="2" width="6" height="4" rx="1.5" />
      <rect x="3" y="18" width="6" height="4" rx="1.5" />
      <rect x="15" y="18" width="6" height="4" rx="1.5" />
      <rect x="2" y="9" width="4" height="6" rx="1.5" />
      <rect x="18" y="9" width="4" height="6" rx="1.5" />
      <rect x="9" y="3" width="6" height="4" rx="1.5" />
      <rect x="9" y="17" width="6" height="4" rx="1.5" />
    </svg>
  );
}

const slides = [
  {
    title: "Helm listens where strategy happens",
    content: (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-text-secondary">
        <li>meeting transcripts</li>
        <li>strategy discussions</li>
        <li>Slack conversations</li>
      </ul>
    ),
    diagram: (
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <Video className={iconClass} />
            <span className={iconLabelClass}>Meetings</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageSquare className={iconClass} />
            <span className={iconLabelClass}>Strategy</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <SlackLogoIcon className="h-7 w-7 text-brass" />
            <span className={iconLabelClass}>Slack</span>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-brass" />
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-brass/60 bg-white text-lg font-semibold text-brass">
            H
          </div>
          <span className={iconLabelClass}>Helm</span>
        </div>
      </div>
    ),
  },
  {
    title: "Helm turns signals into draft outcomes",
    content: (
      <p className="mt-4 text-text-secondary leading-relaxed">
        Related signals cluster into draft Outcome Charters.
      </p>
    ),
    diagram: (
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <MessageSquare
              key={i}
              className="h-5 w-5 text-text-secondary/60"
              aria-hidden
            />
          ))}
        </div>
        <ArrowRight className={iconClass} />
        <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-brass/50 bg-white px-3 py-2">
          <FileText className={iconClass} />
          <span className="text-xs font-medium text-text-primary">
            Draft charter
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Helm prepares alignment before the quarter",
    content: (
      <p className="mt-4 text-text-secondary leading-relaxed">
        Leadership reviews and anchors outcomes before the quarter begins.
      </p>
    ),
    diagram: (
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1 rounded-lg border border-brass/40 bg-white px-4 py-2">
          <ClipboardCheck className={iconClass} />
          <span className={iconLabelClass}>Review</span>
        </div>
        <ArrowRight className="h-5 w-5 rotate-[-90deg] text-brass" />
        <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-brass/50 bg-white px-4 py-2">
          <Pin className={iconClass} />
          <span className="text-xs font-medium text-text-primary">Anchor</span>
        </div>
      </div>
    ),
  },
  {
    title: "Helm creates shared alignment threads",
    content: (
      <p className="mt-4 text-text-secondary leading-relaxed">
        Each outcome has a shared Slack thread with full context.
      </p>
    ),
    diagram: (
      <div className="flex w-full flex-col items-center gap-3">
        <span className="text-xs font-medium text-text-primary">Outcome</span>
        <ArrowRight className="h-5 w-5 text-brass" />
        <div className="flex w-full flex-col gap-2 rounded-lg border border-brass/30 bg-white p-3">
          <div className="flex items-center gap-2">
            <SlackLogoIcon className="h-5 w-5 text-brass" />
            <span className="text-xs font-medium text-text-secondary">
              Thread
            </span>
          </div>
          <div className="h-2 w-full rounded bg-text-secondary/20" />
          <div className="h-2 w-[75%] rounded bg-text-secondary/20" />
          <div className="h-2 w-1/2 rounded bg-text-secondary/20" />
        </div>
      </div>
    ),
  },
  {
    title: "Helm notices when alignment fades",
    content: (
      <p className="mt-4 text-text-secondary leading-relaxed">
        Helm detects inactivity and nudges the team to reconnect.
      </p>
    ),
    diagram: (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1 opacity-50">
          <MessageSquare className="h-6 w-6 text-text-secondary" />
          <span className={iconLabelClass}>Activity</span>
        </div>
        <ArrowRight className={iconClass} />
        <div className="flex flex-col items-center gap-1 rounded-lg border-2 border-brass/50 bg-white px-3 py-2">
          <Bell className={iconClass} />
          <span className="text-xs font-medium text-text-primary">Nudge</span>
        </div>
      </div>
    ),
  },
  {
    title: "Helm preserves strategic memory",
    content: (
      <p className="mt-4 text-text-secondary leading-relaxed">
        When priorities shift, Helm records what replaced what.
      </p>
    ),
    diagram: (
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-lg border border-brass/40 bg-white/90 px-3 py-2 text-xs line-through opacity-70 text-text-secondary">
          Old priority
        </div>
        <ArrowRight className="h-5 w-5 rotate-[-90deg] text-brass" />
        <div className="rounded-lg border-2 border-brass/50 bg-white px-3 py-2 text-xs font-medium text-text-primary">
          New priority
        </div>
      </div>
    ),
  },
];

const slideLabels = [
  "Helm listens",
  "Helm drafts outcomes",
  "Helm prepares alignment",
  "Helm creates threads",
  "Helm nudges drift",
  "Helm preserves memory",
];

export function FeatureCarouselSection() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <section className="py-[120px]" aria-label="How Helm works">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-text-primary">
            {slide.title}
          </h2>
          <div className="mt-4">{slide.content}</div>
        </div>
        <div className="flex min-h-[200px] shrink-0 items-center justify-center rounded-xl border border-border bg-white p-10 shadow-sm lg:w-80">
          {slide.diagram}
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          {current + 1} of {slides.length} — {slideLabels[current]}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1))}
            className="rounded-lg border border-border bg-white p-2 text-text-secondary transition-colors hover:border-brass/40 hover:bg-white hover:text-brass"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            className="flex gap-2"
            role="tablist"
            aria-label="Slide indicators"
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Slide ${i + 1}: ${slideLabels[i]}`}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-colors ${
                  i === current
                    ? "h-2.5 w-2.5 bg-brass"
                    : "h-2 w-2 bg-text-secondary/25 hover:bg-text-secondary/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1))}
            className="rounded-lg border border-border bg-white p-2 text-text-secondary transition-colors hover:border-brass/40 hover:bg-white hover:text-brass"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[10px] text-text-secondary/80">
          Slack and the Slack logo are trademarks of Slack Technologies, LLC.
        </p>
      </div>
    </section>
  );
}
