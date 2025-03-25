"use server";

import { prisma } from "@/next-portal/db";
import { errorLogger } from "@/next-portal/utils/logger";

export type WebsiteEditorUser = {
  uiCount: number;
  subPromptCount: number;
  id: string;
  firstName: string;
  imageUrl: string | null;
  createdAt: Date;
};

export const getUser = async (
  id: string,
): Promise<WebsiteEditorUser | null> => {
  if (!id) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
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

    const uiCount = await prisma.uI.count({
      where: {
        userId: user.id,
      },
    });

    const subPromptCount = await prisma.subPrompt.count({
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
