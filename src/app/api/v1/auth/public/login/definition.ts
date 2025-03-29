import { createEndpoint } from "next-query-portal/client/endpoint";
import { undefinedSchema } from "next-query-portal/shared/types/common.schema";
import { Methods } from "next-query-portal/shared/types/endpoint";
import { UserRoleValue } from "next-query-portal/shared/types/enums";

import { loginResponseSchema, loginSchema } from "./schema";

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
        id: "1",
        email: "customer@example.com",
        password: "password",
      },
    },
    urlPathVariables: undefined,
  },
});

export default loginEndpoint;
