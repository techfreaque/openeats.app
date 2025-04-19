"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { uiRepository } from "@/app/api/v1/website-editor/repository";
import type { FullUI } from "@/lib/website-editor/types";

/**
 * Server action to fork a UI component
 * This is now a wrapper around the API endpoint
 */
export async function forkUI(uiId: string, userId: string): Promise<FullUI> {
  try {
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Fork the UI component using the repository
    const result = await uiRepository.forkUi(uiId, userId);

    return result as FullUI;
  } catch (error) {
    errorLogger("[FORK_UI]", error);
    throw error;
  }
}
