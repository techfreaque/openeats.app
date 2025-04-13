"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "next-vibe/shared/utils/utils";
import type { JSX } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { useRestaurantConfig } from "./restaurant-config-provider";

interface RestaurantHeroProps {
  restaurantName: string;
  restaurantImage: string;
  additionalImages?: string[];
}

export function RestaurantHero({
  restaurantName,
  restaurantImage,
  additionalImages = [],
}: RestaurantHeroProps): JSX.Element {
  const config = useRestaurantConfig();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Combine main image with additional images for carousel
  const allImages = [restaurantImage, ...(Array.isArray(additionalImages) ? additionalImages : [])].filter((img): img is string => 
    typeof img === 'string' && img.length > 0);

  // Auto-advance carousel if style is carousel
  useEffect(() => {
    if (!config || config.heroStyle !== "carousel" || allImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      if (!isScrolling) {
        setCurrentSlide((prev) => (prev + 1) % allImages.length);
      }
    }, 5000);

    return (): void => clearInterval(interval);
  }, [allImages.length, config.heroStyle, isScrolling]);

  // Determine hero height based on config
  const heroHeightClass =
    config && config.heroHeight === "small"
      ? "h-[150px] md:h-[200px] lg:h-[250px]"
      : config && config.heroHeight === "large"
        ? "h-[250px] md:h-[400px] lg:h-[500px]"
        : "h-[200px] md:h-[300px] lg:h-[400px]"; // medium (default)

  // Handle carousel navigation
  const goToSlide = (index: number): void => {
    setIsScrolling(true);
    setCurrentSlide(index);
    setTimeout(() => setIsScrolling(false), 500);
  };

  const nextSlide = (): void => {
    goToSlide((currentSlide + 1) % allImages.length);
  };

  const prevSlide = (): void => {
    goToSlide((currentSlide - 1 + allImages.length) % allImages.length);
  };

  // Render based on hero style
  if (config && config.heroStyle === "carousel" && allImages.length > 1) {
    return (
      <div className={cn("relative w-full overflow-hidden", heroHeightClass)}>
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {allImages.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <Image
                src={image || "/placeholder.svg"}
                alt={`${restaurantName} image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* Hero content overlay */}
              {config.heroContent && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                  <div className="text-center p-4 max-w-3xl">
                    {config.heroContent.showLogo && (
                      <div
                        className={`flex justify-${config.heroContent.logoPosition || "center"} mb-4`}
                      >
                        <div className="bg-white rounded-full p-2 w-24 h-24 flex items-center justify-center">
                          <span className="text-4xl">🍔</span>
                        </div>
                      </div>
                    )}
                    {config.heroContent.title && (
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                        {config.heroContent.title}
                      </h1>
                    )}
                    {config.heroContent.subtitle && (
                      <p className="text-lg md:text-xl opacity-90 mb-4">
                        {config.heroContent.subtitle}
                      </p>
                    )}
                    {config.heroContent.ctaText && (
                      <Button size="lg" asChild>
                        <a href={config.heroContent.ctaLink || "#menu"}>
                          {config.heroContent.ctaText}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next</span>
        </Button>

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
              onClick={() => goToSlide(index)}
            >
              <span className="sr-only">Go to slide {index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (config && config.heroStyle === "parallax") {
    return (
      <div className={cn("relative w-full overflow-hidden", heroHeightClass)}>
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${restaurantImage || "/placeholder.svg"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />

        {/* Parallax overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero content */}
        {config && config.heroContent && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center p-4 max-w-3xl">
              {config.heroContent?.showLogo && (
                <div
                  className={`flex justify-${config.heroContent?.logoPosition || "center"} mb-4`}
                >
                  <div className="bg-white rounded-full p-2 w-24 h-24 flex items-center justify-center">
                    <span className="text-4xl">🍔</span>
                  </div>
                </div>
              )}
              {config.heroContent?.title && (
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {config.heroContent.title}
                </h1>
              )}
              {config.heroContent?.subtitle && (
                <p className="text-lg md:text-xl opacity-90 mb-4">
                  {config.heroContent.subtitle}
                </p>
              )}
              {config.heroContent?.ctaText && (
                <Button size="lg" asChild>
                  <a href={config.heroContent?.ctaLink || "#menu"}>
                    {config.heroContent.ctaText}
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (config && config.heroStyle === "split") {
    return (
      <div
        className={cn("relative w-full grid md:grid-cols-2", heroHeightClass)}
      >
        <div className="relative">
          <Image
            src={restaurantImage || "/placeholder.svg"}
            alt={restaurantName}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex items-center justify-center p-8 bg-muted">
          <div className="max-w-md">
            {config.heroContent?.showLogo && (
              <div className="mb-4">
                <div className="bg-background rounded-full p-2 w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl">🍔</span>
                </div>
              </div>
            )}
            {config.heroContent?.title && (
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {config.heroContent.title}
              </h1>
            )}
            {config.heroContent?.subtitle && (
              <p className="text-md md:text-lg text-muted-foreground mb-4">
                {config.heroContent.subtitle}
              </p>
            )}
            {config.heroContent?.ctaText && (
              <Button size="lg" asChild>
                <a href={config.heroContent.ctaLink || "#menu"}>
                  {config.heroContent.ctaText}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default image hero
  return (
    <div className={cn("relative w-full", heroHeightClass)}>
      <Image
        src={restaurantImage || "/placeholder.svg"}
        alt={restaurantName}
        fill
        className="object-cover"
        priority
      />

      {/* Hero content overlay */}
      {config && config.heroContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
          <div className="text-center p-4 max-w-3xl">
            {config.heroContent?.showLogo && (
              <div
                className={`flex justify-${config.heroContent?.logoPosition || "center"} mb-4`}
              >
                <div className="bg-white rounded-full p-2 w-24 h-24 flex items-center justify-center">
                  <span className="text-4xl">🍔</span>
                </div>
              </div>
            )}
            {config.heroContent?.title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                {config.heroContent.title}
              </h1>
            )}
            {config.heroContent?.subtitle && (
              <p className="text-lg md:text-xl opacity-90 mb-4">
                {config.heroContent.subtitle}
              </p>
            )}
            {config.heroContent?.ctaText && (
              <Button size="lg" asChild>
                <a href={config.heroContent?.ctaLink || "#menu"}>
                  {config.heroContent.ctaText}
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
