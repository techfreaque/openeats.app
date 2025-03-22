import type { UserRoleValue } from "../../../shared/types/enums";
import type { UserRoleResponseType } from "../../../shared/types/user-roles.schema";

/**
 * Abstract data provider interface
 * This allows the library to work with any database or data source
 */
export interface DataProvider {
  /**
   * Get all roles for a user
   */
  getUserRoles(userId: string): Promise<UserRoleResponseType[]>;

  /**
   * Check if a user exists
   */
  userExists?(userId: string): Promise<boolean>;
}

/**
 * Global data provider instance
 */
let _dataProvider: DataProvider | null = null;

/**
 * Set the data provider implementation
 */
export function setDataProvider(provider: DataProvider): void {
  _dataProvider = provider;
}

/**
 * Get the configured data provider
 * Throws an error if not initialized
 */
export function getDataProvider(): DataProvider {
  if (!_dataProvider) {
    throw new Error(
      "DataProvider not initialized. Call initApiLibrary() with a data provider before using API functions.",
    );
  }
  return _dataProvider;
}

/**
 * Helper function to check if a user has a specific role
 */
export function hasRole(
  roles: UserRoleResponseType[],
  role: UserRoleValue,
  restaurantId?: string,
): boolean {
  return roles.some(
    (r) =>
      r.role === role &&
      (restaurantId ? r.restaurantId === restaurantId : true),
  );
}

/**
 * Mock data provider for testing or simple applications
 * that don't need a database
 */
export class MockDataProvider implements DataProvider {
  private roles: Record<string, UserRoleResponseType[]> = {};

  constructor(mockData?: Record<string, UserRoleResponseType[]>) {
    this.roles = mockData || {};
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUserRoles(userId: string): Promise<UserRoleResponseType[]> {
    return this.roles[userId] || [];
  }

  setUserRoles(userId: string, roles: UserRoleResponseType[]): void {
    this.roles[userId] = roles;
  }
}
