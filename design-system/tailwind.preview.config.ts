import type { Config } from "tailwindcss";

import base from "../tailwind.config";

/**
 * Preview-only Tailwind config.
 *
 * Reuses the app's real theme (tokens, radius scale, plugins) verbatim and only
 * repoints `content` at the preview HTML. If a preview renders differently from
 * the app, the cause is the markup in `previews/`, never a divergent theme.
 */
export default {
  ...base,
  content: ["./design-system/previews/**/*.html"],
} satisfies Config;
