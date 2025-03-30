import "server-only";

import { cookies } from "next/headers";
import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import type { MessageResponseType } from "next-vibe/shared/types/response.schema";

import { db } from "../../../db";
import logoutEndpoint from "./definition";

export const GET = apiHandler({
  endpoint: logoutEndpoint.GET,
  handler: logoutUser,
  email: undefined,
});

async function logoutUser({
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
