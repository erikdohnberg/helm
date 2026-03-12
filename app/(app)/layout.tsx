import { TopNav } from "@/components/app-shell/top-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main className="p-6">{children}</main>
    </>
  );
}
