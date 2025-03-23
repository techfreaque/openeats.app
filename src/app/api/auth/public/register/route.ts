import "server-only";

import { hash } from "bcrypt";
import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "next-query-portal/server";
import { apiHandler } from "next-query-portal/server";
import type { UndefinedType } from "next-query-portal/shared";
import { UserRoleValue } from "next-query-portal/shared";

import { db } from "../../../db";
import type { LoginResponseType } from "../login/login.schema";
import { loginUser } from "../login/route";
import { registerEndpoint } from "./definition";
import type { RegisterType } from "./schema";

export const POST = apiHandler({
  endpoint: registerEndpoint,
  handler: registerUser,
});

/**
 * Register a new user
 */
async function registerUser(
  props: ApiHandlerCallBackProps<RegisterType, UndefinedType>,
): Promise<SafeReturnType<LoginResponseType>> {
  const { success, message, errorCode } = await createUser(props.data);
  if (success) {
    return loginUser(props);
  }
  return { success: false, message, errorCode };
}

async function createUser(
  userData: RegisterType & { id?: string },
  role: UserRoleValue = UserRoleValue.CUSTOMER,
): Promise<SafeReturnType<UndefinedType>> {
  const {
    email,
    password,
    firstName,
    lastName,
    imageUrl,
    confirmPassword,
    id,
  } = userData;
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      success: false,
      message: "Email already registered",
      errorCode: 400,
    };
  }
  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match",
      errorCode: 400,
    };
  }
  const hashedPassword = await hashPassword(password);
  await db.user.upsert({
    where: { id: id || undefined },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      imageUrl,
      userRoles: {
        create: { role },
      },
    },
    update: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      userRoles: {
        create: { role },
      },
    },
    select: { id: true },
  });
  return { success: true, data: undefined };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}
