"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import type { JSX } from "react";

import { useRestaurants } from "@/app/app/components/hooks/use-restaurants";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";

export default function RestaurantAboutPage(): JSX.Element | null {
  const { id } = useParams<{ id: string }>();

  const { getRestaurantById } = useRestaurants();
  const config = useRestaurantConfig();

  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return null;
  }

  // Find the about page content from config
  const aboutPage = config.pages?.find((page) => page.slug === "about");

  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">
          {aboutPage?.title || "About Us"}
        </h1>

        <div className="grid gap-8 md:grid-cols-2 items-center mb-12">
          <div>
            <div className="prose max-w-none">
              {aboutPage?.content ? (
                <p>{aboutPage.content}</p>
              ) : (
                <>
                  <p className="mb-4">
                    {restaurant.name} was founded with a simple mission: to
                    serve delicious, high-quality food made with the freshest
                    ingredients.
                  </p>
                  <p className="mb-4">
                    Our team of experienced chefs is dedicated to creating
                    memorable dining experiences for our customers, whether
                    you're dining in, picking up, or ordering delivery.
                  </p>
                  <p>
                    We take pride in being a part of the community and look
                    forward to serving you soon!
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={
                config.story?.image ||
                "/placeholder.svg?height=400&width=600&text=About+Us"
              }
              alt={`About ${restaurant.name}`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="py-8">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-muted rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
              <p className="text-muted-foreground">
                We source the freshest ingredients from local suppliers to
                ensure quality in every dish.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Chefs</h3>
              <p className="text-muted-foreground">
                Our team of experienced chefs brings passion and expertise to
                create exceptional flavors.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Community Focus</h3>
              <p className="text-muted-foreground">
                We're proud to be part of the community and strive to give back
                whenever possible.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section (if applicable) */}
        {config.showChef && (
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-6">Meet Our Team</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                  <Image
                    src="/placeholder.svg?height=128&width=128&text=Chef"
                    alt="Head Chef"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">Head Chef</p>
              </div>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                  <Image
                    src="/placeholder.svg?height=128&width=128&text=Manager"
                    alt="Restaurant Manager"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold">Sam Williams</h3>
                <p className="text-sm text-muted-foreground">
                  Restaurant Manager
                </p>
              </div>
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                  <Image
                    src="/placeholder.svg?height=128&width=128&text=Owner"
                    alt="Owner"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-bold">Jamie Smith</h3>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
