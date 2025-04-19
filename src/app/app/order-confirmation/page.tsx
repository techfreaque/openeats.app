import { CheckCircle, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "next-vibe-ui/ui";
import type { JSX } from "react";

export default function OrderConfirmationPage(): JSX.Element {
  const orderNumber = `DH${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;
  const estimatedDelivery = new Date(
    Date.now() + 30 * 60 * 1000,
  ).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-bold">Order Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Your order #{orderNumber} has been placed successfully.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Burger Joint</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Estimated Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Main St, Anytown, USA
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src="/placeholder.svg?height=64&width=64"
                          alt="Cheeseburger"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Cheeseburger</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: 2
                        </p>
                      </div>
                      <div className="font-medium">$17.98</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md">
                        <Image
                          src="/placeholder.svg?height=64&width=64"
                          alt="French Fries"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">French Fries</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: 1
                        </p>
                      </div>
                      <div className="font-medium">$3.99</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$21.97</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>$2.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>$1.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>$1.81</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$28.76</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" asChild>
                  <Link href="/app/order-tracking">Track Order</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/app">Return to Home</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
