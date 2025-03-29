import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage(): JSX.Element {
  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                About OpenEats
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                A free and open source food delivery platform for local
                communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                OpenEats was created with a simple mission: to provide a fair,
                transparent, and community-driven alternative to commercial food
                delivery platforms. We believe in supporting local businesses
                without the excessive fees that cut into their already thin
                margins.
              </p>
              <p className="mt-4 text-muted-foreground md:text-lg">
                By making our platform open source, we ensure that it remains
                accountable to the community it serves, rather than to
                shareholders or venture capital.
              </p>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Community restaurant"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold">For Customers</h3>
                <p className="mt-2 text-muted-foreground">
                  Browse local restaurants, place orders, and enjoy your
                  favorite food with transparent pricing and no hidden fees.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold">For Restaurants</h3>
                <p className="mt-2 text-muted-foreground">
                  Join our platform for free and keep more of your profits. We
                  charge only a small processing fee for online payments.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold">For Drivers</h3>
                <p className="mt-2 text-muted-foreground">
                  Earn fair compensation for your work with transparent pay and
                  flexible hours. Keep 100% of your tips.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Open source community"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Open Source</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                OpenEats is built and maintained by a community of developers
                who believe in the power of open source. Our code is freely
                available for anyone to use, modify, and contribute to.
              </p>
              <p className="mt-4 text-muted-foreground md:text-lg">
                By being open source, we ensure that our platform remains
                transparent, secure, and aligned with the interests of the
                community it serves.
              </p>
              <div className="mt-6">
                <Button variant="outline" className="gap-2">
                  <Github className="h-5 w-5" />
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Join Our Community</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Whether you're a customer, restaurant owner, driver, or
                developer, there's a place for you in the OpenEats community.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link href="/app/restaurants">Order Food</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/partners">Partner With Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/app/drivers">Become a Driver</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
