"use client";

import { Camera, Download, Share2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useState } from "react";

import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { LanguageSelector } from "@/app/app/components/language-selector";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";

// Define gallery image type
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

export default function RestaurantGalleryPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { t } = useTranslation();

  const { data: restaurant } = useRestaurant(id);
  const config = useRestaurantConfig();

  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Enhanced gallery images with better categories
  const galleryImages = Array(12)
    .fill(0)
    .map((_, i) => ({
      id: `img-${i}`,
      src:
        i === 0 && restaurant?.image
          ? restaurant.image
          : `/placeholder.svg?height=400&width=600&text=Restaurant+Photo+${i + 1}`,
      alt:
        i % 4 === 0
          ? `${restaurant?.name || "Restaurant"} Interior`
          : i % 4 === 1
            ? `Signature Dish ${i}`
            : i % 4 === 2
              ? `Special Event`
              : `Chef's Special`,
      category:
        i % 4 === 0
          ? "interior"
          : i % 4 === 1
            ? "food"
            : i % 4 === 2
              ? "events"
              : "specials",
    }));

  if (!restaurant) {
    return null;
  }

  // Get unique categories
  const categories = Array.from(
    new Set(galleryImages.map((img) => img.category)),
  );

  // Filter images by category if one is selected
  const filteredImages = activeCategory
    ? galleryImages.filter((img) => img.category === activeCategory)
    : galleryImages;

  const galleryStyle = config.galleryStyle || "grid";

  return (
    <div className="pb-20">
      {/* Hero section */}
      <div className="bg-muted py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {restaurant?.name} -{" "}
                {t("restaurant.gallery.title", "Photo Gallery")}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {t(
                  "restaurant.gallery.subtitle",
                  "Explore our restaurant, dishes, and events through our photo gallery",
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/restaurant/${id}`}>
                  {t(
                    "restaurant.gallery.backToRestaurant",
                    "Back to Restaurant",
                  )}
                </Link>
              </Button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        {/* Gallery categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveCategory(null)}
          >
            {t("restaurant.gallery.allPhotos", "All Photos")}
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setActiveCategory(category)}
            >
              {t(
                `restaurant.gallery.category.${category}`,
                category.charAt(0).toUpperCase() + category.slice(1),
              )}
            </Button>
          ))}
        </div>

        {/* Gallery grid */}
        {galleryStyle === "grid" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
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
            {filteredImages.map((image, index) => (
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
                src={filteredImages[0]?.src || "/placeholder.svg"}
                alt={filteredImages[0]?.alt || "Gallery image"}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredImages.map((image, index) => (
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
          <DialogContent className="max-w-4xl p-6 overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {selectedImage !== null
                  ? filteredImages[selectedImage].alt
                  : ""}
              </DialogTitle>
              <DialogDescription>
                {selectedImage !== null &&
                  t(
                    `restaurant.gallery.category.${filteredImages[selectedImage].category}`,
                    filteredImages[selectedImage].category
                      .charAt(0)
                      .toUpperCase() +
                      filteredImages[selectedImage].category.slice(1),
                  )}
              </DialogDescription>
            </DialogHeader>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden">
              {selectedImage !== null && (
                <Image
                  src={filteredImages[selectedImage].src || "/placeholder.svg"}
                  alt={filteredImages[selectedImage].alt}
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
            <div className="flex justify-between mt-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                {t("restaurant.gallery.share", "Share")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                {t("restaurant.gallery.download", "Download")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Photography credit */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Camera className="h-4 w-4" />
            {t(
              "restaurant.gallery.photoCredit",
              "Photography by Restaurant Team",
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
