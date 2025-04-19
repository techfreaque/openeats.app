"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { JSX } from "react/jsx-runtime";

import type { RestaurantConfigType } from "./lib/types";

// Define a type that allows partial config
export type PartialRestaurantConfigType = Partial<RestaurantConfigType>;

const defaultConfig: RestaurantConfigType = {
  theme: {
    theme: "default",
    primaryColor: "primary",
  },
  hero: {
    showHero: true,
    heroHeight: "small",
    heroStyle: "image",
  },
  layout: "standard",
  featuredItems: [],
  featuredCollections: [],
  showReviews: true,
  showGallery: true,
  orderOptions: {
    delivery: true,
    pickup: true,
    dineIn: false,
  },
  menuStyle: "sections",
  heroStyle: "carousel",
  heroHeight: "small",
};

const RestaurantConfigContext =
  createContext<RestaurantConfigType>(defaultConfig);

export function useRestaurantConfig(): RestaurantConfigType {
  return useContext(RestaurantConfigContext);
}

interface RestaurantConfigProviderProps {
  config?: PartialRestaurantConfigType;
  children: ReactNode;
}

export function RestaurantConfigProvider({
  config,
  children,
}: RestaurantConfigProviderProps): JSX.Element {
  // Deep merge the default config with the provided config
  const mergedConfig = deepMerge(
    defaultConfig,
    config ?? {},
  ) as RestaurantConfigType;

  return (
    <RestaurantConfigContext.Provider value={mergedConfig}>
      {children}
    </RestaurantConfigContext.Provider>
  );
}

// Helper function to deep merge objects
function deepMerge<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>,
>(target: T, source: U): T & U {
  const output = { ...target } as T & U;

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key as keyof U];
      const targetValue = target[key as keyof T];

      if (isObject(sourceValue)) {
        if (!(key in target)) {
          // TypeScript doesn't know that output[key] is safe here
          // but we're ensuring it with the type cast
          (output as Record<string, unknown>)[key] = sourceValue;
        } else {
          // TypeScript doesn't know that output[key] is safe here
          // but we're ensuring it with the type cast
          (output as Record<string, unknown>)[key] = deepMerge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>,
          );
        }
      } else {
        // TypeScript doesn't know that output[key] is safe here
        // but we're ensuring it with the type cast
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    });
  }

  return output;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item) && typeof item === "object" && !Array.isArray(item);
}
