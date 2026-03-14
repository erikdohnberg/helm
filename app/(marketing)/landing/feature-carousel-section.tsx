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

function SlackLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
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

const iconClass = "h-5 w-5 text-[#C2A878]";
const panelClass =
  "rounded-2xl border border-black/5 bg-gradient-to-b from-white to-[#F8F6F1] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_30px_rgba(16,24,40,0.06)]";

function VisualFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${panelClass} min-h-[360px] w-full overflow-hidden p-6`}>
      {children}
    </div>
  );
}

function SourceChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 shadow-sm">
      {icon}
      <span className="text-sm text-[#444]">{label}</span>
    </div>
  );
}

function MiniCard({
  title,
  lines = 3,
}: {
  title: string;
  lines?: number;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-[#111]">{title}</div>
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2 rounded bg-black/8"
            style={{ width: `${90 - i * 18}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function ListeningVisual() {
  return (
    <VisualFrame>
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="grid grid-cols-3 gap-3">
          <SourceChip icon={<Video className={iconClass} />} label="Meetings" />
          <SourceChip
            icon={<MessageSquare className={iconClass} />}
            label="Strategy"
          />
          <SourceChip icon={<SlackLogoIcon className={iconClass} />} label="Slack" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-black/10" />
          <ArrowRight className="h-5 w-5 text-[#C2A878]" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C2A878]/40 bg-white text-lg font-semibold text-[#1B2A38] shadow-sm">
            H
          </div>
          <ArrowRight className="h-5 w-5 text-[#C2A878]" />
          <div className="h-px flex-1 bg-black/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniCard title="Emerging signals" lines={4} />
          <MiniCard title="Themes detected" lines={4} />
        </div>
      </div>
    </VisualFrame>
  );
}

