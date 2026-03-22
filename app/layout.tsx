import type { Metadata } from "next";

import "./globals.css";

import { auth } from "@/auth";
import { SessionProvider } from "@/components/auth/session-provider";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";

export const metadata: Metadata = {
  title: "Helm",
  description: "Keep strategy on course.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SessionProvider session={session}>
          <AppThemeProvider>{children}</AppThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
