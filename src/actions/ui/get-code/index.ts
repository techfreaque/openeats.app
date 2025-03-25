"use server";

import { prisma } from "@/next-portal/db";

export const getCodeFromId = async (
  codeId: string,
): Promise<string | undefined> => {
  const code = await prisma.code.findUnique({
    where: {
      id: codeId,
    },
    select: {
      code: true,
    },
  });
  return code?.code;
};
