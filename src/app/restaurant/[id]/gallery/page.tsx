"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { JSX } from "react";
import { useState } from "react";

import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function RestaurantGalleryPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: restaurant } = useRestaurant(id);
  const config = useRestaurantConfig();

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Mock gallery images
  const galleryImages = Array(12)
    .fill(0)
    .map((_, i) => ({
      src: `/placeholder.svg?height=400&width=600&text=Restaurant+Photo+${i + 1}`,
      alt: `Restaurant photo ${i + 1}`,
      category: i % 3 === 0 ? "Interior" : i % 3 === 1 ? "Food" : "Events",
    }));

  if (!restaurant) {
    return null;
  }

  const galleryStyle = config.galleryStyle || "grid";

  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Gallery</h1>

        {/* Gallery categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button variant="outline" className="rounded-full">
            All
          </Button>
          <Button variant="outline" className="rounded-full">
            Interior
          </Button>
          <Button variant="outline" className="rounded-full">
            Food
          </Button>
          <Button variant="outline" className="rounded-full">
            Events
          </Button>
        </div>

        {/* Gallery grid */}
        {galleryStyle === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="aspect-square relative rounded-md overflow-hidden cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Gallery masonry */}
        {galleryStyle === "masonry" && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-md overflow-hidden cursor-pointer break-inside-avoid ${
                  index % 5 === 0 || index % 5 === 3
                    ? "aspect-[3/4]"
                    : "aspect-square"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Gallery carousel */}
        {galleryStyle === "carousel" && (
          <div className="space-y-8">
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden">
              <Image
                src={galleryImages[0].src || "/placeholder.svg"}
                alt={galleryImages[0].alt}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square relative rounded-md overflow-hidden cursor-pointer ${
                    index === 0 ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image viewer dialog */}
        <Dialog
          open={selectedImage !== null}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
            <div className="relative aspect-video w-full">
              {selectedImage !== null && (
                <Image
                  src={galleryImages[selectedImage].src || "/placeholder.svg"}
                  alt={galleryImages[selectedImage].alt}
                  fill
                  className="object-contain"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
