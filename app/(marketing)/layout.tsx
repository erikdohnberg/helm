import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-page-bg">
      <div className="flex-1">{children}</div>
      <footer className="bg-navy py-10 text-center text-sm text-white/90">
        <p>Made with ❤️, AI and ☕️ in Toronto, Canada.</p>
        <p className="mt-1">
          Built by{" "}
          <Link
            href="https://www.erikdohnberg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-white/95"
          >
            Erik Dohnberg
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
