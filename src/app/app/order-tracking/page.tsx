import { ArrowLeft, Clock, MapPin, Phone } from "lucide-react";
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
  Progress,
  Separator,
} from "next-vibe-ui/ui";
import type { JSX } from "react";

export default function OrderTrackingPage(): JSX.Element {
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
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">Order #{orderNumber}</p>
            <div className="mt-8 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Status</CardTitle>
                  <CardDescription>
                    Estimated delivery: {estimatedDelivery}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Order Placed</span>
                      <span>On the Way</span>
                      <span>Delivered</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full">
                        <Image
                          src="/placeholder.svg?height=64&width=64"
                          alt="Driver"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">John D.</p>
                        <p className="text-sm text-muted-foreground">
                          Your Dasher
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="sr-only">Call driver</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Order received</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - 15 * 60 * 1000,
                          ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Preparing your order</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - 10 * 60 * 1000,
                          ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Dasher on the way</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            Date.now() - 5 * 60 * 1000,
                          ).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 h-6 w-px bg-muted" />
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-muted-foreground">
                          Order delivered
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estimated: {estimatedDelivery}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Main St, Anytown, USA
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Estimated Delivery Time</p>
                      <p className="text-sm text-muted-foreground">
                        {estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Burger Joint</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cheeseburger x2</span>
                      <span>$17.98</span>
                    </div>
                    <div className="flex justify-between">
                      <span>French Fries x1</span>
                      <span>$3.99</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>$28.76</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/app/order-confirmation">View Receipt</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
