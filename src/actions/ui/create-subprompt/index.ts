"use server";

import { prisma } from "@/next-portal/db";
import { errorLogger } from "@/next-portal/utils/logger";

export interface CreateSubPromptReturn {
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
}

export const createSubPrompt = async (
  subPrompt: string,
  UIId: string,
  parentSUBId: string,
  code: string,
  modelId: string,
): Promise<CreateSubPromptReturn> => {
  if (
    subPrompt.startsWith("precise-") ||
    subPrompt.startsWith("balanced-") ||
    subPrompt.startsWith("creative-")
  ) {
    const codeData = await prisma.code.create({
      data: {
        code: code,
      },
    });
    try {
      const data = await prisma.subPrompt.create({
        data: {
          UIId: UIId,
          subPrompt: subPrompt,
          SUBId: parentSUBId,
          codeId: codeData.id,
          modelId: modelId,
        },
      });

      return {
        data,
        codeData,
      };
    } catch (error) {
      errorLogger("Error creating subprompt:", error);
    }
  }

  const baseSubId = parentSUBId.split("-").slice(0, -1).join("-");
  const currentNumber = parseInt(parentSUBId.split("-").pop()!, 10);
  const nextSubIdBase = `${baseSubId}-${currentNumber + 1}`;

  const existingNextSub = await prisma.subPrompt.findFirst({
    where: {
      UIId: UIId,
      SUBId: nextSubIdBase,
    },
  });

  let newSUBId: string;
  if (!existingNextSub) {
    newSUBId = nextSubIdBase;
  } else {
    const existingSubPrompts = await prisma.subPrompt.findMany({
      where: {
        UIId: UIId,
        SUBId: {
          startsWith: `${nextSubIdBase}-`,
        },
      },
      orderBy: {
        SUBId: "desc",
      },
      take: 1,
    });

    if (existingSubPrompts.length === 0) {
      newSUBId = `${nextSubIdBase}-1`;
    } else {
      const lastSUBId = existingSubPrompts[0].SUBId;
      const parts = lastSUBId.split("-");
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      parts[parts.length - 1] = (lastNumber + 1).toString();
      newSUBId = parts.join("-");
    }
  }

  const codeData = await prisma.code.create({
    data: {
      code: code,
    },
  });

  const data = await prisma.subPrompt.create({
    data: {
      UIId: UIId,
      subPrompt: subPrompt,
      SUBId: newSUBId,
      codeId: codeData.id,
      modelId: modelId,
    },
  });

  return {
    data,
    codeData,
  };
};
