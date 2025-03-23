import type { DataProvider } from "next-query-portal/server/endpoints/data";
import type { UserRoleResponseType } from "next-query-portal/shared";

import { UserRoleValue } from "../shared/types/enums";
import type { MockTestData } from "./types";

/**
 * Test data provider for API testing
 */
export class TestDataProvider implements DataProvider {
  private roles: { [userId: string]: UserRoleResponseType[] };
  private userExistsData: { [userId: string]: boolean };
  private mockData: MockTestData;

  constructor(mockData?: MockTestData) {
    this.mockData = mockData || {};
    this.roles = {};
    this.userExistsData = {};

    // Set up default test users with roles
    this.setUserRoles("admin", [
      { id: "role-admin", role: UserRoleValue.ADMIN },
    ]);

    this.setUserRoles("customer", [
      { id: "role-customer", role: UserRoleValue.CUSTOMER },
    ]);

    this.setUserRoles("restaurant-admin", [
      {
        id: "role-restaurant",
        role: UserRoleValue.PARTNER_ADMIN,
        partnerId: "restaurant1",
      },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUserRoles(userId: string): Promise<UserRoleResponseType[]> {
    return this.roles[userId] || [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async userExists(userId: string): Promise<boolean> {
    return this.userExistsData[userId] ?? !!this.roles[userId];
  }

  setUserRoles(userId: string, roles: UserRoleResponseType[]): void {
    this.roles[userId] = roles;
    // Automatically mark this user as existing
    this.userExistsData[userId] = true;
  }

  setUserExists(userId: string, exists: boolean): void {
    this.userExistsData[userId] = exists;
  }

  getData<T extends { id: string }>(collectionName: string): T[] | undefined {
    return this.mockData[collectionName] as T[] | undefined;
  }

  setData<T extends { id: string }>(collectionName: string, data: T[]): void {
    this.mockData[collectionName] = data as unknown as Array<{
      id: string;
      [key: string]: unknown;
    }>;
  }
}
