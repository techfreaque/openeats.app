/**
 * User roles repository implementation
 * Provides database access for user role-related operations
 */

import { and, eq } from "drizzle-orm";

import { db } from "@/app/api/db";
import { ApiRepositoryImpl } from "@/app/api/db/repository";
import type { DbId } from "next-vibe/server/db/types";

import type { NewUserRole, selectUserRoleSchema, UserRole } from "./roles.db";
import { insertUserRoleSchema, userRoles } from "./roles.db";

/**
 * User roles repository interface
 * Extends the base repository with user role-specific operations
 */
export interface UserRolesRepository {
  /**
   * Find all roles for a user
   * @param userId - The user ID
   */
  findByUserId(userId: DbId): Promise<UserRole[]>;

  /**
   * Find a role by user ID and role value
   * @param userId - The user ID
   * @param role - The role value
   */
  findByUserIdAndRole(
    userId: DbId,
    role: string,
  ): Promise<UserRole | undefined>;

  /**
   * Add a role to a user
   * @param userId - The user ID
   * @param role - The role value
   * @param partnerId - The partner ID (optional)
   */
  addRole(userId: DbId, role: string, partnerId?: DbId): Promise<UserRole>;

  /**
   * Remove a role from a user
   * @param userId - The user ID
   * @param role - The role value
   */
  removeRole(userId: DbId, role: string): Promise<boolean>;

  /**
   * Check if a user has a specific role
   * @param userId - The user ID
   * @param role - The role value
   */
  hasRole(userId: DbId, role: string): Promise<boolean>;
}

/**
 * User roles repository implementation
 */
export class UserRolesRepositoryImpl
  extends ApiRepositoryImpl<
    typeof userRoles,
    UserRole,
    NewUserRole,
    typeof selectUserRoleSchema
  >
  implements UserRolesRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(userRoles, insertUserRoleSchema);
  }

  /**
   * Find all roles for a user
   * @param userId - The user ID
   */
  async findByUserId(userId: DbId): Promise<UserRole[]> {
    return await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
  }

  /**
   * Find a role by user ID and role value
   * @param userId - The user ID
   * @param role - The role value
   */
  async findByUserIdAndRole(
    userId: DbId,
    role: string,
  ): Promise<UserRole | undefined> {
    const results = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));

    return results.length > 0 ? results[0] : undefined;
  }

  /**
   * Add a role to a user
   * @param userId - The user ID
   * @param role - The role value
   * @param partnerId - The partner ID (optional)
   */
  async addRole(
    userId: DbId,
    role: string,
    partnerId?: DbId,
  ): Promise<UserRole> {
    // Check if the role already exists
    const existingRole = await this.findByUserIdAndRole(userId, role);
    if (existingRole) {
      return existingRole;
    }

    // Create the role
    return await this.create({
      userId,
      role,
      partnerId,
    } as NewUserRole);
  }

  /**
   * Remove a role from a user
   * @param userId - The user ID
   * @param role - The role value
   */
  async removeRole(userId: DbId, role: string): Promise<boolean> {
    const results = await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)))
      .returning({ id: userRoles.id });

    return results.length > 0;
  }

  /**
   * Check if a user has a specific role
   * @param userId - The user ID
   * @param role - The role value
   */
  async hasRole(userId: DbId, role: string): Promise<boolean> {
    const existingRole = await this.findByUserIdAndRole(userId, role);
    return !!existingRole;
  }
}

/**
 * User roles repository singleton instance
 */
export const userRolesRepository = new UserRolesRepositoryImpl();
