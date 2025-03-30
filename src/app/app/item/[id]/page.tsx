import { ArrowLeft, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { mockMenuItems } from "../../components/data/menu-items";
import { mockRestaurants } from "../../components/data/restaurants";

interface ItemPageProps {
  params: {
    id: string;
  };
}

export default function ItemPage({ params }: ItemPageProps): JSX.Element {
  const item = mockMenuItems.find((item) => item.id === params.id);
  const restaurant =
    item && mockRestaurants.find((r) => r.id === item.restaurantId);

  // Related items from the same restaurant and category
  const relatedItems =
    (item &&
      mockMenuItems
        .filter(
          (i) =>
            i.restaurantId === item.restaurantId &&
            i.category === item.category &&
            i.id !== item.id,
        )
        .slice(0, 4)) ||
    [];
  if (!item || !restaurant) {
    return notFound();
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <Link
            href={`/app/restaurant/${restaurant.id}`}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to {restaurant.name}</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{item.name}</h1>
                <p className="text-muted-foreground">{item.description}</p>
                <div className="text-2xl font-bold">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Quantity</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className="w-8 text-center">1</span>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Special Instructions</h3>
                <textarea
                  className="w-full rounded-md border p-2 text-sm"
                  placeholder="Add any special requests or allergies..."
                  rows={3}
                />
              </div>
              <Button size="lg" className="w-full">
                Add to Cart - ${item.price.toFixed(2)}
              </Button>
            </div>
          </div>
          {relatedItems?.length > 0 && (
            <div className="mt-12 space-y-4">
              <h2 className="text-2xl font-bold">You Might Also Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                {relatedItems.map((relatedItem) => (
                  <Card key={relatedItem.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <Image
                        src={relatedItem.image || "/placeholder.svg"}
                        alt={relatedItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{relatedItem.name}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {relatedItem.description}
                      </p>
                      <div className="mt-2 font-medium">
                        ${relatedItem.price.toFixed(2)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/app/item/${relatedItem.id}`}>
                          View Item
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
