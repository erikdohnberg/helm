import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The design system names its type scale (`text-outcome`, `text-help`) rather
 * than sizing it (`text-[22px]`). tailwind-merge only knows Tailwind's own
 * scale, so without this it reads every one of those as a text *colour* and
 * silently drops it when a colour class follows in the same `cn()` call —
 * `cn("text-heading text-foreground")` would render at the inherited size.
 *
 * Every custom key declared in `tailwind.config.ts` is registered here. Add a
 * token there, add it here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "heading",
            "page-title",
            "lede",
            "outcome",
            "section",
            "body",
            "control",
            "help",
            "identifier",
            "eyebrow",
            "rail",
          ],
        },
      ],
      shadow: [{ shadow: ["e0", "e1", "e2", "e3"] }],
      rounded: [{ rounded: ["log", "inner", "card"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
