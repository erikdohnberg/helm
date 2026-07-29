/**
 * Pathnames that always use the light theme.
 *
 * These are the log surfaces — the record set at reading scale. Chart paper is
 * the ground for a document, so they do not follow the system theme the way
 * the signed-in app does.
 */
const MARKETING_PATHS = new Set([
  "/",
  "/landing",
  "/about",
  "/thanks",
  "/privacy",
  "/scorecard",
]);

export function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname);
}
