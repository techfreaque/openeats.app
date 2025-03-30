"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCart } from "../components/hooks/use-cart";
import { useRestaurants } from "../components/hooks/use-restaurants";

export default function CartPage(): React.JSX.Element {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    getTotal,
    restaurantId,
    clearCart,
  } = useCart();

  const { getRestaurantById } = useRestaurants();
  const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Handle form submission
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background">
          <div className="container flex h-16 items-center">
            <Link href="/app" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 py-8">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <Button className="mt-6" asChild>
                  <Link href="/app">Browse Restaurants</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link
            href={restaurantId ? `/app/restaurant/${restaurantId}` : "/"}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">
              {restaurant ? `Back to ${restaurant.name}` : "Back to Home"}
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold">Your Cart</h1>
                {restaurant && (
                  <p className="text-muted-foreground">
                    From {restaurant.name}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-md">
                      <Image
                        src={item.menuItem.image || "/placeholder.svg"}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{item.menuItem.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)}
                      </p>
                      {item.specialInstructions && (
                        <p className="text-xs text-muted-foreground">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                        <span className="sr-only">Decrease quantity</span>
                      </Button>
                      <span className="w-4 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Increase quantity</span>
                      </Button>
                    </div>
                    <div className="font-medium">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-bold">Delivery Options</h2>
                <Tabs
                  defaultValue="delivery"
                  className="mt-4"
                  value={deliveryType}
                  onValueChange={(value) =>
                    setDeliveryType(value as "delivery" | "pickup")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="delivery">Delivery</TabsTrigger>
                    <TabsTrigger value="pickup">Pickup</TabsTrigger>
                  </TabsList>
                  <TabsContent value="delivery" className="mt-4 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter your address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instructions">
                        Delivery Instructions (Optional)
                      </Label>
                      <Input
                        id="instructions"
                        placeholder="Add instructions for the driver"
                        value={deliveryInstructions}
                        onChange={(e) =>
                          setDeliveryInstructions(e.target.value)
                        }
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="pickup" className="mt-4 space-y-4">
                    {restaurant && (
                      <div className="rounded-lg border p-4">
                        <h3 className="font-medium">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.address}
                        </p>
                        <p className="mt-2 text-sm">
                          Ready for pickup in 15-20 minutes
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  {deliveryType === "delivery" && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Delivery Fee
                      </span>
                      <span>${getDeliveryFee().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>${getServiceFee().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      if (deliveryType === "delivery" && !deliveryAddress) {
                        alert("Please enter a delivery address");
                        return;
                      }
                      router.push("/app/checkout");
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to clear your cart?")
                      ) {
                        clearCart();
                      }
                    }}
                  >
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>
              <div className="mt-4 rounded-lg border p-4">
                <h3 className="font-medium">Promo Code</h3>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Enter code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
