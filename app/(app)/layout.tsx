import { TopNav } from "@/components/app-shell/top-nav";
import { ToastProvider } from "@/components/ui/toast";
import { DemoDataProvider } from "@/lib/demo-data-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DemoDataProvider>
        <TopNav />
        <main className="p-6">{children}</main>
      </DemoDataProvider>
    </ToastProvider>
  );
}
