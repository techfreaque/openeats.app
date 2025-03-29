import type { Metadata } from "next";
import type React from "react";
import type { JSX } from "react";

import { Layout } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Next-Vibe",
  description: "Start vibing here.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <Layout>
      {children}
      <Toaster />
    </Layout>
  );
}
