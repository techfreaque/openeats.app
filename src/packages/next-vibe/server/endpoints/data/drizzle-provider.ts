import { db } from "next-vibe/server/db";
import { userRepository } from "@/app/api/v1/auth/me/users.repository";
import { userRolesRepository } from "@/app/api/v1/auth/roles/roles.repository";

import { convertPrismaRole } from "../../../shared/types/enums";
import type { UserRoleResponseType } from "../../../shared/types/user-roles.schema";
import type { DataProvider } from "./data-provider";

/**
 * Drizzle implementation of the DataProvider interface
 */
export class DrizzleDataProvider implements DataProvider {
  /**
   * Get all roles for a user using Drizzle
   */
  async getUserRoles(userId: string): Promise<UserRoleResponseType[]> {
    const roles = await userRolesRepository.findByUserId(userId);

    // Convert from database types to our consistent type format
    return roles.map((role) => ({
      id: role.id,
      role: convertPrismaRole(role.role),
      partnerId: role.partnerId,
    }));
  }

  /**
   * Check if a user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    return !!user;
  }

  /**
   * Get the Drizzle client instance
   * (For direct access when needed)
   */
  getDbClient() {
    return db;
  }
}

export enum DrizzleDatabaseProvider {
  SQLITE = "sqlite",
  POSTGRESQL = "postgresql",
  MYSQL = "mysql",
  MONGODB = "mongodb",
}
