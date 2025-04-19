"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "@/app/api/v1/website-editor/repository";

/**
 * Server action to toggle like on a UI component
 * This is now a wrapper around the API endpoint
 */
export const toggleLike = async (
  userId: string,
  UIId: string,
): Promise<{
  liked: boolean;
}> => {
  try {
    // Toggle the like using the repository
    const liked = await uiRepository.toggleLike(userId, UIId);

    return { liked };
  } catch (error) {
    errorLogger("Error toggling like:", error);
    throw error;
  }
};
