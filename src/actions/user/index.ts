"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { db } from "@/app/api/db";

export interface WebsiteEditorUser {
  uiCount: number;
  subPromptCount: number;
  id: string;
  firstName: string;
  imageUrl: string | null;
  createdAt: Date;
}

export const getUser = async (
  id: string,
): Promise<WebsiteEditorUser | null> => {
  if (!id) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const uiCount = await db.uI.count({
      where: {
        userId: user.id,
      },
    });

    const subPromptCount = await db.subPrompt.count({
      where: {
        UI: {
          userId: user.id,
        },
      },
    });

    return {
      ...user,
      uiCount,
      subPromptCount,
    };
  } catch (error) {
    errorLogger("Error fetching user:", error);
    return null;
  }
};
