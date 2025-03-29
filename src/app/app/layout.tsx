import type { Metadata } from "next";
import type React from "react";
import type { JSX } from "react";

import { Toaster } from "@/components/ui/toaster";

import { CartProvider } from "./components/hooks/use-cart";
import { FavoritesProvider } from "./components/hooks/use-favorites";
import { OrderProvider } from "./components/hooks/use-orders";
import { RestaurantProvider } from "./components/hooks/use-restaurants";
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
  children: React.ReactNode;
  withSubMain?: boolean;
}): JSX.Element {
  return (
    <main className="m-auto">
      <RestaurantProvider>
        <CartProvider>
          <OrderProvider>
            <FavoritesProvider>
              <ReviewProvider>
                <RootLayout withSubMain={withSubMain}>{children}</RootLayout>
                <Toaster />
              </ReviewProvider>
            </FavoritesProvider>
          </OrderProvider>
        </CartProvider>
      </RestaurantProvider>
    </main>
  );
}
