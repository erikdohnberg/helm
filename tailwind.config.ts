import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Every value here resolves to a CSS custom property declared in
 * `styles/design-system/tokens/`. Nothing in this file invents a value — if a
 * colour, size or duration is not in the token layer, it does not exist in
 * Helm. See `lib/design/README.md` for the rules that decide what may be added.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── the ink ramp — hue 245, chroma rises with darkness ── */
        ink: {
          "025": "var(--ink-025)",
          "050": "var(--ink-050)",
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          800: "var(--ink-800)",
          900: "var(--ink-900)",
          950: "var(--ink-950)",
        },

        /* ── named hues — three, each with exactly one job ──
         * navy  → ink, structure, primary action, dark ground
         * sea   → attribution: observed by Helm, never authored by a person
         * brass → drift, and nothing else
         * red   → irreversible destruction only */
        navy: "var(--navy)",
        "navy-deep": "var(--navy-deep)",
        sea: "var(--sea)",
        "sea-wash": "var(--sea-wash)",
        brass: "var(--brass)",
        "brass-soft": "var(--brass-soft)",
        "brass-wash": "var(--brass-wash)",
        drift: "var(--drift)",
        "drift-wash": "var(--drift-wash)",

        /* ── semantic ── */
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        sunken: "var(--sunken)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        "subtle-foreground": "var(--subtle-foreground)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        input: "var(--input)",
        ring: "var(--ring)",
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },

      /* The scale from §04 Type. Names, not sizes — `text-outcome` says what
       * the text is for; `text-[22px]` says nothing. */
      fontSize: {
        display: [
          "var(--text-display)",
          {
            lineHeight: "var(--leading-display)",
            letterSpacing: "var(--tracking-display)",
            fontWeight: "300",
          },
        ],
        heading: [
          "var(--text-heading)",
          {
            lineHeight: "var(--leading-heading)",
            letterSpacing: "var(--tracking-heading)",
            fontWeight: "300",
          },
        ],
        "page-title": [
          "var(--text-page-title)",
          {
            lineHeight: "var(--leading-title)",
            letterSpacing: "var(--tracking-title)",
          },
        ],
        lede: ["var(--text-lede)", { lineHeight: "1.42", fontWeight: "300" }],
        outcome: [
          "var(--text-outcome)",
          { lineHeight: "var(--leading-outcome)", fontWeight: "500" },
        ],
        section: ["var(--text-section)", { lineHeight: "1.5" }],
        body: ["var(--text-body)", { lineHeight: "var(--leading-body)" }],
        control: ["var(--text-sm)", { lineHeight: "1.5" }],
        help: ["var(--text-help)", { lineHeight: "var(--leading-help)" }],
        identifier: ["var(--text-mono)", { lineHeight: "1.5" }],
        eyebrow: [
          "var(--text-eyebrow)",
          {
            lineHeight: "1.4",
            letterSpacing: "var(--tracking-eyebrow)",
            fontWeight: "600",
          },
        ],
        rail: [
          "10.5px",
          { lineHeight: "1.4", letterSpacing: "var(--tracking-rail)" },
        ],
      },

      spacing: {
        rail: "var(--rail)",
        "rail-indent": "var(--rail-indent)",
        row: "var(--row-h)",
        "row-compact": "var(--row-h-compact)",
        control: "var(--control-h)",
        "control-compact": "var(--control-h-compact)",
        card: "var(--card-pad)",
        "card-compact": "var(--card-pad-compact)",
        field: "var(--field-gap)",
        "field-compact": "var(--field-gap-compact)",
        section: "var(--section-gap)",
        "section-compact": "var(--section-gap-compact)",
        /* 44×44 minimum hit area, achieved with padding. */
        target: "44px",
      },

      maxWidth: {
        prose: "var(--measure-prose)",
        help: "var(--measure-help)",
        page: "var(--measure-page)",
      },

      borderRadius: {
        /* 8px controls in the app; 2px on the record. That single change is
         * what stops a log surface reading like a dashboard. */
        DEFAULT: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "var(--radius-inner)",
        inner: "var(--radius-inner)",
        log: "var(--radius-log)",
        card: "12px",
      },

      /* e0 flat: part of the record · e1: actionable object
       * e2: transient, dismissible · e3: requires a decision
       * A surface may not borrow another level's shadow for emphasis. */
      boxShadow: {
        e0: "none",
        e1: "var(--e1)",
        e2: "var(--e2)",
        e3: "var(--e3)",
      },

      transitionDuration: {
        instant: "var(--dur-instant)",
        quick: "var(--dur-quick)",
        considered: "var(--dur-considered)",
        deliberate: "var(--dur-deliberate)",
      },

      transitionTimingFunction: {
        out: "var(--ease-out)",
        record: "var(--ease-record)",
      },

      keyframes: {
        "helm-shimmer": {
          "0%": { backgroundPosition: "-220px 0" },
          "100%": { backgroundPosition: "220px 0" },
        },
        "helm-drift-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "none" },
        },
      },

      animation: {
        shimmer: "helm-shimmer 1.4s linear infinite",
        "drift-in": "helm-drift-in var(--dur-deliberate) var(--ease-record)",
        "considered-in":
          "helm-drift-in var(--dur-considered) var(--ease-record)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
