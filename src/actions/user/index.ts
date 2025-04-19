"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import { errorLogger } from "next-vibe/shared/utils/logger";

import { users } from "@/app/api/v1/auth/db";
import { subPrompts, ui } from "@/app/api/v1/website-editor/db";

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
    // Find the user using Drizzle
    const userResults = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id));

    const user = userResults[0];

    if (!user) {
      return null;
    }

    // Count UIs using Drizzle
    const uiResults = await db
      .select({ count: sql`count(*)` })
      .from(ui)
      .where(eq(ui.userId, user.id));
    const uiCount = Number(uiResults[0]?.count || 0);

    // Count subprompts using Drizzle
    const subPromptResults = await db
      .select({ count: sql`count(*)` })
      .from(subPrompts)
      .innerJoin(ui, eq(subPrompts.uiId, ui.id))
      .where(eq(ui.userId, user.id));
    const subPromptCount = Number(subPromptResults[0]?.count || 0);

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
