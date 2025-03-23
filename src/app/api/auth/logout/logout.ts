import { createEndpoint } from "next-query-portal/client";
import {
  messageResponseSchema,
  undefinedSchema,
  UserRoleValue,
} from "next-query-portal/shared";

export const logoutEndpoint = createEndpoint({
  description: "Logout a user, clear the session and JWT token",
  dirname: __dirname,
  method: "GET",
  requestSchema: undefinedSchema,
  responseSchema: messageResponseSchema,
  requestUrlSchema: undefinedSchema,
  fieldDescriptions: undefined,
  apiQueryOptions: {
    queryKey: ["logout"],
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
