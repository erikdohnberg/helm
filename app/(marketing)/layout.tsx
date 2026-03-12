export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen py-24 px-6">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}