function DraftOutcomeVisual() {
  return (
    <VisualFrame>
      <div className="grid h-full grid-cols-[1fr_auto_1.2fr] items-center gap-4">
        <div className="space-y-3">
          <MiniCard title="Operator feedback" lines={3} />
          <MiniCard title="Transcript excerpt" lines={3} />
        </div>
        <ArrowRight className="h-6 w-6 text-[#C2A878]" />
        <div className="rounded-2xl border border-[#C2A878]/30 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className={iconClass} />
            <div className="text-sm font-semibold text-[#111]">Draft Outcome Charter</div>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#777]">Outcome</div>
              <div className="mt-1 h-2 w-4/5 rounded bg-black/10" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#777]">Metric</div>
              <div className="mt-1 h-2 w-2/3 rounded bg-black/10" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-[#777]">Trade-offs</div>
              <div className="mt-1 space-y-2">
                <div className="h-2 w-5/6 rounded bg-black/10" />
                <div className="h-2 w-3/5 rounded bg-black/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function AlignmentVisual() {
  return (
    <VisualFrame>
      <div className="flex h-full flex-col justify-between">
        <div className="grid grid-cols-2 gap-4">
          <MiniCard title="Draft charter" lines={4} />
          <div className="rounded-xl border border-[#C2A878]/30 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <ClipboardCheck className={iconClass} />
              <div className="text-sm font-medium text-[#111]">Leadership review</div>
            </div>
            <div className="mt-4 h-2 w-5/6 rounded bg-black/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-black/10" />
          </div>
        </div>

        <div className="my-4 flex items-center justify-center">
          <ArrowRight className="h-6 w-6 rotate-90 text-[#C2A878]" />
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-[#111]">FY26 Q1</div>
            <div className="rounded-full bg-[#C2A878]/15 px-2.5 py-1 text-xs text-[#8A6A2F]">
              Anchored
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniCard title="Outcome A" lines={2} />
            <MiniCard title="Outcome B" lines={2} />
            <MiniCard title="Outcome C" lines={2} />
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function ThreadVisual() {
  return (
    <VisualFrame>
      <div className="space-y-4">
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-[#111]">Anchored outcome</div>
          <div className="mt-3 h-2 w-4/5 rounded bg-black/10" />
          <div className="mt-2 h-2 w-2/3 rounded bg-black/10" />
        </div>

        <div className="rounded-2xl border border-[#C2A878]/25 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <SlackLogoIcon className={iconClass} />
            <div className="text-sm font-medium text-[#111]">Shared alignment thread</div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-[#F7F6F2] p-3">
              <div className="h-2 w-3/4 rounded bg-black/10" />
              <div className="mt-2 h-2 w-1/2 rounded bg-black/10" />
            </div>
            <div className="ml-6 rounded-lg bg-[#F7F6F2] p-3">
              <div className="h-2 w-2/3 rounded bg-black/10" />
              <div className="mt-2 h-2 w-1/3 rounded bg-black/10" />
            </div>
            <div className="ml-10 rounded-lg bg-[#F7F6F2] p-3">
              <div className="h-2 w-1/2 rounded bg-black/10" />
            </div>
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function NudgeVisual() {
  return (
    <VisualFrame>
      <div className="grid h-full grid-cols-[1.4fr_auto_1fr] items-center gap-4">
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm opacity-70">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#999]" />
            <div className="text-sm font-medium text-[#555]">Quiet thread</div>
          </div>
          <div className="space-y-3">
            <div className="h-2 w-3/4 rounded bg-black/10" />
            <div className="h-2 w-1/2 rounded bg-black/10" />
            <div className="text-xs text-[#888]">No activity for 7 days</div>
          </div>
        </div>

        <ArrowRight className="h-6 w-6 text-[#C2A878]" />

        <div className="rounded-2xl border border-[#C2A878]/35 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Bell className={iconClass} />
            <div className="text-sm font-medium text-[#111]">Helm nudge</div>
          </div>
          <div className="rounded-lg bg-[#F7F6F2] p-3">
            <div className="h-2 w-5/6 rounded bg-black/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-black/10" />
          </div>
        </div>
      </div>
    </VisualFrame>
  );
}

function MemoryVisual() {
  return (
    <VisualFrame>
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm opacity-70">
          <div className="text-sm font-medium text-[#555] line-through">Old priority</div>
          <div className="mt-3 h-2 w-3/4 rounded bg-black/10" />
          <div className="mt-2 h-2 w-1/2 rounded bg-black/10" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="h-6 w-6 text-[#C2A878]" />
          <div className="rounded-full bg-[#C2A878]/15 px-2.5 py-1 text-[11px] text-[#8A6A2F]">
            Replaces
          </div>
        </div>

        <div className="rounded-xl border border-[#C2A878]/35 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-[#111]">New priority</div>
          <div className="mt-3 h-2 w-4/5 rounded bg-black/10" />
          <div className="mt-2 h-2 w-2/3 rounded bg-black/10" />
        </div>
      </div>
    </VisualFrame>
  );
}

const slides = [
  {
    eyebrow: "01 — Helm listens",
    title: "Helm listens where strategy happens",
    description:
      "Helm connects to the conversations where strategy already happens, collecting the signals that shape quarterly direction.",
    bullets: ["Meeting transcripts", "Strategy discussions", "Slack conversations"],
    visual: <ListeningVisual />,
  },
  {
    eyebrow: "02 — Draft outcomes",
    title: "Helm turns signals into draft outcomes",
    description:
      "Related signals are grouped into draft Outcome Charters so leadership can shape priorities before the quarter begins.",
    bullets: ["Cluster related inputs", "Create draft charters", "Capture reasoning"],
    visual: <DraftOutcomeVisual />,
  },
  {
    eyebrow: "03 — Prepare alignment",
    title: "Helm prepares alignment before the quarter",
    description:
      "Draft outcomes move through review and become anchored priorities for the quarter.",
    bullets: ["Review", "Refine", "Anchor to the quarter"],
    visual: <AlignmentVisual />,
  },
  {
    eyebrow: "04 — Shared context",
    title: "Helm creates shared alignment threads",
    description:
      "Every outcome gets a shared thread so teams can discuss updates and decisions with the full context attached.",
    bullets: ["Shared Slack thread", "Decision context", "Visible updates"],
    visual: <ThreadVisual />,
  },
  {
    eyebrow: "05 — Drift detection",
    title: "Helm notices when alignment fades",
    description:
      "When activity drops off, Helm nudges the team to reconnect before strategic drift becomes invisible.",
    bullets: ["Detect inactivity", "Send a reminder", "Reconnect teams"],
    visual: <NudgeVisual />,
  },
  {
    eyebrow: "06 — Strategic memory",
    title: "Helm preserves strategic memory",
    description:
      "When priorities shift, Helm keeps the replacement history visible so trade-offs do not disappear.",
    bullets: ["Record what changed", "Preserve trade-offs", "Keep a visible lineage"],
    visual: <MemoryVisual />,
  },
];

export function FeatureCarouselSection() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <section className="border-t border-border py-20 md:py-24" aria-label="How Helm works">
      <div className="rounded-[28px] border border-black/5 bg-[#FCFBF8] p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_60px_rgba(16,24,40,0.06)] md:p-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8A6A2F]">
              {slide.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#111] md:text-4xl">
              {slide.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#555]">
              {slide.description}
            </p>
            <ul className="mt-6 space-y-3">
              {slide.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#333]">
                  <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#C2A878]" />
                  <span className="text-base leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>{slide.visual}</div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-black/5 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#666]">
            {slide.eyebrow}
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1))
              }
              className="rounded-xl border border-black/10 bg-white p-3 text-[#555] transition hover:border-[#C2A878]/50 hover:text-[#1B2A38]"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`transition ${
                    i === current
                      ? "h-2.5 w-8 rounded-full bg-[#C2A878]"
                      : "h-2.5 w-2.5 rounded-full bg-black/12 hover:bg-black/20"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrent((i) => (i === slides.length - 1 ? 0 : i + 1))
              }
              className="rounded-xl border border-black/10 bg-white p-3 text-[#555] transition hover:border-[#C2A878]/50 hover:text-[#1B2A38]"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}