"use server";

import { errorLogger } from "next-vibe/shared/utils/logger";

import { db } from "@/app/api/db";

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
    try {
      const data = await db.subPrompt.create({
        data: {
          UIId: UIId,
          subPrompt: subPrompt,
          SUBId: parentSUBId,
          code: {
            create: {
              code: code,
            },
          },
          modelId: modelId,
        },
        select: subPromptSelect,
      });

      return data as CreateSubPromptReturn;
    } catch (error) {
      errorLogger("Error creating subprompt:", error);
    }
  }

  const baseSubId = parentSUBId.split("-").slice(0, -1).join("-");
  const currentNumber = parseInt(parentSUBId.split("-").pop()!, 10);
  const nextSubIdBase = `${baseSubId}-${currentNumber + 1}`;

  const existingNextSub = await db.subPrompt.findFirst({
    where: {
      UIId: UIId,
      SUBId: nextSubIdBase,
    },
  });

  let newSUBId: string;
  if (!existingNextSub) {
    newSUBId = nextSubIdBase;
  } else {
    const existingSubPrompts = await db.subPrompt.findMany({
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
      const lastSUBId = existingSubPrompts[0]!.SUBId;
      const parts = lastSUBId.split("-");
      const lastNumber = parseInt(parts[parts.length - 1]!, 10);
      parts[parts.length - 1] = (lastNumber + 1).toString();
      newSUBId = parts.join("-");
    }
  }

  const data = await db.subPrompt.create({
    data: {
      UIId: UIId,
      subPrompt: subPrompt,
      SUBId: newSUBId,
      code: {
        create: {
          code: code,
        },
      },
      modelId: modelId,
    },
    select: subPromptSelect,
  });

  return data as CreateSubPromptReturn;
};

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
