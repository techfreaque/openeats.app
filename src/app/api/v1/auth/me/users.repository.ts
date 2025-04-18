import "server-only";

import { UserRepositoryImpl } from "../../auth/repository";
import type { DbId } from "next-vibe/server/db/types";

export const userRepository = new UserRepositoryImpl();

export async function getUserByEmail(email: string) {
  return await userRepository.findByEmail(email);
}

export async function getUserWithRoles(userId: DbId) {
  return await userRepository.findWithRoles(userId);
}

export async function checkUserExists(userId: DbId) {
  return await userRepository.exists(userId);
}

export async function updateUserProfile(id: DbId, data: Partial<any>) {
  return await userRepository.updateProfile(id, data);
}

export async function updateUserPassword(id: DbId, password: string) {
  return await userRepository.updatePassword(id, password);
}
