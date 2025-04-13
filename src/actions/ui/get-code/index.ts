"use server";

import { db } from "next-vibe/server/db";

export const getCodeFromId = async (
  codeId: string,
): Promise<string | undefined> => {
  const code = await db.code.findUnique({
    where: {
      id: codeId,
    },
    select: {
      code: true,
    },
  });
  return code?.code;
};
