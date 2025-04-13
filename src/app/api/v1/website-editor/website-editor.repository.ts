/**
 * Website Editor repository implementation
 * Provides database access for website editor related operations
 */

import { and, eq } from "drizzle-orm";
import { BaseRepositoryImpl } from "next-vibe/server/db/repository";

import { db } from "@/app/api/db";
import type { DbId } from "@/app/api/db/types";

import type {
  Code,
  Like,
  NewCode,
  NewLike,
  NewRestaurantSiteContent,
  NewSubPrompt,
  NewUi,
  RestaurantSiteContent,
  selectCodeSchema,
  selectLikeSchema,
  selectRestaurantSiteContentSchema,
  selectSubPromptSchema,
  selectUiSchema,
  SubPrompt,
  Ui,
} from "./db";
import {
  code,
  insertCodeSchema,
  insertLikeSchema,
  insertRestaurantSiteContentSchema,
  insertSubPromptSchema,
  insertUiSchema,
  likes,
  restaurantSiteContent,
  subPrompts,
  ui,
} from "./db";

/**
 * UI repository interface
 * Extends the base repository with UI-specific operations
 */
export interface UiRepository {
  /**
   * Find UI by ID
   * @param id - The UI ID
   */
  findById(id: DbId): Promise<Ui | undefined>;

  /**
   * Find UIs by user ID
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<Ui[]>;

  /**
   * Increment like count for a UI
   * @param id - The UI ID
   */
  incrementLikeCount(id: DbId): Promise<void>;

  /**
   * Increment view count for a UI
   * @param id - The UI ID
   */
  incrementViewCount(id: DbId): Promise<void>;
}

/**
 * UI repository implementation
 */
export class UiRepositoryImpl
  extends BaseRepositoryImpl<typeof ui, Ui, NewUi, typeof selectUiSchema>
  implements UiRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, ui, insertUiSchema);
  }

  /**
   * Find UI by ID
   * @param id - The UI ID
   */
  override async findById(id: DbId): Promise<Ui | undefined> {
    const results = await db
      .select()
      .from(ui)
      .where(eq(ui.id, id as string));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find UIs by user ID
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<Ui[]> {
    return await db
      .select()
      .from(ui)
      .where(eq(ui.userId, userId as string));
  }

  /**
   * Increment like count for a UI
   * @param id - The UI ID
   */
  async incrementLikeCount(id: DbId): Promise<void> {
    const uiRecord = await this.findById(id);
    if (uiRecord) {
      await db
        .update(ui)
        .set({ likesCount: (uiRecord.likesCount || 0) + 1 })
        .where(eq(ui.id, id as string));
    }
  }

  /**
   * Increment view count for a UI
   * @param id - The UI ID
   */
  async incrementViewCount(id: DbId): Promise<void> {
    const uiRecord = await this.findById(id);
    if (uiRecord) {
      await db
        .update(ui)
        .set({ viewCount: (uiRecord.viewCount || 0) + 1 })
        .where(eq(ui.id, id as string));
    }
  }
}

/**
 * SubPrompt repository interface
 * Extends the base repository with SubPrompt-specific operations
 */
export interface SubPromptRepository {
  /**
   * Find SubPrompt by ID
   * @param id - The SubPrompt ID
   */
  findById(id: DbId): Promise<SubPrompt | undefined>;

  /**
   * Find SubPrompts by UI ID
   * @param uiId - The UI ID
   */
  findByUiId(uiId: DbId): Promise<SubPrompt[]>;
}

/**
 * SubPrompt repository implementation
 */
export class SubPromptRepositoryImpl
  extends BaseRepositoryImpl<
    typeof subPrompts,
    SubPrompt,
    NewSubPrompt,
    typeof selectSubPromptSchema
  >
  implements SubPromptRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, subPrompts, insertSubPromptSchema);
  }

  /**
   * Find SubPrompt by ID
   * @param id - The SubPrompt ID
   */
  override async findById(id: DbId): Promise<SubPrompt | undefined> {
    const results = await db
      .select()
      .from(subPrompts)
      .where(eq(subPrompts.id, id as string));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find SubPrompts by UI ID
   * @param uiId - The UI ID
   */
  async findByUiId(uiId: DbId): Promise<SubPrompt[]> {
    return await db
      .select()
      .from(subPrompts)
      .where(eq(subPrompts.uiId, uiId as string));
  }
}

/**
 * Code repository interface
 * Extends the base repository with Code-specific operations
 */
export interface CodeRepository {
  /**
   * Find Code by ID
   * @param id - The Code ID
   */
  findById(id: DbId): Promise<Code | undefined>;

  /**
   * Find Code by SubPrompt ID
   * @param subPromptId - The SubPrompt ID
   */
  findBySubPromptId(subPromptId: DbId): Promise<Code | undefined>;
}

/**
 * Code repository implementation
 */
