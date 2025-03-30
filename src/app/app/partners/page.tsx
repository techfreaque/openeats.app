import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PartnersPage(): JSX.Element {
  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Partner With OpenEats
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join our platform and grow your business with fair, transparent
                pricing and no hidden fees.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="#get-started">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#learn-more">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">Why Partner With Us?</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Lower Fees</h3>
                    <p className="text-muted-foreground">
                      We charge only a small processing fee for online payments,
                      not the 15-30% that other platforms take.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Own Your Customer Data</h3>
                    <p className="text-muted-foreground">
                      Build direct relationships with your customers without a
                      middleman.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Simple Integration</h3>
                    <p className="text-muted-foreground">
                      Our platform integrates easily with your existing systems
                      and workflows.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Community-Driven</h3>
                    <p className="text-muted-foreground">
                      Join a platform that puts local businesses and communities
                      first.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Restaurant partner"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        id="get-started"
      >
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Partner Options
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Restaurants</CardTitle>
                <CardDescription>For food service businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Online ordering system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Delivery and pickup options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Menu management tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Customer reviews and ratings</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Only 5% processing fee for online payments. No monthly fees.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply Now</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Markets</CardTitle>
                <CardDescription>
                  For grocery and specialty stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Inventory management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Same-day delivery options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Product categorization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Special order handling</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Only 4% processing fee for online payments. No monthly fees.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply Now</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Local Shops</CardTitle>
                <CardDescription>
                  For retail and specialty businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Product showcase</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Local delivery options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>In-store pickup coordination</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Custom branding options</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Only 3.5% processing fee for online payments. No monthly fees.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Apply Now</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32" id="learn-more">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                1
              </div>
              <h3 className="text-xl font-bold">Apply</h3>
              <p className="mt-2 text-muted-foreground">
                Fill out our simple application form to get started.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                2
              </div>
              <h3 className="text-xl font-bold">Onboard</h3>
              <p className="mt-2 text-muted-foreground">
                Set up your menu or inventory with our easy-to-use tools.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                3
              </div>
              <h3 className="text-xl font-bold">Go Live</h3>
              <p className="mt-2 text-muted-foreground">
                Start accepting orders through our platform.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                4
              </div>
              <h3 className="text-xl font-bold">Grow</h3>
              <p className="mt-2 text-muted-foreground">
                Expand your customer base and increase your revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of local businesses already thriving on our
                platform.
              </p>
            </div>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/app/partners/apply">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
