import Link from "next/link";

function NauticalOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Grid lines */}
        {Array.from({ length: 17 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 37.5}
            x2={800}
            y2={i * 37.5}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 38}
            y1={0}
            x2={i * 38}
            y2={600}
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        {/* Compass rose - simplified, centered upper-right area */}
        <g transform="translate(620, 80)">
          <circle cx={0} cy={0} r={36} fill="none" stroke="white" strokeWidth="0.5" />
          <line x1={0} y1={-36} x2={0} y2={36} stroke="white" strokeWidth="0.5" />
          <line x1={-36} y1={0} x2={36} y2={0} stroke="white" strokeWidth="0.5" />
          <line x1={-25} y1={-25} x2={25} y2={25} stroke="white" strokeWidth="0.5" />
          <line x1={25} y1={-25} x2={-25} y2={25} stroke="white" strokeWidth="0.5" />
          <circle cx={0} cy={0} r={4} fill="white" />
        </g>
      </svg>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative w-full bg-navy">
      <NauticalOverlay />
      <div className="relative mx-auto max-w-[820px] px-6 py-[120px] text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Helm
        </h1>
        <p className="mt-4 text-2xl font-medium tracking-tight text-white">
          Keep strategy on course.
        </p>
        <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-white/95">
          Helm is an AI team member that keeps quarterly outcomes aligned —
          listening to the conversations where strategy happens, turning signals
          into outcome charters, and nudging teams when strategic drift begins.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link
            href="#waitlist"
            className="rounded-md bg-brass px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brass/90"
          >
            Join the waitlist
          </Link>
          <p className="text-sm text-white/70">
            Currently in private prototype.
          </p>
        </div>
      </div>
    </section>
  );
}
