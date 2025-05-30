import type { Metadata } from "next";
import { Toaster } from "next-vibe-ui/ui";
import type { JSX, ReactNode } from "react";

import RootLayout from "./components/layout";

export const metadata: Metadata = {
  title: "OpenEats - Local Food Delivery",
  description:
    "Order from local restaurants with free delivery and pickup. Open source and community-driven.",
  generator: "v0.dev",
};

export default function Layout({
  children,
  withSubMain = false,
}: {
  children: ReactNode;
  withSubMain?: boolean;
}): JSX.Element {
  return (
    <main className="m-auto">
      <RootLayout withSubMain={withSubMain}>{children}</RootLayout>
      <Toaster />
    </main>
  );
}
