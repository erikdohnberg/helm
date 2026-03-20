/** Default route after successful sign-in; swap for setup-based routing later. */
export const POST_AUTH_ROUTE = "/settings" as const;

export function getPostAuthRoute(): typeof POST_AUTH_ROUTE {
  return POST_AUTH_ROUTE;
}
