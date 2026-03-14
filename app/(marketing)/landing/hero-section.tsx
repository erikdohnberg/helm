import Link from "next/link";

function NauticalOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Radial glow behind headline */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_38%,rgba(255,255,255,0.14),transparent_45%)]" />
      {/* Soft vignette */}
      <div
        className="absolute inset-0 opacity-[0.92]"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(27,42,56,0.4) 100%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Sparse, atmospheric grid */}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={180 + i * 180}
            x2="1440"
            y2={180 + i * 180}
            stroke="white"
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
            stroke="white"
            strokeWidth="0.6"
          />
        ))}

        {/* Large, soft compass rose — cropped upper-right */}
        <g transform="translate(1320 -80)" opacity="0.5">
          <circle cx="0" cy="0" r="320" fill="none" stroke="white" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="200" fill="none" stroke="white" strokeWidth="0.7" />
          <line x1="0" y1="-320" x2="0" y2="320" stroke="white" strokeWidth="0.8" />
          <line x1="-320" y1="0" x2="320" y2="0" stroke="white" strokeWidth="0.8" />
          <line x1="-226" y1="-226" x2="226" y2="226" stroke="white" strokeWidth="0.5" />
          <line x1="226" y1="-226" x2="-226" y2="226" stroke="white" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="20" fill="white" fillOpacity="0.6" />
        </g>

        {/* Few faint route lines — slightly more visible */}
        <path
          d="M-60 320 C280 400, 500 260, 780 340 S1200 400, 1520 320"
          fill="none"
          stroke="white"
          strokeWidth="0.7"
          strokeDasharray="6 14"
          opacity="0.35"
        />
        <path
          d="M40 580 C320 500, 620 660, 920 560 S1280 460, 1540 560"
          fill="none"
          stroke="white"
          strokeWidth="0.6"
          strokeDasharray="6 16"
          opacity="0.28"
        />
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-navy">
      <NauticalOverlay />

      <div className="relative mx-auto max-w-[900px] px-6 py-[104px] text-center md:py-[120px]">
        <p className="text-lg font-semibold tracking-[0.04em] text-white/90">
          Helm
        </p>

        <h1 className="mx-auto mt-3 max-w-[860px] text-5xl font-semibold tracking-tight text-white md:text-7xl md:leading-[0.95]">
          <span className="block">Keep strategy</span>
          <span className="block">
            on <span className="font-bold">course.</span>
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-[760px] text-lg leading-8 text-white/95 md:text-[22px] md:leading-9">
          Helm is an AI team member that listens where strategy happens, turns
          signals into outcome charters, and nudges teams when strategic drift
          begins.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="#waitlist"
            className="inline-flex min-w-[210px] items-center justify-center rounded-xl bg-brass px-7 py-4 text-base font-medium text-white shadow-[0_14px_34px_rgba(194,168,120,0.35)] transition-all hover:translate-y-[-1px] hover:bg-brass/90"
          >
            Join the waitlist
          </Link>

          <p className="text-sm text-white/85">
            Currently in private prototype.
          </p>
        </div>
      </div>
    </section>
  );
}