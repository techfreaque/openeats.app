"use client";

import { X } from "lucide-react";
import Image from "next/image";
import type { JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface RestaurantGalleryProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export function RestaurantGallery({
  images,
}: RestaurantGalleryProps): JSX.Element | null {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gallery</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden rounded-md cursor-pointer"
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

      <Dialog
        open={selectedImage !== null}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          <div className="relative aspect-video w-full">
            {selectedImage !== null && (
              <Image
                src={images[selectedImage].src || "/placeholder.svg"}
                alt={images[selectedImage].alt}
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
  );
}