export class CodeRepositoryImpl
  extends BaseRepositoryImpl<
    typeof code,
    Code,
    NewCode,
    typeof selectCodeSchema
  >
  implements CodeRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, code, insertCodeSchema);
  }

  /**
   * Find Code by ID
   * @param id - The Code ID
   */
  override async findById(id: DbId): Promise<Code | undefined> {
    const results = await db
      .select()
      .from(code)
      .where(eq(code.id, id as string));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find Code by SubPrompt ID
   * @param subPromptId - The SubPrompt ID
   */
  async findBySubPromptId(subPromptId: DbId): Promise<Code | undefined> {
    const results = await db
      .select()
      .from(code)
      .where(eq(code.subPromptId, subPromptId as string));

    return results.length > 0 ? results[0] : undefined;
  }
}

/**
 * Like repository interface
 * Extends the base repository with Like-specific operations
 */
export interface LikeRepository {
  /**
   * Find Like by ID
   * @param id - The Like ID
   */
  findById(id: DbId): Promise<Like | undefined>;

  /**
   * Find Likes by UI ID
   * @param uiId - The UI ID
   */
  findByUiId(uiId: DbId): Promise<Like[]>;

  /**
   * Find Like by user ID and UI ID
   * @param userId - The user ID
   * @param uiId - The UI ID
   */
  findByUserIdAndUiId(userId: DbId, uiId: DbId): Promise<Like | undefined>;
}

/**
 * Like repository implementation
 */
export class LikeRepositoryImpl
  extends BaseRepositoryImpl<
    typeof likes,
    Like,
    NewLike,
    typeof selectLikeSchema
  >
  implements LikeRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, likes, insertLikeSchema);
  }

  /**
   * Find Like by ID
   * @param id - The Like ID
   */
  override async findById(id: DbId): Promise<Like | undefined> {
    const results = await db
      .select()
      .from(likes)
      .where(eq(likes.id, id as string));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find Likes by UI ID
   * @param uiId - The UI ID
   */
  async findByUiId(uiId: DbId): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.uiId, uiId as string));
  }

  /**
   * Find Like by user ID and UI ID
   * @param userId - The user ID
   * @param uiId - The UI ID
   */
  async findByUserIdAndUiId(
    userId: DbId,
    uiId: DbId,
  ): Promise<Like | undefined> {
    const results = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.userId, userId as string), eq(likes.uiId, uiId as string)),
      );

    return results.length > 0 ? results[0] : undefined;
  }
}

/**
 * RestaurantSiteContent repository interface
 * Extends the base repository with RestaurantSiteContent-specific operations
 */
export interface RestaurantSiteContentRepository {
  /**
   * Find RestaurantSiteContent by ID
   * @param id - The RestaurantSiteContent ID
   */
  findById(id: DbId): Promise<RestaurantSiteContent | undefined>;

  /**
   * Find RestaurantSiteContent by restaurant ID
   * @param restaurantId - The restaurant ID
   */
  findByRestaurantId(restaurantId: DbId): Promise<RestaurantSiteContent[]>;

  /**
   * Find RestaurantSiteContent by restaurant ID and key
   * @param restaurantId - The restaurant ID
   * @param key - The content key
   */
  findByRestaurantIdAndKey(
    restaurantId: DbId,
    key: string,
  ): Promise<RestaurantSiteContent | undefined>;
}

/**
 * RestaurantSiteContent repository implementation
 */
export class RestaurantSiteContentRepositoryImpl
  extends BaseRepositoryImpl<
    typeof restaurantSiteContent,
    RestaurantSiteContent,
    NewRestaurantSiteContent,
    typeof selectRestaurantSiteContentSchema
  >
  implements RestaurantSiteContentRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(db, restaurantSiteContent, insertRestaurantSiteContentSchema);
  }

  /**
   * Find RestaurantSiteContent by ID
   * @param id - The RestaurantSiteContent ID
   */
  override async findById(
    id: DbId,
  ): Promise<RestaurantSiteContent | undefined> {
    const results = await db
      .select()
      .from(restaurantSiteContent)
      .where(eq(restaurantSiteContent.id, id as string));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find RestaurantSiteContent by restaurant ID
   * @param restaurantId - The restaurant ID
   */
  async findByRestaurantId(
    restaurantId: DbId,
  ): Promise<RestaurantSiteContent[]> {
    return await db
      .select()
      .from(restaurantSiteContent)
      .where(eq(restaurantSiteContent.restaurantId, restaurantId as string));
  }

  /**
   * Find RestaurantSiteContent by restaurant ID and key
   * @param restaurantId - The restaurant ID
   * @param key - The content key
   */
  async findByRestaurantIdAndKey(
    restaurantId: DbId,
    key: string,
  ): Promise<RestaurantSiteContent | undefined> {
    const results = await db
      .select()
      .from(restaurantSiteContent)
      .where(
        and(
          eq(restaurantSiteContent.restaurantId, restaurantId as string),
          eq(restaurantSiteContent.key, key),
        ),
      );

    return results.length > 0 ? results[0] : undefined;
  }
}

// Repository instances
export const uiRepository = new UiRepositoryImpl();
export const subPromptRepository = new SubPromptRepositoryImpl();
export const codeRepository = new CodeRepositoryImpl();
export const likeRepository = new LikeRepositoryImpl();
export const restaurantSiteContentRepository =
  new RestaurantSiteContentRepositoryImpl();
