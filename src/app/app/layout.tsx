import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { JSX } from "react";

import { Toaster } from "@/components/ui/toaster";

import { OrderProvider } from "./components/hooks/use-orders";
import { ReviewProvider } from "./components/hooks/use-reviews";
import RootLayout from "./components/layout";

export const metadata: Metadata = {
  title: "OpenEats - Local Food Delivery",
  description:
    "Order from local restaurants with free delivery and pickup. Open source and community-driven.",
  generator: "v0.dev",
};

export default function Layout({
  children,
  withSubMain = true,
}: {
  children: ReactNode;
  withSubMain?: boolean;
}): JSX.Element {
  return (
    <main className="m-auto">
      <OrderProvider>
        <ReviewProvider>
          <RootLayout withSubMain={withSubMain}>{children}</RootLayout>
          <Toaster />
        </ReviewProvider>
      </OrderProvider>
    </main>
  );
}
