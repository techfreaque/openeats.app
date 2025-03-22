import { envClient } from "../../env/env-client";
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "../storage/storage-client";

const TOKEN_KEY = `${envClient.NEXT_PUBLIC_APP_NAME}-auth-token`;

/**
 * Gets the authentication token from storage
 * @returns Promise resolving to the token or null if not found
 */
export async function getAuthToken(): Promise<string | null> {
  if (envClient.platform.isServer) {
    return null;
  }
  return getStorageItem<string>(TOKEN_KEY);
}

/**
 * Saves the authentication token to storage
 * @param token - The JWT token to save
 * @param remember - Whether to store persistently (ignored in this implementation)
 * @returns Promise that resolves when token is saved
 */
export async function setAuthToken(token: string): Promise<void> {
  if (envClient.platform.isServer) {
    return;
  }
  await setStorageItem<string>(TOKEN_KEY, token);
}

/**
 * Removes the authentication token from storage
 * @returns Promise that resolves when token is removed
 */
export async function removeAuthToken(): Promise<void> {
  if (envClient.platform.isServer) {
    return;
  }
  await removeStorageItem(TOKEN_KEY);
}

/**
 * Checks if the user is authenticated
 * @returns Promise resolving to boolean indicating authentication status
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
