import "./globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import type { JSX, ReactNode } from "react";

import { TooltipProvider } from "@/components/ui";
import { Toaster } from "@/components/ui/sonner";
import { envClient } from "@/next-portal/env/env-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wind AI",
  description: "Generate code using shadcn/nextui/tailwindcss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <TooltipProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="favicon.ico" type="image/ico" sizes="32x32" />
          {/* //TODO remove scripts after fixing the bug in iframe */}
          <Script
            type="module"
            src={
              "https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"
            }
            strategy="afterInteractive"
          />
          <Script
            noModule
            src={"https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"}
            strategy="afterInteractive"
          />
        </head>
        <body className={inter.className}>
          <Toaster richColors expand />

          {children}

          <Analytics />

          <GoogleAnalytics gaId={envClient.NEXT_PUBLIC_GA_ID} />
        </body>
      </html>
    </TooltipProvider>
  );
}
