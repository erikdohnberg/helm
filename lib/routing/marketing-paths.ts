/** Pathnames served by the (marketing) route group — always use light theme. */
const MARKETING_PATHS = new Set([
  "/",
  "/landing",
  "/about",
  "/thanks",
  "/privacy",
]);

export function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname);
}
