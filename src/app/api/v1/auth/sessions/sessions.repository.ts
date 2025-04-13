/**
 * Session repository implementation
 * Provides database access for session-related operations
 */

import { and, eq, gt } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "next-vibe/server/db";
import { ApiRepositoryImpl } from "next-vibe/server/db/repository-postgres";

import type { NewSession, selectSessionSchema, Session } from "./sessions.db";
import { insertSessionSchema, sessions } from "./sessions.db";

/**
 * Session repository interface
 * Extends the base repository with session-specific operations
 */
export interface SessionRepository {
  /**
   * Find a session by token
   * @param token - The session token
   */
  findByToken(token: string): Promise<Session | undefined>;

  /**
   * Find all valid sessions for a user
   * @param userId - The user ID
   */
  findValidByUserId(userId: DbId): Promise<Session[]>;

  /**
   * Create a new session
   * @param userId - The user ID
   * @param token - The session token
   * @param expiresAt - The expiration date
   */
  createSession(userId: DbId, token: string, expiresAt: Date): Promise<Session>;

  /**
   * Invalidate a session
   * @param token - The session token
   */
  invalidateSession(token: string): Promise<boolean>;

  /**
   * Invalidate all sessions for a user
   * @param userId - The user ID
   */
  invalidateAllUserSessions(userId: DbId): Promise<boolean>;

  /**
   * Check if a session is valid
   * @param token - The session token
   */
  isSessionValid(token: string): Promise<boolean>;
}

/**
 * Session repository implementation
 */
export class SessionRepositoryImpl
  extends ApiRepositoryImpl<
    typeof sessions,
    Session,
    NewSession,
    typeof selectSessionSchema
  >
  implements SessionRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(sessions, insertSessionSchema);
  }

  /**
   * Find a session by token
   * @param token - The session token
   */
  async findByToken(token: string): Promise<Session | undefined> {
    const results = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Find all valid sessions for a user
   * @param userId - The user ID
   */
  async findValidByUserId(userId: DbId): Promise<Session[]> {
    const now = new Date();
    return await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, now)));
  }

  /**
   * Create a new session
   * @param userId - The user ID
   * @param token - The session token
   * @param expiresAt - The expiration date
   */
  async createSession(
    userId: DbId,
    token: string,
    expiresAt: Date,
  ): Promise<Session> {
    return await this.create({
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as NewSession);
  }

  /**
   * Invalidate a session
   * @param token - The session token
   */
  async invalidateSession(token: string): Promise<boolean> {
    const results = await db
      .delete(sessions)
      .where(eq(sessions.token, token))
      .returning({ id: sessions.id });

    return results.length > 0;
  }

  /**
   * Invalidate all sessions for a user
   * @param userId - The user ID
   */
  async invalidateAllUserSessions(userId: DbId): Promise<boolean> {
    const results = await db
      .delete(sessions)
      .where(eq(sessions.userId, userId))
      .returning({ id: sessions.id });

    return results.length > 0;
  }

  /**
   * Check if a session is valid
   * @param token - The session token
   */
  async isSessionValid(token: string): Promise<boolean> {
    const now = new Date();
    const results = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)));

    return results.length > 0;
  }
}

/**
 * Session repository singleton instance
 */
export const sessionRepository = new SessionRepositoryImpl();
