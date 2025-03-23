import "server-only";

import { cookies } from "next/headers";
import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "next-query-portal/server";
import { apiHandler } from "next-query-portal/server";
import type {
  MessageResponseType,
  UndefinedType,
} from "next-query-portal/shared";

import { db } from "../../db";
import { logoutEndpoint } from "./logout";

export const GET = apiHandler({
  endpoint: logoutEndpoint,
  handler: logoutUser,
});

export async function logoutUser({
  user,
}: ApiHandlerCallBackProps<UndefinedType, UndefinedType>): Promise<
  SafeReturnType<MessageResponseType>
> {
  // Clear auth cookie
  try {
    (await cookies()).delete("auth-token");
  } catch {
    // empty
  }

  // Remove sessions from database
  try {
    await db.session.deleteMany({ where: { userId: user.id } });
  } catch {
    // empty
  }
  return { success: true, data: "Successfully Signed out!" };
}
