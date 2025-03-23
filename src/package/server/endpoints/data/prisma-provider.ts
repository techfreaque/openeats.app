import { PrismaClient } from "@prisma/client";

import { convertPrismaRole } from "../../../shared/types/enums";
import type { UserRoleResponseType } from "../../../shared/types/user-roles.schema";
import type { DataProvider } from "./data-provider";

/**
 * Prisma implementation of the DataProvider interface
 */
export class PrismaDataProvider implements DataProvider {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  /**
   * Get all roles for a user using Prisma
   */
  async getUserRoles(userId: string): Promise<UserRoleResponseType[]> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId },
      select: { role: true, partnerId: true, id: true },
    });

    // Convert from Prisma's types to our consistent type format
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
    const count = await this.prisma.user.count({
      where: { id: userId },
    });
    return count > 0;
  }

  /**
   * Get the Prisma client instance
   * (For direct access when needed)
   */
  getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}
