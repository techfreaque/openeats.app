import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";

import { loginResponseSchema, loginSchema } from "./schema";

/**
 * Login API endpoint definition
 * Provides user authentication functionality
 */

const loginEndpoint = createEndpoint({
  description: "Authenticate a user and generate a JWT token",
  path: ["v1", "auth", "public", "login"],
  method: Methods.POST,
  requestSchema: loginSchema,
  requestUrlSchema: undefinedSchema,
  responseSchema: loginResponseSchema,
  apiQueryOptions: {
    queryKey: ["user"],
  },
  fieldDescriptions: {
    email: "User's email address",
    password: "User's password",
  },
  errorCodes: {
    400: "Invalid request data",
    401: "Invalid credentials",
    500: "Internal server error",
  },
  allowedRoles: [UserRoleValue.PUBLIC],
  examples: {
    payloads: {
      default: {
        email: "customer@example.com",
        password: "password",
      },
    },
    urlPathVariables: undefined,
    responses: {
      default: {
        user: {
          id: "user-id",
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          imageUrl: "/placeholder.svg",
          userRoles: [
            {
              id: "role-id",
              role: "CUSTOMER",
              partnerId: null,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: "jwt-token-example",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
});

/**
 * Login API endpoints
 */
const definition = {
  ...loginEndpoint,
};

export default definition;
