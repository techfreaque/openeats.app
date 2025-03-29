import "server-only";

import { compare } from "bcrypt";
import { cookies } from "next/headers";
import type { JwtPayloadType } from "next-query-portal/server/endpoints/auth/jwt";
import { signJwt } from "next-query-portal/server/endpoints/auth/jwt";
import {
  type ApiHandlerCallBackProps,
  type SafeReturnType,
} from "next-query-portal/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-query-portal/shared/types/common.schema";

import { env } from "../../../../../../config/env";
import { db } from "../../../../db";
import { getFullUser } from "../../me/route-handler/get-me";
import type { LoginFormType, LoginResponseType } from "./schema";

/**
 * Authenticate user with credentials
 */

export async function loginUser({
  data,
}: ApiHandlerCallBackProps<LoginFormType, UndefinedType>): Promise<
  SafeReturnType<LoginResponseType>
> {
  const { email, password } = data;
  const minimalUser = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });
  if (!minimalUser) {
    return {
      success: false,
      message: "Invalid email or password",
      errorCode: 401,
    };
  }
  const isPasswordValid = await compare(password, minimalUser.password);
  if (!isPasswordValid) {
    return {
      success: false,
      message: "Invalid email or password",
      errorCode: 401,
    };
  }
  return createSessionAndGetUser(minimalUser.id);
}

export async function createSessionAndGetUser(
  userId: string,
): Promise<SafeReturnType<LoginResponseType>> {
  const user = await getFullUser(userId);
  // JWT payload
  const tokenPayload: JwtPayloadType = {
    id: user.id,
  };

  const token = await signJwt(tokenPayload);

  const cookiesStore = await cookies();
  cookiesStore.set({
    name: "token",
    value: token,
    httpOnly: true,
    path: "/",
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  return {
    success: true,
    data: {
      user,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  };
}
