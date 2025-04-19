"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { subPromptRepository } from "@/app/api/v1/website-editor/repository";

export interface CreateSubPromptReturn {
  id: string;
  createdAt: Date;
  subPrompt: string;
  UIId: string;
  SUBId: string;
  modelId: string | null;
  code: {
    id: string;
    code: string;
  };
}

/**
 * Server action to create a subprompt
 * This is now a wrapper around the API endpoint
 */
export const createSubPrompt = async (
  subPrompt: string,
  UIId: string,
  parentSUBId: string,
  code: string,
  modelId: string,
): Promise<CreateSubPromptReturn> => {
  try {
    // Generate the next SUB ID
    const subId = await subPromptRepository.generateNextSubId(
      UIId,
      parentSUBId,
    );

    // Create the subprompt with code
    const result = await subPromptRepository.createWithCode(
      {
        uiId: UIId,
        subPrompt,
        subId,
        modelId,
      },
      code,
    );

    // Transform the result to match the expected response format
    return {
      id: result.id,
      createdAt: result.createdAt,
      subPrompt: result.subPrompt,
      UIId: result.uiId,
      SUBId: result.subId,
      modelId: result.modelId,
      code: {
        id: result.code.id,
        code: result.code.code,
      },
    };
  } catch (error) {
    errorLogger("Error creating subprompt:", error);
    throw error;
  }
};

// This is no longer needed as we're using the repository
// Keeping for reference in case any code still depends on it
export const subPromptSelect = {
  id: true,
  UIId: true,
  SUBId: true,
  createdAt: true,
  subPrompt: true,
  modelId: true,
  code: {
    select: {
      id: true,
      code: true,
    },
  },
};
