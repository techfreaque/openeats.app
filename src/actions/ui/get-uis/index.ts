"use server";

import { desc, asc, eq, and, or, gte, lte, inArray } from "drizzle-orm";

import { db } from "@/app/api/db";
import { uiRepository } from "@/app/api/v1/website-editor/website-editor.repository";
import { ui } from "@/app/api/v1/website-editor/db";
import type { FullUI } from "@/lib/website-editor/types";

export const getUIs = async (
  mode: string,
  start: number,
  limit: number,
  timeRange: string,
): Promise<FullUI[]> => {
  // Define order by and where conditions for Drizzle
  const orderByConditions = [];
  const whereConditions = [];

  // Set up order by conditions based on mode
  switch (mode) {
    case "latest":
      orderByConditions.push(desc(ui.createdAt));
      break;
    case "most_liked":
      orderByConditions.push(desc(ui.likesCount));
      orderByConditions.push(asc(ui.createdAt));
      break;
    case "most_viewed":
      orderByConditions.push(desc(ui.viewCount));
      orderByConditions.push(asc(ui.createdAt));
      break;
    default:
      orderByConditions.push(desc(ui.createdAt));
  }

  // Add time range filter if specified
  const now = new Date();
  if (mode !== "latest" && timeRange !== "all") {
    let startDate: Date;

    switch (timeRange) {
      case "1h":
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    whereConditions.push(gte(ui.createdAt, startDate));
  }

  // Query the database using Drizzle
  const query = db
    .select()
    .from(ui)
    .limit(limit)
    .offset(start);

  // Add where conditions if any
  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  // Add order by conditions
  for (const orderCondition of orderByConditions) {
    query.orderBy(orderCondition);
  }

  const results = await query;

  // Convert to FullUI type
  const fullUIs: FullUI[] = await Promise.all(
    results.map(async (result) => {
      // Get user information
      const user = await db
        .select()
        .from(ui)
        .where(eq(ui.id, result.id))
        .innerJoin('users', eq(ui.userId, 'users.id'))
        .then(rows => rows[0]?.users);

      // Get subPrompts
      const subPrompts = await db
        .select()
        .from('sub_prompts')
        .where(eq('sub_prompts.uiId', result.id));

      return {
        ...result,
        user: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          imageUrl: user?.imageUrl,
        },
        subPrompts: subPrompts.map(sp => ({
          ...sp,
          uiId: sp.uiId,
          code: null, // We would need to fetch code separately if needed
        })),
      };
    })
  );

  return fullUIs;
};

export const getUI = async (UIId: string): Promise<FullUI | null> => {
  // Get the UI by ID
  const result = await db
    .select()
    .from(ui)
    .where(eq(ui.id, UIId));

  if (!result || result.length === 0) {
    return null;
  }

  const uiData = result[0];

  // Get user information
  const user = await db
    .select()
    .from(ui)
    .where(eq(ui.id, UIId))
    .innerJoin('users', eq(ui.userId, 'users.id'))
    .then(rows => rows[0]?.users);

  // Get subPrompts
  const subPrompts = await db
    .select()
    .from('sub_prompts')
    .where(eq('sub_prompts.uiId', UIId));

  // Get codes for subPrompts
  const subPromptsWithCode = await Promise.all(
    subPrompts.map(async (sp) => {
      const code = await db
        .select()
        .from('code')
        .where(eq('code.subPromptId', sp.id))
        .then(rows => rows[0]);

      return {
        ...sp,
        code: code ? { id: code.id, code: code.code } : null,
      };
    })
  );

  // Increment view count
  await uiRepository.incrementViewCount(UIId);

  // Return the full UI data
  return {
    ...uiData,
    user: {
      id: user?.id || '',
      firstName: user?.firstName || '',
      imageUrl: user?.imageUrl,
    },
    subPrompts: subPromptsWithCode,
  };
};

export const getUIHome = async (): Promise<FullUI[]> => {
  // Query the database using Drizzle
  const results = await db
    .select()
    .from(ui)
    .orderBy(desc(ui.updatedAt))
    .limit(11);

  // Convert to FullUI type
  const fullUIs: FullUI[] = await Promise.all(
    results.map(async (result) => {
      // Get user information
      const user = await db
        .select()
        .from(ui)
        .where(eq(ui.id, result.id))
        .innerJoin('users', eq(ui.userId, 'users.id'))
        .then(rows => rows[0]?.users);

      // Get subPrompts
      const subPrompts = await db
        .select()
        .from('sub_prompts')
        .where(eq('sub_prompts.uiId', result.id));

      return {
        ...result,
        user: {
          id: user?.id || '',
          firstName: user?.firstName || '',
          imageUrl: user?.imageUrl,
        },
        subPrompts: subPrompts.map(sp => ({
          ...sp,
          code: null, // We would need to fetch code separately if needed
        })),
      };
    })
  );

  return fullUIs;
};

export const getUIProfile = async (
  userId: string,
  start: number,
  limit: number,
  mode: string,
): Promise<FullUI[]> => {
  if (!userId) {
    return [];
  }

  if (mode === "ownUI") {
    // Query the database using Drizzle
    const results = await db
      .select()
      .from(ui)
      .where(eq(ui.userId, userId))
      .orderBy(desc(ui.createdAt))
      .limit(limit)
      .offset(start);

    // Convert to FullUI type
    const fullUIs: FullUI[] = await Promise.all(
      results.map(async (result) => {
        // Get user information
        const user = await db
          .select()
          .from(ui)
          .where(eq(ui.id, result.id))
          .innerJoin('users', eq(ui.userId, 'users.id'))
          .then(rows => rows[0]?.users);

        // Get subPrompts
        const subPrompts = await db
          .select()
          .from('sub_prompts')
          .where(eq('sub_prompts.uiId', result.id));

        return {
          ...result,
          user: {
            id: user?.id || '',
            firstName: user?.firstName || '',
            imageUrl: user?.imageUrl,
          },
          subPrompts: subPrompts.map(sp => ({
            ...sp,
            code: null, // We would need to fetch code separately if needed
          })),
        };
      })
    );

    return fullUIs;
  } else if (mode === "likedUI") {
    // Get liked UIs
    const likedUIs = await db
      .select()
      .from('likes')
      .where(eq('likes.userId', userId))
      .limit(limit)
      .offset(start);

    const uiIds = likedUIs.map((like) => like.uiId);

    if (uiIds.length === 0) {
      return [];
    }

    // Query the database using Drizzle
    const results = await db
      .select()
      .from(ui)
      .where(inArray(ui.id, uiIds));

    // Convert to FullUI type
    const fullUIs: FullUI[] = await Promise.all(
      results.map(async (result) => {
        // Get user information
        const user = await db
          .select()
          .from(ui)
          .where(eq(ui.id, result.id))
          .innerJoin('users', eq(ui.userId, 'users.id'))
          .then(rows => rows[0]?.users);

        // Get subPrompts
        const subPrompts = await db
          .select()
          .from('sub_prompts')
          .where(eq('sub_prompts.uiId', result.id));

        return {
          ...result,
          user: {
            id: user?.id || '',
            firstName: user?.firstName || '',
            imageUrl: user?.imageUrl,
          },
          subPrompts: subPrompts.map(sp => ({
            ...sp,
            code: null, // We would need to fetch code separately if needed
          })),
        };
      })
    );

    return fullUIs;
  }

  return [];
};
