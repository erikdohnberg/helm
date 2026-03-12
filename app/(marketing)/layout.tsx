import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen py-24 px-6 flex flex-col">
      <div className="mx-auto max-w-2xl w-full flex-1">{children}</div>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>Made with ❤️, AI and ☕️ in Toronto, Canada.</p>
        <p className="mt-1">
          Built by{" "}
          <Link
            href="https://www.erikdohnberg.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Erik Dohnberg
          </Link>
          .
        </p>
      </footer>
    </main>
  );
}
