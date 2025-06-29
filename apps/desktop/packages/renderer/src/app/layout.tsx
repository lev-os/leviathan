import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { DevModeProvider } from "@/contexts/dev-mode-context";
import { DevModeIndicator } from "@/components/dev-mode-indicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Auto Trader",
  description: "MoonPup Labs Auto Trader",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DevModeProvider>
            <div className="flex h-screen bg-background text-foreground">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4">{children}</main>
              <DevModeIndicator />
            </div>
          </DevModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
