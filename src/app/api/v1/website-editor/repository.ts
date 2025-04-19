/**
 * Website Editor repository implementation
 * Provides database access for website editor operations
 */

import { and, asc, desc, eq, gte, inArray, like } from "drizzle-orm";
import { db } from "next-vibe/server/db";
import type { DbId } from "next-vibe/server/db/types";
import { errorLogger } from "next-vibe/shared/utils/logger";

import { users } from "../auth/db";
import {
  type Code,
  code,
  likes,
  type NewSubPrompt,
  type SubPrompt,
  subPrompts,
  type Ui,
  ui,
} from "./db";

/**
 * Code repository interface
 */
export interface CodeRepository {
  /**
   * Find code by ID
   * @param id - The code ID
   */
  findById(id: DbId): Promise<Code | undefined>;
}

/**
 * Code repository implementation
 */
export class CodeRepositoryImpl implements CodeRepository {
  /**
   * Find code by ID
   * @param id - The code ID
   */
  async findById(id: DbId): Promise<Code | undefined> {
    try {
      return await db.query.code.findFirst({
        where: eq(code.id, id),
      });
    } catch (error) {
      errorLogger("Error finding code by ID:", error);
      return undefined;
    }
  }
}

/**
 * SubPrompt repository interface
 */
export interface SubPromptRepository {
  /**
   * Find a subprompt by ID
   * @param id - The subprompt ID
   */
  findById(id: DbId): Promise<(SubPrompt & { code: Code }) | undefined>;

  /**
   * Find subprompts by UI ID
   * @param uiId - The UI ID
   */
  findByUiId(uiId: DbId): Promise<(SubPrompt & { code: Code })[]>;

  /**
   * Create a new subprompt
   * @param data - The subprompt data
   * @param codeContent - The code content
   */
  createWithCode(
    data: NewSubPrompt,
    codeContent: string,
  ): Promise<SubPrompt & { code: Code }>;

  /**
   * Generate a new SUB ID based on the parent SUB ID
   * @param uiId - The UI ID
   * @param parentSUBId - The parent SUB ID
   */
  generateNextSubId(uiId: DbId, parentSUBId: string): Promise<string>;
}

/**
 * SubPrompt repository implementation
 */
export class SubPromptRepositoryImpl implements SubPromptRepository {
  /**
   * Find a subprompt by ID
   * @param id - The subprompt ID
   */
  async findById(id: DbId): Promise<(SubPrompt & { code: Code }) | undefined> {
    try {
      // Get the subprompt
      const subPromptResult = await db.query.subPrompts.findFirst({
        where: eq(subPrompts.id, id),
        with: {
          code: true,
        },
      });

      return subPromptResult as (SubPrompt & { code: Code }) | undefined;
    } catch (error) {
      errorLogger("Error finding subprompt by ID:", error);
      return undefined;
    }
  }

  /**
   * Find subprompts by UI ID
   * @param uiId - The UI ID
   */
  async findByUiId(uiId: DbId): Promise<(SubPrompt & { code: Code })[]> {
    try {
      const subPromptsResult = await db.query.subPrompts.findMany({
        where: eq(subPrompts.uiId, uiId),
        with: {
          code: true,
        },
      });

      return subPromptsResult as (SubPrompt & { code: Code })[];
    } catch (error) {
      errorLogger("Error finding subprompts by UI ID:", error);
      return [];
    }
  }

  /**
   * Create a new subprompt
   * @param data - The subprompt data
   * @param codeContent - The code content
   */
  async createWithCode(
    data: NewSubPrompt,
    codeContent: string,
  ): Promise<SubPrompt & { code: Code }> {
    try {
      // Insert the subprompt
      const [newSubPrompt] = await db
        .insert(subPrompts)
        .values(data)
        .returning();

      if (!newSubPrompt) {
        throw new Error("Failed to create subprompt");
      }

      // Insert the code
      const [newCode] = await db
        .insert(code)
        .values({
          code: codeContent,
          subPromptId: newSubPrompt.id,
        })
        .returning();

      if (!newCode) {
        throw new Error("Failed to create code");
      }

      // Return the combined result
      return {
        ...newSubPrompt,
        code: newCode,
      };
    } catch (error) {
      errorLogger("Error creating subprompt with code:", error);
      throw error;
    }
  }

