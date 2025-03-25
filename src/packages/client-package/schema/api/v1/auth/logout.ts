import { typedEndpoint } from "@/next-portal/api/endpoint";
import { undefinedSchema } from "@/next-portal/types/common.schema";
import { UserRoleValue } from "@/next-portal/types/enums";
import { messageResponseSchema } from "@/next-portal/types/response.schema";

export const logoutEndpoint = typedEndpoint({
  description: "Logout a user, clear the session and JWT token",
  path: ["v1", "auth", "logout"],
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
    UserRoleValue.DRIVER,
    UserRoleValue.RESTAURANT_ADMIN,
    UserRoleValue.RESTAURANT_EMPLOYEE,
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
