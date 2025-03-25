"use server";

import { prisma } from "@/next-portal/db";
import { errorLogger } from "@/next-portal/utils/logger";

export const updateSubPrompt = async (
  UIId: string,
  code: string,
  modelId: string,
  subid?: string,
): Promise<{
  data: {
    id: string;
    createdAt: Date;
    subPrompt: string;
    UIId: string;
    SUBId: string;
    modelId: string | null;
    codeId: string;
  };
  codeData: {
    id: string;
    code: string;
  };
} | null> => {
  try {
    const existingSubPrompt = await prisma.subPrompt.findFirst({
      where: {
        UIId: UIId,
        SUBId: subid,
      },
    });

    if (!existingSubPrompt) {
      return null;
    }

    const codeData = await prisma.code.create({
      data: {
        code: code,
      },
    });

    const data = await prisma.subPrompt.update({
      where: {
        id: existingSubPrompt.id,
      },
      data: {
        codeId: codeData.id,
        modelId: modelId,
      },
    });

    return {
      data,
      codeData,
    };
  } catch (error) {
    errorLogger("Error updating subprompt:", error);
    return null;
  }
};
