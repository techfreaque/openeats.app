import { createEndpoint } from "next-query-portal/client";
import { undefinedSchema, UserRoleValue } from "next-query-portal/shared";

import { loginResponseSchema, loginSchema } from "./login.schema";

export const loginEndpoint = createEndpoint({
  description: "Authenticate a user and generate a JWT token",
  dirname: __dirname,
  method: "POST",
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
        id: "1",
        email: "customer@example.com",

        password: "password",
      },
    },
    urlPathVariables: undefined,
  },
});
