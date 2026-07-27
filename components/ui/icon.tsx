import { cn } from "@/lib/utils";

/**
 * The instrument set. Drawn from chart and instrument marking rather than
 * generic UI: 1.5px stroke, round caps, 24px grid, never filled.
 *
 * The first six carry product meaning and may not be used decoratively:
 *
 * | glyph         | means                                                    |
 * | ------------- | -------------------------------------------------------- |
 * | `anchor`      | anchored outcome — the official direction of the quarter |
 * | `helm-mark`   | the product mark. Masthead and empty grounds, never inline |
 * | `bearing-off` | drift. The only glyph permitted to carry brass           |
 * | `shackle`     | attached work — joined to an outcome, adds no commitment |
 * | `sounding`    | progress against a target. Depth, not a score            |
 * | `beacon`      | replacement — what now stands where something else stood |
 *
 * The rest are utility glyphs drawn to the same hand so the set reads as one.
 * `provenance` is mandatory on every link that leaves Helm.
 */
const PATHS = {
  anchor: (
    <>
      <circle cx="12" cy="4.6" r="2.1" />
      <path d="M12 6.7V21" />
      <path d="M7.5 10h9" />
      <path d="M4 14.5a8 8 0 0 0 16 0" />
    </>
  ),
  "helm-mark": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.9" />
      <path d="M12 3.5V2M12 22v-1.5M3.5 12H2M22 12h-1.5M6 6 5 5M18 6l1-1M6 18l-1 1M18 18l1 1" />
    </>
  ),
  "bearing-off": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 17.5 6.5" />
      <path d="M13.5 6.5h4v4" />
      <path d="M12 12 8 19" strokeDasharray="2 3" />
    </>
  ),
  shackle: (
    <>
      <circle cx="8.5" cy="12" r="4" />
      <path d="M12.5 12H20" />
      <path d="m17 8.5 3.5 3.5L17 15.5" />
    </>
  ),
  sounding: (
    <>
      <path d="M4 5h16" />
      <path d="M12 5v11" />
      <path d="m8 12.5 4 4 4-4" />
      <path d="M5 20h14" strokeDasharray="2 3" />
    </>
  ),
  beacon: (
    <>
      <path d="m12 3 4.5 8h-9z" />
      <path d="M6.5 15h11" />
      <path d="M8.5 20h7" />
    </>
  ),
  "half-mast": (
    <>
      <path d="M12 4v9" />
      <path d="M12 13 8 21" />
      <path d="M12 13l4 8" />
      <path d="M6 8h12" />
    </>
  ),
  provenance: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </>
  ),
  heading: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  logged: <path d="M20 6 9 17l-5-5" />,
  watch: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  "more-vertical": (
    <g fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </g>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export type IconProps = {
  name: IconName;
  /** Rendered size in px. The glyph is drawn on a 24px grid. */
  size?: number;
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "name" | "children">;

/** Instrument glyph. Takes `currentColor` — brass only on a drift surface. */
export function Icon({ name, size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("block flex-none", className)}
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * The mark: a ship's wheel that is also a target — who is steering, and what
 * they said they were steering toward. Single path group, `currentColor`,
 * 96px grid, no fills.
 *
 * Minimum 20px. Below that the target ring closes — use the wordmark alone.
 */
export function HelmMark({
  size = 26,
  className,
  title,
  ...props
}: { size?: number; title?: string } & Omit<
  React.SVGProps<SVGSVGElement>,
  "children"
>) {
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("block flex-none", className)}
      {...props}
    >
      <g stroke="currentColor" strokeLinecap="round">
        <g strokeWidth="7">
          <circle cx="48" cy="48" r="30.5" />
          <circle cx="48" cy="48" r="17.5" />
          <circle cx="48" cy="48" r="5.5" />
        </g>
        <g strokeWidth="5.5">
          <path d="M48 12.5V6.5" />
          <path d="M48 83.5v6" />
          <path d="M12.5 48h-6" />
          <path d="M83.5 48h6" />
          <path d="M22.9 22.9 18.6 18.6" />
          <path d="M73.1 22.9l4.3-4.3" />
          <path d="M22.9 73.1l-4.3 4.3" />
          <path d="M73.1 73.1l4.3 4.3" />
        </g>
        <g strokeWidth="8.5">
          <path d="M48 5.5v.5" />
          <path d="M48 90v.5" />
          <path d="M5.5 48H6" />
          <path d="M90 48h.5" />
          <path d="m18.1 18.1.4.4" />
          <path d="m77.9 18.1-.4.4" />
          <path d="m18.1 77.9.4-.4" />
          <path d="m77.9 77.9-.4-.4" />
        </g>
      </g>
    </svg>
  );
}
