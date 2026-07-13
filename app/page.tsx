import { redirect } from "next/navigation";

export default function Home() {
  // Demo deployment: the site root lands directly on the Helm output screen.
  // (Revert to "/landing" to restore the marketing page as the entry point.)
  redirect("/demo");
}
