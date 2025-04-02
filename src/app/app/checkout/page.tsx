"use client";

import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

import { useCart } from "../components/hooks/use-cart";
import { useOrders } from "../components/hooks/use-orders";
import { useRestaurants } from "../components/hooks/use-restaurants";

export default function CheckoutPage(): JSX.Element | null {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    items,
    restaurantId,
    getSubtotal,
    getDeliveryFee,
    getServiceFee,
    getTax,
    getTotal,
    clearCart,
  } = useCart();
  const { placeOrder, isLoading } = useOrders();
  const { getRestaurantById } = useRestaurants();

  const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isDelivery, setIsDelivery] = useState(true);

  // Credit card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  if (!user) {
    router.push("/auth/public/login");
    return null;
  }

  if (items.length === 0) {
    router.push("/app/cart");
    return null;
  }

  // Add proper return type to the handlePlaceOrder function
  const handlePlaceOrder = async (): Promise<void> => {
    if (!restaurant) {
      toast({
        title: "Error",
        description: "Restaurant information is missing",
        variant: "destructive",
      });
      return;
    }

    if (isDelivery && (!address || !city || !zip)) {
      toast({
        title: "Error",
        description: "Please fill in all delivery details",
        variant: "destructive",
      });
      return;
    }

    if (
      paymentMethod === "card" &&
      (!cardNumber || !cardExpiry || !cardCvv || !cardName)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        id: item.menuItem.id,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        image: item.menuItem.image,
      }));

      const deliveryAddress = isDelivery
        ? `${address}, ${city}, ${zip}`
        : undefined;

      const order = await placeOrder({
        userId: user.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: orderItems,
        total: getTotal(),
        subtotal: getSubtotal(),
        deliveryFee: getDeliveryFee(),
        serviceFee: getServiceFee(),
        tax: getTax(),
        deliveryAddress,
        deliveryInstructions: deliveryInstructions || undefined,
        isDelivery,
      });

      // Clear the cart after successful order
      clearCart();

      // Redirect to order confirmation page
      router.push(`/app/order-confirmation?id=${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 py-8">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_350px]">
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                  <CardDescription>
                    Choose how you want to receive your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button
                      variant={isDelivery ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setIsDelivery(true)}
                    >
                      Delivery
                    </Button>
                    <Button
                      variant={!isDelivery ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => setIsDelivery(false)}
                      disabled={!restaurant?.pickup}
                    >
                      Pickup
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isDelivery && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                    <CardDescription>
                      Enter your delivery details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
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
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Select your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs
                    defaultValue="card"
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value)}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="card">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      <TabsTrigger value="cash">Cash</TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="mt-4 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name-on-card">Name on Card</Label>
                        <Input
                          id="name-on-card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="paypal" className="mt-4">
                      <div className="rounded-lg border p-4 text-center">
                        <p>
                          You will be redirected to PayPal to complete your
                          purchase after reviewing your order.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="cash" className="mt-4">
                      <div className="rounded-lg border p-4 text-center">
                        <p>
                          Pay with cash upon{" "}
                          {isDelivery ? "delivery" : "pickup"}.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  {restaurant && (
                    <CardDescription>From {restaurant.name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} × {item.menuItem.name}
                      </span>
                      <span>
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="my-4 border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${getSubtotal().toFixed(2)}</span>
                    </div>
                    {isDelivery && (
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
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By placing your order, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
