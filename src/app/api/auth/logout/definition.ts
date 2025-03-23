import { createEndpoint } from "next-query-portal/client/endpoint";
import { undefinedSchema } from "next-query-portal/shared/types/common.schema";
import { UserRoleValue } from "next-query-portal/shared/types/enums";
import { messageResponseSchema } from "next-query-portal/shared/types/response.schema";

const logoutEndpoint = createEndpoint({
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
export default logoutEndpoint;
