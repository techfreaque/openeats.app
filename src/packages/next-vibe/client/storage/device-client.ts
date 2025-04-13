import { envClient } from "../env-client";
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from "./storage-client";

const DEVICE_ID_KEY = `${envClient.NEXT_PUBLIC_APP_NAME}-device-id`;

/**
 * Gets the device ID from storage
 * @returns Promise resolving to the device ID or null if not found
 */
export async function getDeviceId(): Promise<string | null> {
  if (envClient.platform.isServer) {
    return null;
  }
  return await getStorageItem<string>(DEVICE_ID_KEY);
}

/**
 * Saves the device ID to storage
 * @param deviceId - The device ID to save
 * @returns Promise that resolves when device ID is saved
 */
export async function setDeviceId(deviceId: string): Promise<void> {
  if (envClient.platform.isServer) {
    return;
  }
  await setStorageItem<string>(DEVICE_ID_KEY, deviceId);
}

/**
 * Removes the device ID from storage
 * @returns Promise that resolves when device ID is removed
 */
export async function removeDeviceId(): Promise<void> {
  if (envClient.platform.isServer) {
    return;
  }
  await removeStorageItem(DEVICE_ID_KEY);
}
