"use server";

import { userRepository } from "@/app/api/v1/auth/repository";
import { uiRepository } from "@/app/api/v1/website-editor/website-editor.repository";
// Removed db import
import type { FullUI, UiType as _UiType } from "@/lib/website-editor/types";

export const createUI = async (
  prompt: string,
  userId: string,
  uiType: _UiType,
): Promise<FullUI> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const data = await uiRepository.create({
    userId: userId,
    prompt: prompt,
    uiType: uiType,
    updatedAt: new Date(),
    img: "",
    public: true,
    likesCount: 0,
    viewCount: 0,
  });

  // Convert to FullUI type
  const fullUI: FullUI = {
    ...data,
    user: {
      id: user.id,
      firstName: user.firstName,
      imageUrl: user.imageUrl,
    },
    subPrompts: [],
  };

  return fullUI;
};
