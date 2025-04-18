import "server-only";

import { UserRolesRepositoryImpl } from "../../auth/repository";
import type { DbId } from "next-vibe/server/db/types";

export const userRolesRepository = new UserRolesRepositoryImpl();

export async function getUserRolesByUserId(userId: DbId) {
  return await userRolesRepository.findByUserId(userId);
}

export async function getUserRoleByUserIdAndRole(userId: DbId, role: string) {
  return await userRolesRepository.findByUserIdAndRole(userId, role);
}

export async function addUserRole(userId: DbId, role: string, partnerId?: DbId) {
  return await userRolesRepository.addRole(userId, role, partnerId);
}

export async function removeUserRole(userId: DbId, role: string) {
  return await userRolesRepository.removeRole(userId, role);
}

export async function hasUserRole(userId: DbId, role: string) {
  return await userRolesRepository.hasRole(userId, role);
}

export async function deleteUserRolesByUserId(userId: DbId) {
  return await userRolesRepository.deleteByUserId(userId);
}
