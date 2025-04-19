import { Clock, Filter, Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  Input,
} from "next-vibe-ui/ui";
import type { JSX } from "react";

export default function MarketsPage(): JSX.Element {
  // Mock data for markets
  const markets = [
    {
      id: "m1",
      name: "Fresh Market",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Grocery", "Organic", "Local Produce"],
      rating: 4.8,
      reviews: 156,
      deliveryTime: 30,
      deliveryFee: 3.99,
      address: "123 Market St, Anytown, USA",
      promoted: true,
    },
    {
      id: "m2",
      name: "City Grocers",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Grocery", "Deli", "Bakery"],
      rating: 4.6,
      reviews: 98,
      deliveryTime: 35,
      deliveryFee: 2.99,
      address: "456 Main St, Anytown, USA",
    },
    {
      id: "m3",
      name: "Organic Oasis",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Organic", "Health Foods", "Supplements"],
      rating: 4.9,
      reviews: 203,
      deliveryTime: 40,
      deliveryFee: 4.99,
      address: "789 Green Ave, Anytown, USA",
      promoted: true,
    },
    {
      id: "m4",
      name: "Corner Pantry",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Convenience", "Snacks", "Beverages"],
      rating: 4.3,
      reviews: 67,
      deliveryTime: 20,
      deliveryFee: 1.99,
      address: "101 Corner St, Anytown, USA",
    },
    {
      id: "m5",
      name: "Farmers' Collective",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Local Produce", "Artisanal", "Organic"],
      rating: 4.7,
      reviews: 124,
      deliveryTime: 45,
      deliveryFee: 3.49,
      address: "202 Farm Rd, Anytown, USA",
    },
    {
      id: "m6",
      name: "International Foods",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["International", "Specialty", "Imported"],
      rating: 4.5,
      reviews: 89,
      deliveryTime: 35,
      deliveryFee: 3.99,
      address: "303 Global Blvd, Anytown, USA",
    },
    {
      id: "m7",
      name: "Quick Mart",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Convenience", "Essentials", "Snacks"],
      rating: 4.2,
      reviews: 45,
      deliveryTime: 15,
      deliveryFee: 1.49,
      address: "404 Fast Lane, Anytown, USA",
    },
    {
      id: "m8",
      name: "Gourmet Grocer",
      image: "/placeholder.svg?height=200&width=300",
      categories: ["Gourmet", "Specialty", "Prepared Foods"],
      rating: 4.8,
      reviews: 176,
      deliveryTime: 40,
      deliveryFee: 4.99,
      address: "505 Luxury Ave, Anytown, USA",
      promoted: true,
    },
  ];

  // Categories for filtering
  const categories = [
    { name: "All", value: "all" },
    { name: "Grocery", value: "grocery" },
    { name: "Organic", value: "organic" },
    { name: "Local Produce", value: "local-produce" },
    { name: "Convenience", value: "convenience" },
    { name: "Specialty", value: "specialty" },
    { name: "International", value: "international" },
  ];

  return (
    <main className="flex-1">
      <section className="w-full py-6 md:py-8 lg:py-10 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
              <p className="text-muted-foreground">
                Fresh groceries and essentials delivered to your door
              </p>
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search markets..."
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
            {markets.map((market) => (
              <Link href={`/app/market/${market.id}`} key={market.id}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={market.image || "/placeholder.svg"}
                      alt={market.name}
                      fill
                      className="object-cover transition-all hover:scale-105"
                    />
                    {market.promoted && (
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
                      <h3 className="font-semibold">{market.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {market.categories.join(", ")}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between p-4 pt-0 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {market.rating} ({market.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{market.deliveryTime} min</span>
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
              <h2 className="text-3xl font-bold">Become a Market Partner</h2>
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
    </main>
  );
}
