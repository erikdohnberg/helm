import { TopNav } from "@/components/app-shell/top-nav";
import { AppSessionReady } from "@/components/auth/app-session-ready";
import { ToastProvider } from "@/components/ui/toast";
import { DemoDataProvider } from "@/lib/demo-data-context";

/**
 * The app surface: working screens — settings, tables, dialogs, editing.
 * Editorial density, 1080px measure, the masthead's 104px rail carried through
 * as the page gutter.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DemoDataProvider>
        <TopNav />
        <main className="mx-auto max-w-page px-6 py-10 md:px-10 md:py-12">
          <AppSessionReady>{children}</AppSessionReady>
        </main>
      </DemoDataProvider>
    </ToastProvider>
  );
}
