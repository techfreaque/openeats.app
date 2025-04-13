import type { QueryKey } from "@tanstack/react-query";

import { errorLogger } from "../../shared/utils/logger";
import { envClient } from "../env-client";

// Define AsyncStorage type
interface AsyncStorageStatic {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Will be populated in React Native environment
let AsyncStorage: AsyncStorageStatic | null = null;

/**
 * Initialize AsyncStorage for React Native
 * @returns Promise that resolves when storage is initialized
 */
export async function initializeStorage(): Promise<void> {
  if (envClient.platform.isReactNative && !AsyncStorage) {
    try {
      const { default: _AsyncStorage } = await import(
        "@react-native-async-storage/async-storage"
      );
      // eslint-disable-next-line require-atomic-updates
      AsyncStorage = _AsyncStorage;
    } catch (err) {
      errorLogger("Failed to import AsyncStorage:", err);
    }
  }
}

// Call this early in the app to initialize storage
if (typeof window !== "undefined") {
  initializeStorage().catch((error) =>
    errorLogger("Error initializing storage:", error),
  );
}

/**
 * Generate a consistent storage key from a query key
 * @param key - The query key to generate a storage key from
 * @returns A consistent string key for storage
 */
export function generateStorageKey(key: QueryKey): string {
  try {
    return `${envClient.NEXT_PUBLIC_APP_NAME}-cache-${typeof key === "object" ? JSON.stringify(key) : key}`;
  } catch (e) {
    errorLogger("Error generating storage key:", e);
    // Fallback for non-serializable keys

    return `${envClient.NEXT_PUBLIC_APP_NAME}-cache-${String(key)}`;
  }
}

/**
 * Storage item with timestamp for cache control
 */
interface StoredItem<T> {
  data: T;
  _timestamp: number;
}

/**
 * Get item from storage (works in both browser and React Native)
 * @param key - The storage key
 * @returns The stored value or null if not found
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    if (envClient.platform.isServer) {
      return null;
    }

    let value: string | null = null;

    if (envClient.platform.isReactNative && AsyncStorage) {
      value = await AsyncStorage.getItem(key);
    } else {
      // Browser environment
      value = localStorage.getItem(key);
    }

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as StoredItem<T> | T;

    // Add timestamp check for cache expiry if needed
    if (parsed && typeof parsed === "object" && "_timestamp" in parsed) {
      const storedItem = parsed;
      const now = Date.now();
      const cacheAge = now - storedItem._timestamp;

      // Default cache expiry of 1 hour
      const maxAge = 60 * 60 * 1000;

      if (cacheAge > maxAge) {
        await removeStorageItem(key);
        return null;
      }

      return storedItem.data;
    }

    return parsed;
  } catch (e) {
    errorLogger("Error retrieving from storage:", e);
    return null;
  }
}

/**
 * Set item in storage (works in both browser and React Native)
 * @param key - The storage key
 * @param value - The value to store
 * @returns Promise that resolves when storage is complete
 */
export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  try {
    if (envClient.platform.isServer) {
      return;
    }

    // Wrap with timestamp for cache expiry
    const wrappedValue: StoredItem<T> = {
      data: value,
      _timestamp: Date.now(),
    };

    const serialized = JSON.stringify(wrappedValue);

    if (envClient.platform.isReactNative && AsyncStorage) {
      await AsyncStorage.setItem(key, serialized);
    } else {
      // Browser environment
      localStorage.setItem(key, serialized);
    }
  } catch (e) {
    errorLogger("Error saving to storage:", e);
  }
}

/**
 * Remove item from storage (works in both browser and React Native)
 * @param key - The storage key to remove
 * @returns Promise that resolves when removal is complete
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    if (envClient.platform.isServer) {
      return;
    }

    if (envClient.platform.isReactNative && AsyncStorage) {
      await AsyncStorage.removeItem(key);
    } else {
      // Browser environment
      localStorage.removeItem(key);
    }
  } catch (e) {
    errorLogger("Error removing from storage:", e);
  }
}

/**
 * Clear all items from storage (works in both browser and React Native)
 * @returns Promise that resolves when clearing is complete
 */
export async function clearStorageItems(): Promise<void> {
  try {
    if (envClient.platform.isServer) {
      return;
    }

    if (envClient.platform.isReactNative && AsyncStorage) {
      await AsyncStorage.clear();
    } else {
      // Browser environment
      localStorage.clear();
    }
  } catch (e) {
    errorLogger("Error clearing storage:", e);
  }
}
