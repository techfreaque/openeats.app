"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { JSX } from "react/jsx-runtime";

import type { RestaurantConfigType } from "./lib/types";

const defaultConfig: RestaurantConfigType = {
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
  showReviews: true,
  showGallery: true,
  orderOptions: {
    delivery: true,
    pickup: true,
    dineIn: false,
  },
  menuStyle: "sections",
};

const RestaurantConfigContext =
  createContext<RestaurantConfigType>(defaultConfig);

export function useRestaurantConfig(): RestaurantConfigType {
  return useContext(RestaurantConfigContext);
}

interface RestaurantConfigProviderProps {
  config?: Partial<RestaurantConfigType>;
  children: ReactNode;
}

export function RestaurantConfigProvider({
  config,
  children,
}: RestaurantConfigProviderProps): JSX.Element {
  // Deep merge the default config with the provided config
  const mergedConfig = deepMerge(
    defaultConfig,
    config || {},
  ) as RestaurantConfigType;

  return (
    <RestaurantConfigContext.Provider value={mergedConfig}>
      {children}
    </RestaurantConfigContext.Provider>
  );
}

// Helper function to deep merge objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}
