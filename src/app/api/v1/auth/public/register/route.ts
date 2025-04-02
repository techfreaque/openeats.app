import "server-only";

import { hash } from "bcrypt";
import type {
  ApiHandlerCallBackProps,
  SafeReturnType,
} from "next-vibe/server/endpoints/core/api-handler";
import { apiHandler } from "next-vibe/server/endpoints/core/api-handler";
import type { UndefinedType } from "next-vibe/shared/types/common.schema";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { db } from "../../../../db";
import { loginUser } from "../login/route-handler";
import type { LoginResponseInputType } from "../login/schema";
import registerEndpoint from "./definition";
import { renderRegisterMail } from "./email";
import type { RegisterType } from "./schema";

export const POST = apiHandler({
  endpoint: registerEndpoint.POST,
  handler: registerUser,
  email: {
    afterHandlerEmails: [
      {
        render: renderRegisterMail,
        ignoreErrors: false,
      },
    ],
  },
});

/**
 * Register a new user
 */
async function registerUser(
  props: ApiHandlerCallBackProps<RegisterType, UndefinedType>,
): Promise<SafeReturnType<LoginResponseInputType>> {
  const { success, message, errorCode } = await createUser(props.data);
  if (success) {
    return await loginUser(props);
  }
  return { success: false, message, errorCode };
}

export async function createUser(
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
  if (id) {
    await db.user.upsert({
      where: { id },
      create: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        imageUrl: imageUrl ?? null,
        userRoles: {
          create: {
            role: role,
          },
        },
      },
      update: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        imageUrl: imageUrl ?? null,
        userRoles: {
          create: { role },
          connect: {
            id: id,
          },
        },
      },
      select: { id: true },
    });
  } else {
    await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        imageUrl: imageUrl ?? null,
        userRoles: {
          create: { role },
        },
      },
    });
  }
  return { success: true, data: undefined };
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10);
}
