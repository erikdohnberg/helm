import { TopNav } from "@/components/app-shell/top-nav";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <TopNav />
      <main className="p-6">{children}</main>
    </ToastProvider>
  );
}
