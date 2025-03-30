"use client";

import Image from "next/image";
import type { JSX } from "react";

import { useRestaurantConfig } from "./restaurant-config-provider";

interface RestaurantStoryProps {
  restaurantName: string;
}

export function RestaurantStory({
  restaurantName,
}: RestaurantStoryProps): JSX.Element | null {
  const config = useRestaurantConfig();

  if (!config.showStory || !config.story) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {config.story.image && (
            <div className="relative aspect-square md:aspect-auto md:h-full rounded-lg overflow-hidden">
              <Image
                src={config.story.image || "/placeholder.svg"}
                alt={`${restaurantName} story`}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            {config.story.title && (
              <h2 className="text-3xl font-bold">{config.story.title}</h2>
            )}

            {config.story.content && (
              <div className="text-muted-foreground space-y-4">
                {config.story.content.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
