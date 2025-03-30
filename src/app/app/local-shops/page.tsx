import { Clock, Filter, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LocalShopsPage(): JSX.Element {
  // Mock data for local shops
  const shops = [
    {
      id: "s1",
      name: "Artisan Bakery",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Bakery", "Pastries", "Coffee"],
      rating: 4.9,
      reviews: 187,
      deliveryTime: 25,
      deliveryFee: 2.99,
      address: "123 Baker St, Anytown, USA",
      promoted: true,
    },
    {
      id: "s2",
      name: "Flower Boutique",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Flowers", "Gifts", "Plants"],
      rating: 4.7,
      reviews: 112,
      deliveryTime: 40,
      deliveryFee: 4.99,
      address: "456 Bloom Ave, Anytown, USA",
    },
    {
      id: "s3",
      name: "Craft Beer Shop",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Beer", "Wine", "Spirits"],
      rating: 4.8,
      reviews: 156,
      deliveryTime: 35,
      deliveryFee: 3.99,
      address: "789 Brew Blvd, Anytown, USA",
      promoted: true,
    },
    {
      id: "s4",
      name: "Bookstore Cafe",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Books", "Coffee", "Gifts"],
      rating: 4.6,
      reviews: 98,
      deliveryTime: 30,
      deliveryFee: 2.49,
      address: "101 Read St, Anytown, USA",
    },
    {
      id: "s5",
      name: "Artisan Cheese Shop",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Cheese", "Gourmet", "Specialty"],
      rating: 4.9,
      reviews: 143,
      deliveryTime: 45,
      deliveryFee: 3.99,
      address: "202 Dairy Lane, Anytown, USA",
    },
    {
      id: "s6",
      name: "Pet Supplies Plus",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Pet Supplies", "Pet Food", "Toys"],
      rating: 4.5,
      reviews: 87,
      deliveryTime: 35,
      deliveryFee: 2.99,
      address: "303 Paws Ave, Anytown, USA",
    },
    {
      id: "s7",
      name: "Stationery Store",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Stationery", "Office Supplies", "Gifts"],
      rating: 4.4,
      reviews: 76,
      deliveryTime: 30,
      deliveryFee: 2.49,
      address: "404 Paper St, Anytown, USA",
    },
    {
      id: "s8",
      name: "Toy Emporium",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Toys", "Games", "Children"],
      rating: 4.7,
      reviews: 124,
      deliveryTime: 40,
      deliveryFee: 3.49,
      address: "505 Play Blvd, Anytown, USA",
      promoted: true,
    },
  ];

  // Categories for filtering
  const categories = [
    { name: "All", value: "all" },
    { name: "Bakery", value: "bakery" },
    { name: "Flowers", value: "flowers" },
    { name: "Books", value: "books" },
    { name: "Pet Supplies", value: "pet-supplies" },
    { name: "Gifts", value: "gifts" },
    { name: "Specialty", value: "specialty" },
  ];

  return (
    <div className="flex-1">
      <section className="w-full py-6 md:py-8 lg:py-10 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Local Shops</h1>
              <p className="text-muted-foreground">
                Support local businesses with same-day delivery
              </p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search shops..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={category.value === "all" ? "default" : "outline"}
                className="rounded-full"
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-6">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {shops.map((shop) => (
              <Link href={`/shop/${shop.id}`} key={shop.id}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={shop.image || "/placeholder.svg"}
                      alt={shop.name}
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                    {shop.promoted && (
                      <Badge
                        variant="secondary"
                        className="absolute left-2 top-2 bg-primary text-primary-foreground"
                      >
                        Promoted
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{shop.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {shop.categories.join(", ")}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {shop.rating} ({shop.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{shop.deliveryTime} min</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Own a Local Shop?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join our platform and reach more customers with our fair,
                transparent pricing.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/app/partners">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
