import { createEndpoint } from "next-query-portal/client";
import { undefinedSchema, UserRoleValue } from "next-query-portal/shared";

import { loginResponseSchema } from "../public/login/login.schema";

export const meEndpoint = createEndpoint({
  description: "Get current authenticated user's information",
  dirname: __dirname,
  method: "GET",
  requestSchema: undefinedSchema,
  responseSchema: loginResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: undefined,
  apiQueryOptions: {
    queryKey: ["user"],
  },
  allowedRoles: [
    UserRoleValue.CUSTOMER,
    UserRoleValue.ADMIN,
    UserRoleValue.COURIER,
    UserRoleValue.PARTNER_ADMIN,
    UserRoleValue.PARTNER_EMPLOYEE,
  ],
  errorCodes: {
    401: "Not authenticated",
    500: "Internal server error",
  },
  examples: {
    urlPathVariables: undefined,
    payloads: undefined,
  },
});
