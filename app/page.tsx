import { redirect } from "next/navigation";

export default function Home() {
  // The site root lands on the drift model scorecard — how well the detection
  // actually works is the first thing a visitor should be able to read.
  // (Swap for "/landing" to restore the marketing page as the entry point, or
  // "/demo" for the record-of-intent screen.)
  //
  // Signed-in visitors never reach this: middleware sends them to the app
  // before the route renders. See PUBLIC_PATHS in middleware.ts.
  redirect("/scorecard");
}
