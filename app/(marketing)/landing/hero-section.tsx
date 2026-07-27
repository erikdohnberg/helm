import { LandingHeroCta } from "@/components/auth/landing-hero-cta";
import { HelmMark } from "@/components/ui/icon";

/**
 * Chart paper, not dark glass.
 *
 * The category has one look: dark gradient hero, glassy translucent cards, a
 * single bright accent on near-black. Helm is deliberately the inverse — so
 * the chart grid and the cropped compass rose are drawn in ink at low opacity
 * on a warm ground, and the headline is a printed serif at weight 300.
 */
function ChartGround() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-foreground"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={180 + i * 180}
            x2="1440"
            y2={180 + i * 180}
            stroke="currentColor"
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={120 + i * 260}
            y1="0"
            x2={120 + i * 260}
            y2="900"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        ))}

        {/* The compass rose, cropped — the mark's own geometry. */}
        <g transform="translate(1340 -60)" opacity="0.8">
          <circle
            cx="0"
            cy="0"
            r="320"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle
            cx="0"
            cy="0"
            r="200"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <circle
            cx="0"
            cy="0"
            r="72"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="-320"
            x2="0"
            y2="320"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <line
            x1="-320"
            y1="0"
            x2="320"
            y2="0"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <line
            x1="-226"
            y1="-226"
            x2="226"
            y2="226"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <line
            x1="226"
            y1="-226"
            x2="-226"
            y2="226"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </g>

        {/* Route lines — dashed, the way a chart marks a plotted course. */}
        <path
          d="M-60 320 C280 400, 500 260, 780 340 S1200 400, 1520 320"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          strokeDasharray="6 14"
        />
        <path
          d="M40 620 C320 540, 620 700, 920 600 S1280 500, 1540 600"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="6 16"
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      <ChartGround />

      <div className="relative mx-auto grid max-w-page grid-cols-1 px-6 py-20 md:grid-cols-[var(--rail)_minmax(0,1fr)] md:px-10 md:py-28">
        <div
          aria-hidden
          className="mb-8 flex flex-row items-center gap-3 md:mb-0 md:flex-col md:gap-2.5"
        >
          <span className="font-mono text-rail uppercase text-brass">00</span>
          <span className="h-px w-10 bg-brass md:h-[46px] md:w-px" />
        </div>

        <div className="flex flex-col gap-8 md:pl-rail-indent">
          <div className="flex items-center gap-3">
            <HelmMark size={30} title="Helm" />
            <span className="font-serif text-[22px] font-medium tracking-[0.01em]">
              Helm
            </span>
          </div>

          <h1 className="max-w-[16ch] font-serif text-display">
            Keep strategy
            <br />
            on <em className="font-normal not-italic">course.</em>
          </h1>

          <p className="max-w-prose font-serif text-lede text-foreground">
            Helm listens where strategy actually happens, writes what the
            quarter committed to, and says so when new work contradicts it.
          </p>

          <LandingHeroCta />
        </div>
      </div>
    </section>
  );
}
