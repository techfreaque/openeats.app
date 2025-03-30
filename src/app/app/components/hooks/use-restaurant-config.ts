"use client";

import { useEffect, useState } from "react";

import { errorLogger } from "@/packages/next-vibe/shared/utils/logger";

import type { RestaurantConfigType } from "../lib/types";

// This is a mock hook that would fetch restaurant configuration from an API
export function useRestaurantConfigData(restaurantId: string): {
  config: RestaurantConfigType | null;
  isLoading: boolean;
  error: string | null;
} {
  const [config, setConfig] = useState<RestaurantConfigType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock configurations for different restaurants
        const mockConfigs: Record<string, Partial<RestaurantConfigType>> = {
          "1": {
            // Burger Joint
            theme: {
              theme: "modern",
              primaryColor: "primary",
              secondaryColor: "#FFC107",
              accentColor: "#FF5722",
            },
            hero: {
              showHero: true,
              heroHeight: "large",
              heroStyle: "parallax",
              heroContent: {
                title: "Handcrafted Burgers",
                subtitle: "Made with 100% fresh ingredients daily",
                showLogo: true,
                logoPosition: "center",
                ctaText: "Order Now",
                ctaLink: "#menu",
              },
            },
            layout: "featured",
            featuredItems: ["101", "102", "106"],
            featuredCollections: [
              {
                id: "popular",
                title: "Most Popular",
                description: "Our customers' favorites",
                itemIds: ["101", "104", "106"],
                displayStyle: "carousel",
              },
              {
                id: "combos",
                title: "Value Meals",
                description: "Complete meals at a great price",
                itemIds: ["101", "102", "103"],
                displayStyle: "grid",
                backgroundColor: "#f9f5ff",
              },
              {
                id: "sides",
                title: "Perfect Sides",
                description: "Complete your meal with these delicious sides",
                itemIds: ["104", "105"],
                displayStyle: "featured",
              },
            ],
            specialOffers: [
              {
                id: "happy-hour",
                title: "Happy Hour Special",
                description: "Get 20% off on all burgers between 3-5 PM",
                discount: "20%",
                validUntil: "Daily, 3-5 PM",
                image: "/placeholder.svg?height=300&width=500&text=Happy+Hour",
                itemIds: ["101", "102", "103"],
              },
            ],
            showStory: true,
            story: {
              title: "Our Burger Story",
              content:
                "Founded in 2010, Burger Joint started with a simple mission: to serve the best burgers in town using only the freshest ingredients. Our beef is locally sourced, our buns are baked fresh daily, and our special sauce is a closely guarded family recipe passed down through generations.",
              image: "/placeholder.svg?height=400&width=600&text=Our+Story",
            },
            showChef: true,
            customSections: [
              {
                id: "ingredients",
                title: "Quality Ingredients",
                content:
                  "We source all our ingredients from local farms and suppliers. Our beef is 100% grass-fed and our vegetables are organic and locally grown.",
                type: "image-text",
                backgroundColor: "#f5f5f5",
              },
            ],
            socialLinks: [
              {
                platform: "instagram",
                url: "https://instagram.com/burgerjoint",
              },
              { platform: "facebook", url: "https://facebook.com/burgerjoint" },
              { platform: "twitter", url: "https://twitter.com/burgerjoint" },
            ],
            orderOptions: {
              delivery: true,
              pickup: true,
              dineIn: true,
            },
            reservations: true,
            menuStyle: "tabs",
            menuCategories: [
              {
                id: "burgers",
                name: "Burgers",
                image: "/placeholder.svg?height=100&width=100&text=Burgers",
              },
              {
                id: "sides",
                name: "Sides",
                image: "/placeholder.svg?height=100&width=100&text=Sides",
              },
              {
                id: "drinks",
                name: "Drinks",
                image: "/placeholder.svg?height=100&width=100&text=Drinks",
              },
            ],
            pages: [
              { id: "home", name: "Home", slug: "home", order: 1 },
              { id: "menu", name: "Menu", slug: "menu", order: 2 },
              {
                id: "about",
                name: "About Us",
                slug: "about",
                title: "Our Story",
                content:
                  "Founded in 2010, Burger Joint started with a simple mission: to serve the best burgers in town using only the freshest ingredients.",
                order: 3,
              },
              { id: "contact", name: "Contact", slug: "contact", order: 4 },
            ],
          },
          "2": {
            // Pizza Palace
            theme: {
              theme: "classic",
              primaryColor: "#D32F2F",
              secondaryColor: "#FFC107",
            },
            hero: {
              showHero: true,
              heroHeight: "medium",
              heroStyle: "video",
              heroContent: {
                title: "Authentic Italian Pizza",
                subtitle: "Baked in our wood-fired oven",
                ctaText: "View Menu",
                ctaLink: "#menu",
              },
            },
            layout: "grid",
            featuredItems: ["201", "202", "204"],
            featuredCollections: [
              {
                id: "specials",
                title: "Weekly Specials",
                description: "Limited time offers",
                itemIds: ["201", "204", "205"],
                displayStyle: "carousel",
              },
              {
                id: "classics",
                title: "Classic Pizzas",
                description: "Our traditional favorites",
                itemIds: ["201", "202", "203"],
                displayStyle: "grid",
              },
            ],
            specialOffers: [
              {
                id: "family-deal",
                title: "Family Deal",
                description:
                  "2 Large Pizzas, Garlic Bread & 2L Soda for $29.99",
                image: "/placeholder.svg?height=300&width=500&text=Family+Deal",
              },
            ],
            showGallery: true,
            galleryStyle: "masonry",
            showStory: true,
            story: {
              title: "From Naples to Your Table",
              content:
                "Our recipes come straight from Naples, Italy, where our founder learned the art of pizza making from his grandfather. We use imported Italian flour and tomatoes to create the most authentic pizza experience outside of Italy.",
              image:
                "/placeholder.svg?height=400&width=600&text=Naples+Heritage",
            },
            orderOptions: {
              delivery: true,
              pickup: true,
              dineIn: true,
            },
            menuStyle: "sections",
            pages: [
              { id: "home", name: "Home", slug: "home", order: 1 },
              { id: "menu", name: "Menu", slug: "menu", order: 2 },
              { id: "gallery", name: "Gallery", slug: "gallery", order: 3 },
              { id: "about", name: "About", slug: "about", order: 4 },
              { id: "contact", name: "Contact", slug: "contact", order: 5 },
            ],
          },
          "3": {
            // Sushi World
            theme: {
              theme: "minimal",
              primaryColor: "#00897B",
              secondaryColor: "#E0F2F1",
            },
            hero: {
              showHero: true,
              heroHeight: "medium",
              heroStyle: "carousel",
              heroContent: {
                title: "Experience Authentic Japanese Cuisine",
                subtitle: "Fresh fish delivered daily",
                showLogo: true,
                logoPosition: "left",
              },
            },
            layout: "magazine",
            featuredItems: ["301", "302", "305"],
            featuredCollections: [
              {
                id: "signature",
                title: "Signature Rolls",
                description: "Chef's special creations",
                itemIds: ["301", "302"],
                displayStyle: "featured",
                backgroundColor: "#E0F2F1",
              },
              {
                id: "sets",
                title: "Sushi Sets",
                description: "Perfect for sharing",
                itemIds: ["303", "304", "305"],
                displayStyle: "carousel",
              },
            ],
            specialOffers: [
              {
                id: "lunch-special",
                title: "Lunch Special",
                description: "Bento Box with Miso Soup for $15.99",
                validUntil: "Weekdays, 11 AM - 3 PM",
                image:
                  "/placeholder.svg?height=300&width=500&text=Lunch+Special",
              },
            ],
            showChef: true,
            customSections: [
              {
                id: "chef-recommendation",
                title: "Chef's Recommendations",
                type: "gallery",
                items: [
                  {
                    id: "301",
                    title: "California Roll",
                    image:
                      "/placeholder.svg?height=200&width=200&text=California+Roll",
                  },
                  {
                    id: "302",
                    title: "Spicy Tuna Roll",
                    image:
                      "/placeholder.svg?height=200&width=200&text=Spicy+Tuna+Roll",
                  },
                ],
              },
            ],
            orderOptions: {
              delivery: true,
              pickup: true,
              dineIn: true,
            },
            reservations: true,
            menuStyle: "tabs",
            pages: [
              { id: "home", name: "Home", slug: "home", order: 1 },
              { id: "menu", name: "Menu", slug: "menu", order: 2 },
              {
                id: "chef",
                name: "Our Chef",
                slug: "chef",
                title: "Meet Our Chef",
                content:
                  "Master Chef Tanaka brings over 20 years of experience from Tokyo's finest sushi restaurants.",
                order: 3,
              },
              { id: "gallery", name: "Gallery", slug: "gallery", order: 4 },
              { id: "contact", name: "Contact", slug: "contact", order: 5 },
            ],
          },
        };

        // Default config for restaurants without specific config
        const defaultConfig: Partial<RestaurantConfigType> = {
          theme: {
            theme: "default",
            primaryColor: "primary",
          },
          hero: {
            showHero: true,
            heroHeight: "medium",
            heroStyle: "image",
          },
          layout: "standard",
          featuredItems: [],
          featuredCollections: [],
          orderOptions: {
            delivery: true,
            pickup: true,
            dineIn: false,
          },
          pages: [
            { id: "home", name: "Home", slug: "home", order: 1 },
            { id: "menu", name: "Menu", slug: "menu", order: 2 },
            { id: "contact", name: "Contact", slug: "contact", order: 3 },
          ],
        };

        const restaurantConfig = mockConfigs[restaurantId] || defaultConfig;
        setConfig(restaurantConfig as RestaurantConfigType);
      } catch (err) {
        errorLogger("Error fetching restaurant config:", err);
        setError("Failed to load restaurant configuration");
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      void fetchConfig();
    }
  }, [restaurantId]);

  return { config, isLoading, error };
}
