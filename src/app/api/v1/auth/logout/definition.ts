import { createEndpoint } from "next-vibe/client/endpoint";
import { undefinedSchema } from "next-vibe/shared/types/common.schema";
import { Methods } from "next-vibe/shared/types/endpoint";
import { UserRoleValue } from "next-vibe/shared/types/enums";
import { messageResponseSchema } from "next-vibe/shared/types/response.schema";

const logoutEndpoint = createEndpoint({
  description: "Logout a user, clear the session and JWT token",
  path: ["v1", "auth", "logout"],
  method: Methods.GET,
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
export default logoutEndpoint;
