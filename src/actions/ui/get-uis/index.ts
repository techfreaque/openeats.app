"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "@/app/api/v1/website-editor/repository";
import type { FullUI } from "@/lib/website-editor/types";

/**
 * Server action to list UI components
 * This is now a wrapper around the API endpoint
 */
export const getUIs = async (
  mode: string,
  start: number,
  limit: number,
  timeRange: string,
): Promise<FullUI[]> => {
  try {
    // List the UI components using the repository
    const results = await uiRepository.listUis(mode, start, limit, timeRange);
    return results as FullUI[];
  } catch (error) {
    errorLogger("Error listing UI components:", error);
    return [];
  }
};

/**
 * Server action to get a UI component by ID
 * This is now a wrapper around the API endpoint
 */
export const getUI = async (UIId: string): Promise<FullUI | null> => {
  try {
    // Get the UI component using the repository
    const result = await uiRepository.findByIdWithSubprompts(UIId);

    if (!result) {
      return null;
    }

    // Increment view count
    await uiRepository.incrementViewCount(UIId);

    return result as FullUI;
  } catch (error) {
    errorLogger("Error getting UI component:", error);
    return null;
  }
};

/**
 * Server action to get UI components for the home page
 * This is now a wrapper around the API endpoint
 */
export const getUIHome = async (): Promise<FullUI[]> => {
  try {
    // Get the UI components for the home page using the repository
    const results = await uiRepository.getUiHome();
    return results as FullUI[];
  } catch (error) {
    errorLogger("Error getting UI components for home:", error);
    return [];
  }
};

/**
 * Server action to get UI components for a user's profile
 * This is now a wrapper around the API endpoint
 */
export const getUIProfile = async (
  userId: string,
  start: number,
  limit: number,
  mode: string,
): Promise<FullUI[]> => {
  try {
    if (!userId) {
      return [];
    }

    // Get the UI components for the user's profile using the repository
    const results = await uiRepository.getUiProfile(userId, start, limit, mode);
    return results as FullUI[];
  } catch (error) {
    errorLogger("Error getting UI components for profile:", error);
    return [];
  }
};