  /**
   * Generate a new SUB ID based on the parent SUB ID
   * @param uiId - The UI ID
   * @param parentSUBId - The parent SUB ID
   */
  async generateNextSubId(uiId: DbId, parentSUBId: string): Promise<string> {
    try {
      // Special case for mode-specific subprompts
      if (
        parentSUBId.startsWith("precise-") ||
        parentSUBId.startsWith("balanced-") ||
        parentSUBId.startsWith("creative-")
      ) {
        return parentSUBId;
      }

      // Extract the base and current number from the parent SUB ID
      const baseSubId = parentSUBId.split("-").slice(0, -1).join("-");
      const currentNumber = parseInt(parentSUBId.split("-").pop() || "0", 10);
      const nextSubIdBase = `${baseSubId}-${currentNumber + 1}`;

      // Check if the next SUB ID already exists
      const existingNextSub = await db.query.subPrompts.findFirst({
        where: (subPrompt) =>
          and(eq(subPrompt.uiId, uiId), eq(subPrompt.subId, nextSubIdBase)),
      });

      // If it doesn't exist, use it
      if (!existingNextSub) {
        return nextSubIdBase;
      }

      // Otherwise, find the highest numbered SUB ID with the same base
      const existingSubPrompts = await db.query.subPrompts.findMany({
        where: (subPrompt) =>
          and(
            eq(subPrompt.uiId, uiId),
            like(subPrompt.subId, `${nextSubIdBase}-%`),
          ),
        orderBy: (subPrompt, { desc }) => [desc(subPrompt.subId)],
        limit: 1,
      });

      // If there are no existing subprompts with the same base, use the next SUB ID with -1
      if (existingSubPrompts.length === 0) {
        return `${nextSubIdBase}-1`;
      }

      // Otherwise, increment the highest number
      const lastSUBId = existingSubPrompts[0].subId;
      const parts = lastSUBId.split("-");
      const lastNumber = parseInt(parts[parts.length - 1], 10);
      parts[parts.length - 1] = (lastNumber + 1).toString();
      return parts.join("-");
    } catch (error) {
      errorLogger("Error generating next SUB ID:", error);
      throw error;
    }
  }
}

/**
 * UI repository interface
 */
export interface UiRepository {
  /**
   * Find a UI by ID
   * @param id - The UI ID
   */
  findById(id: DbId): Promise<Ui | undefined>;

  /**
   * Find a UI by ID with subprompts and code
   * @param id - The UI ID
   */
  findByIdWithSubprompts(id: DbId): Promise<any>;

  /**
   * List UIs with pagination and filtering
   * @param mode - The mode to list UIs (latest, most_liked, most_viewed)
   * @param start - The start index for pagination
   * @param limit - The maximum number of UIs to return
   * @param timeRange - The time range to filter UIs (1h, 24h, 7d, 30d, all)
   */
  listUis(
    mode: string,
    start: number,
    limit: number,
    timeRange: string,
  ): Promise<any[]>;

  /**
   * Get UIs for the home page
   */
  getUiHome(): Promise<any[]>;

  /**
   * Get UIs for a user's profile
   * @param userId - The user ID
   * @param start - The start index for pagination
   * @param limit - The maximum number of UIs to return
   * @param mode - The mode to list UIs (ownUI, likedUI)
   */
  getUiProfile(
    userId: DbId,
    start: number,
    limit: number,
    mode: string,
  ): Promise<any[]>;

  /**
   * Increment the view count of a UI
   * @param id - The UI ID
   */
  incrementViewCount(id: DbId): Promise<void>;

  /**
   * Toggle a like on a UI
   * @param userId - The user ID
   * @param uiId - The UI ID
   */
  toggleLike(userId: DbId, uiId: DbId): Promise<boolean>;

  /**
   * Delete a UI component
   * @param id - The UI ID
   * @param userId - The user ID
   */
  deleteUi(id: DbId, userId: DbId): Promise<void>;

  /**
   * Fork a UI component
   * @param uiId - The UI ID to fork
   * @param userId - The user ID
   */
  forkUi(uiId: DbId, userId: DbId): Promise<any>;
}

/**
 * UI repository implementation
 */
export class UiRepositoryImpl implements UiRepository {
  /**
   * Find a UI by ID
   * @param id - The UI ID
   */
  async findById(id: DbId): Promise<Ui | undefined> {
    try {
      return await db.query.ui.findFirst({
        where: eq(ui.id, id),
      });
    } catch (error) {
      errorLogger("Error finding UI by ID:", error);
      return undefined;
    }
  }

