"use client";

import { format } from "date-fns";
import { ChevronRight, Clock, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Input,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useState } from "react";

import { useAuth } from "@/app/api/v1/auth/hooks/useAuth";

import { useOrders } from "../components/hooks/use-orders";

export default function OrdersPage(): JSX.Element | null {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");

  if (!user) {
    router.push("/auth/public/login?redirect=/app/orders");
    return null;
  }

  const filteredOrders = searchQuery
    ? orders.filter(
        (order) =>
          order.restaurantName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : orders;

  const activeOrders = filteredOrders.filter((order) =>
    [
      "pending",
      "confirmed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
    ].includes(order.status),
  );

  const completedOrders = filteredOrders.filter((order) =>
    ["delivered", "cancelled"].includes(order.status),
  );

  const getStatusBadge = (status: string): JSX.Element => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Confirmed
          </Badge>
        );
      case "preparing":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Preparing
          </Badge>
        );
      case "ready_for_pickup":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Ready for Pickup
          </Badge>
        );
      case "out_for_delivery":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
            Out for Delivery
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Orders</h1>
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by restaurant or order ID"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="active">
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">
                    Active Orders
                    {activeOrders.length > 0 && (
                      <Badge className="ml-2">{activeOrders.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">
                    Completed Orders
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(2)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-1">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-24" />
                                </div>
                              </div>
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : activeOrders.length > 0 ? (
                    <div className="space-y-4">
                      {activeOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                          onClick={() =>
                            router.push(`/app/order-tracking?id=${order.id}`)
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium">
                                {order.restaurantName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Order #{order.id.slice(-6)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                                <Image
                                  src="/placeholder.svg?height=48&width=48"
                                  alt={order.restaurantName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm">
                                    {format(
                                      new Date(order.estimatedDeliveryTime),
                                      "h:mm a, MMM d",
                                    )}
                                  </p>
                                </div>
                                {order.isDelivery && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {order.deliveryAddress?.split(",")[0]}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        You don't have any active orders
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/app/">Order Now</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="h-6 w-24" />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-1">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-24" />
                                </div>
                              </div>
                              <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : completedOrders.length > 0 ? (
                    <div className="space-y-4">
                      {completedOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                          onClick={() =>
                            router.push(
                              `/app/order-confirmation?id=${order.id}`,
                            )
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium">
                                {order.restaurantName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Order #{order.id.slice(-6)}
                              </p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                                <Image
                                  src="/placeholder.svg?height=48&width=48"
                                  alt={order.restaurantName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm">
                                    {format(
                                      new Date(order.createdAt),
                                      "MMM d, yyyy",
                                    )}
                                  </p>
                                </div>
                                <p className="text-sm font-medium">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Reorder
                              </Button>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        You don't have any completed orders
                      </p>
                      <Button className="mt-4" asChild>
                        <a href="/app/">Order Now</a>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
