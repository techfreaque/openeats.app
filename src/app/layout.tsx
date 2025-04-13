import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "next-vibe/shared/constants";
import type React from "react";
import type { JSX } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { initializeApi } from "@/lib/init-api";

import { TranslationProvider } from "../packages/next-vibe/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} Partner Portal`,
  description: "Partner portal for restaurants, drivers, and administrators",
};

// Initialize API on server side
initializeApi();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TranslationProvider>{children}</TranslationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
