import "server-only";

import { SessionRepositoryImpl } from "../../auth/repository";
import type { DbId } from "next-vibe/server/db/types";

export const sessionRepository = new SessionRepositoryImpl();

export async function getSessionByToken(token: string) {
  return await sessionRepository.findByToken(token);
}

export async function deleteExpiredSessions() {
  return await sessionRepository.deleteExpired();
}

export async function deleteSessionsByUserId(userId: DbId) {
  return await sessionRepository.deleteByUserId(userId);
}