  /**
   * Find a UI by ID with subprompts and code
   * @param id - The UI ID
   */
  async findByIdWithSubprompts(id: DbId): Promise<any> {
    try {
      return await db.query.ui.findFirst({
        where: eq(ui.id, id),
        with: {
          subPrompts: {
            with: {
              code: true,
            },
          },
        },
      });
    } catch (error) {
      errorLogger("Error finding UI by ID with subprompts:", error);
      return undefined;
    }
  }

  /**
   * List UIs with pagination and filtering
   * @param mode - The mode to list UIs (latest, most_liked, most_viewed)
   * @param start - The start index for pagination
   * @param limit - The maximum number of UIs to return
   * @param timeRange - The time range to filter UIs (1h, 24h, 7d, 30d, all)
   */
  async listUis(
    mode: string,
    start: number,
    limit: number,
    timeRange: string,
  ): Promise<any[]> {
    try {
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
      const query = db.select().from(ui).limit(limit).offset(start);

      // Add where conditions if any
      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
      }

      // Add order by conditions
      for (const orderCondition of orderByConditions) {
        query.orderBy(orderCondition);
      }

      const results = await query;

      // Get user information for each UI
      return await Promise.all(
        results.map(async (result) => {
          // Get user information
          const userResult = await db.query.users.findFirst({
            where: eq(users.id, result.userId),
            columns: {
              id: true,
              firstName: true,
              imageUrl: true,
            },
          });

          return {
            ...result,
            user: userResult || {
              id: "",
              firstName: "",
              imageUrl: null,
            },
          };
        }),
      );
    } catch (error) {
      errorLogger("Error listing UIs:", error);
      return [];
    }
  }

  /**
   * Get UIs for the home page
   */
  async getUiHome(): Promise<any[]> {
    try {
      // Query the database using Drizzle
      const results = await db
        .select()
        .from(ui)
        .orderBy(desc(ui.updatedAt))
        .limit(11);

      // Get user information for each UI
      return await Promise.all(
        results.map(async (result) => {
          // Get user information
          const userResult = await db.query.users.findFirst({
            where: eq(users.id, result.userId),
            columns: {
              id: true,
              firstName: true,
              imageUrl: true,
            },
          });

          return {
            ...result,
            user: userResult || {
              id: "",
              firstName: "",
              imageUrl: null,
            },
          };
        }),
      );
    } catch (error) {
      errorLogger("Error getting UIs for home:", error);
      return [];
    }
  }

  /**
   * Get UIs for a user's profile
   * @param userId - The user ID
   * @param start - The start index for pagination
   * @param limit - The maximum number of UIs to return
   * @param mode - The mode to list UIs (ownUI, likedUI)
   */
  async getUiProfile(
    userId: DbId,
    start: number,
    limit: number,
    mode: string,
  ): Promise<any[]> {
    try {
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

        // Get user information for each UI
        return await Promise.all(
          results.map(async (result) => {
            // Get user information
            const userResult = await db.query.users.findFirst({
              where: eq(users.id, result.userId),
              columns: {
                id: true,
                firstName: true,
                imageUrl: true,
              },
            });

            return {
              ...result,
              user: userResult || {
                id: "",
                firstName: "",
                imageUrl: null,
              },
            };
          }),
        );
      } else if (mode === "likedUI") {
        // Get liked UIs
        const likedUIs = await db
          .select()
          .from(likes)
          .where(eq(likes.userId, userId))
          .limit(limit)
          .offset(start);

        const uiIds = likedUIs.map((like) => like.uiId);

        if (uiIds.length === 0) {
          return [];
        }

        // Query the database using Drizzle
        const results = await db.select().from(ui).where(inArray(ui.id, uiIds));

        // Get user information for each UI
        return await Promise.all(
          results.map(async (result) => {
            // Get user information
            const userResult = await db.query.users.findFirst({
              where: eq(users.id, result.userId),
              columns: {
                id: true,
                firstName: true,
                imageUrl: true,
              },
            });

            return {
              ...result,
              user: userResult || {
                id: "",
                firstName: "",
                imageUrl: null,
              },
            };
          }),
        );
      }

      return [];
    } catch (error) {
      errorLogger("Error getting UIs for profile:", error);
      return [];
    }
  }

  /**
   * Increment the view count of a UI
   * @param id - The UI ID
   */
  async incrementViewCount(id: DbId): Promise<void> {
    try {
      await db
        .update(ui)
        .set({
          viewCount: db.sql`${ui.viewCount} + 1`,
        })
        .where(eq(ui.id, id));
    } catch (error) {
      errorLogger("Error incrementing view count:", error);
    }
  }

  /**
   * Toggle a like on a UI
   * @param userId - The user ID
   * @param uiId - The UI ID
   */
  async toggleLike(userId: DbId, uiId: DbId): Promise<boolean> {
    try {
      // Check if the like already exists
      const existingLike = await db.query.likes.findFirst({
        where: (like) => and(eq(like.userId, userId), eq(like.uiId, uiId)),
      });

      if (existingLike) {
        // Delete the like
        await db.delete(likes).where(eq(likes.id, existingLike.id));

        // Decrement the likes count
        await db
          .update(ui)
          .set({
            likesCount: db.sql`${ui.likesCount} - 1`,
          })
          .where(eq(ui.id, uiId));

        return false;
      }

      // Create the like
      await db.insert(likes).values({
        userId,
        uiId,
      });

      // Increment the likes count
      await db
        .update(ui)
        .set({
          likesCount: db.sql`${ui.likesCount} + 1`,
        })
        .where(eq(ui.id, uiId));

      return true;
    } catch (error) {
      errorLogger("Error toggling like:", error);
      throw error;
    }
  }

  /**
   * Delete a UI component
   * @param id - The UI ID
   * @param userId - The user ID
   */
  async deleteUi(id: DbId, userId: DbId): Promise<void> {
    try {
      // Check if the UI exists and belongs to the user
      const uiComponent = await this.findById(id);

      if (!uiComponent) {
        throw new Error("UI component not found");
      }

      if (uiComponent.userId !== userId) {
        throw new Error("Unauthorized");
      }

      // Delete the UI component
      await db.delete(ui).where(eq(ui.id, id));
    } catch (error) {
      errorLogger("Error deleting UI component:", error);
      throw error;
    }
  }

  /**
   * Fork a UI component
   * @param uiId - The UI ID to fork
   * @param userId - The user ID
   */
  async forkUi(uiId: DbId, userId: DbId): Promise<any> {
    try {
      // Check if the UI exists
      const originalUI = await this.findByIdWithSubprompts(uiId);

      if (!originalUI) {
        throw new Error("UI not found");
      }

      // Check if the user is trying to fork their own UI
      if (originalUI.userId === userId) {
        throw new Error("Cannot fork your own UI");
      }

      // Create the forked UI
      const [forkedUI] = await db
        .insert(ui)
        .values({
          userId,
          prompt: originalUI.prompt,
          img: originalUI.img,
          forkedFrom: originalUI.id,
          updatedAt: new Date(),
          uiType: originalUI.uiType,
          public: true,
          viewCount: 0,
          likesCount: 0,
        })
        .returning();

      if (!forkedUI) {
        throw new Error("Failed to fork UI");
      }

      // Create the subprompts for the forked UI
      for (const subPrompt of originalUI.subPrompts) {
        // Create the subprompt
        const [newSubPrompt] = await db
          .insert(subPrompts)
          .values({
            uiId: forkedUI.id,
            subPrompt: subPrompt.subPrompt,
            subId: subPrompt.subId,
            modelId: subPrompt.modelId,
          })
          .returning();

        // Create the code for the subprompt
        await db.insert(code).values({
          code: subPrompt.code.code,
          subPromptId: newSubPrompt.id,
        });
      }

      // Get the complete forked UI with subprompts and code
      return await db.query.ui.findFirst({
        where: eq(ui.id, forkedUI.id),
        with: {
          user: {
            columns: {
              id: true,
              firstName: true,
              imageUrl: true,
            },
          },
          subPrompts: {
            with: {
              code: true,
            },
          },
        },
      });
    } catch (error) {
      errorLogger("Error forking UI component:", error);
      throw error;
    }
  }
}

// Export singleton instances of the repositories
export const codeRepository = new CodeRepositoryImpl();
export const subPromptRepository = new SubPromptRepositoryImpl();
export const uiRepository = new UiRepositoryImpl();
