import "server-only";

import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";

import { db } from "../../../db";
import { createSessionAndGetUser } from "../public/login/route";
import type { LoginResponseType } from "../public/login/schema";
import meEndpoint from "./definition";
import type { UserResponseType } from "./schema/user.schema";

export const GET = apiHandler({
  endpoint: meEndpoint.GET,
  handler: getUser,
  email: undefined,
});

async function getUser({
  user,
}: ApiHandlerCallBackProps<UndefinedType, UndefinedType>): Promise<
  SafeReturnType<LoginResponseType>
> {
  return createSessionAndGetUser(user.id);
}

export interface FullUser extends UserResponseType {
  password: string;
}

export async function getFullUser(userId: string): Promise<FullUser> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      imageUrl: true,
      userRoles: {
        select: {
          role: true,
          id: true,
          partnerId: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}
